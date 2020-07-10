"use strict";
// model_credit

var sqlite3 = require('sqlite3').verbose();
var db = undefined;
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

exports.initSqlite = function(){
	db = new sqlite3.Database("credit.sqlite3", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        function(err){
            if (err) {console.log('FAIL ' + err);}
        });
	db.configure("busyTimeout", 2000);
	db.run("CREATE TABLE IF NOT EXISTS credit " +
        "(rowid INTEGER PRIMARY KEY AUTOINCREMENT, usrid INTEGER NOT NULL, cre REAL NOT NULL " +  
		");");
	db.run("CREATE TABLE IF NOT EXISTS trans " +
        "(rowid INTEGER PRIMARY KEY AUTOINCREMENT, fromid INTEGER NOT NULL, toid INTEGER NOT NULL, " +  
		"amount REAL NOT NULL, fee REAL, time TEXT NOT NULL, title TEXT, note TEXT);");
}

// activate one user and set credit to 0
// usrId: user id
// callback: (err)
exports.activateUser = function(usrId, callback){
	var add = db.prepare("INSERT INTO credit VALUES " +
		"(NULL, ?, 0.0);");
	add.run([usrId], callback)
}

function sub_createRecord(fromId, toId, amount, fee, title, note, callback){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var modTime = year+' '+month+' '+day+' '+hour+' '+minute;
	var add = db.prepare("INSERT INTO trans VALUES " +
		"(NULL, ?, ?, ?, ?, ?, ?, ?);");
	add.run([fromId, toId, amount, fee, modTime, title, note], callback)
}
exports.createRecord = sub_createRecord;

// find one user
// usrId: user id
// callback: (row)
function sub_findOneUserFromUsrId(usrId, callback){
	db.get("SELECT * FROM credit WHERE " +
		"usrid = ?;", [usrId], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}
exports.findOneUserFromUsrId = sub_findOneUserFromUsrId;

// update credit of one user
// id: user id
// credit: credit
// callback: (err)
function sub_updateOneUser(id, credit, callback){
	var update = db.prepare("UPDATE credit " +
		"SET cre = ? " +
		"WHERE usrid = ?;");
	update.run([credit, id], callback);
}
exports.updateOneUser = sub_updateOneUser;

// add credit
// usrid: user id
// amount: add amount
// callback: (err)
function sub_creditAdd(usrId, amount, callback){
	lock.acquire(usrId, function(cb){
		sub_findOneUserFromUsrId(usrId, function(row){
			if (row){
				var newCre = row.cre + amount;
				db.run("BEGIN;")
				sub_updateOneUser(usrId, newCre, cb);
				sub_createRecord(-1, usrId, amount, 0, "Top up", "", cb);
				db.run("COMMIT", cb);
			}
			else{
				cb("NOT_FOUND");
			}
		});
	}, function(err, ret) {
		callback(err);
	});
}
exports.creditAdd = sub_creditAdd;

// spend credit
// usrid: user id
// amount: decrease amount
// callback: (err)
function sub_creditMinus(usrId, amount, callback){
	lock.acquire(usrId, function(cb){
		sub_findOneUserFromUsrId(usrId, function(row){
			if (row){
				var newCre = row.cre - amount;
				if (newCre < 0){
					cb("NOT_ENOUGH");
				}
				else{
					db.run("BEGIN;")
					sub_updateOneUser(usrId, newCre, cb);
					sub_createRecord(usrId, -1, amount, 0, "Penalty", "", cb);
					db.run("COMMIT", cb);
				}
			}
			else{
				cb("NOT_FOUND");
			}
		});
	}, function(err, ret) {
		callback(err);
	});
}
exports.creditMinus = sub_creditMinus;

// transfer credit
// fromId: user id 1
// toId: user id 2
// amount: spent amount
// fee: handling fee
// callback: (err)
function sub_creditTransfer(fromId, toId, amount, fee, callback){
	lock.acquire([fromId, toId], function(cb){
		sub_findOneUserFromUsrId(fromId, function(row1){
			if (row1.cre - amount > 0){
				var cre_a = row1.cre - amount;
				if (toId == "admin"){
					//console.log(cre_a);
					db.run("BEGIN");
					db.run("UPDATE credit SET cre = ? WHERE usrid = ?;", [cre_a, fromId], cb);
					sub_createRecord(fromId, -1, amount, fee, "Purchase", "", cb);
					db.run("COMMIT", cb);
				}else{
					sub_findOneUserFromUsrId(toId, function(row2){
						var increase = amount - fee;
						if (increase < 0){increase = 0;}
						var cre_b = row2.cre + increase;
						db.run("BEGIN");
						db.run("UPDATE credit SET cre = ? WHERE usrid = ?;", [cre_a, fromId]);
						db.run("UPDATE credit SET cre = ? WHERE usrid = ?;", [cre_b, toId]);
						sub_createRecord(fromId, toId, amount, fee, "Transfer", "", cb);
						db.run("COMMIT", cb);
					});
				}
			}
			else{
				cb("NOT_ENOUGH");
			}
		});
	}, function(err, ret) {
		callback(err);
	});
}
exports.creditTransfer = sub_creditTransfer;

function sub_findRecordInPageFromUserId(userId, pageSize, page, callback){
	db.all("SELECT * FROM trans WHERE " +
		"fromid = ? OR toid = ? ORDER BY rowid DESC LIMIT ? OFFSET ?;", [userId, userId, pageSize, (pageSize*page)], function(err, rows){
		if (err){
			callback(null);
		}else{
			if (rows.length){
				callback(rows);
			}
			else{callback(null);}
		}
	});
}
exports.findRecordInPageFromUserId = sub_findRecordInPageFromUserId;

exports.findRecordCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM trans WHERE " +
		"fromid = ? OR toid = ?;");
	find.all([userId, userId], function(err, rows){
			if (err){
				callback(0);
			}else{
				callback(rows.length);
			}
		});
}

