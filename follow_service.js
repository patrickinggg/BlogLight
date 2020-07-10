"use strict";
// model_blog_follow

var sqlite3 = require('sqlite3').verbose();
var db = undefined;

exports.initSqlite = function(){
	db = new sqlite3.Database("follow.sqlite3", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        function(err){
            if (err) {console.log('FAIL ' + err);}
        });
	db.run("CREATE TABLE IF NOT EXISTS follow " +
        "(rowid INTEGER PRIMARY KEY AUTOINCREMENT, fanid INTEGER NOT NULL, upid INTEGER NOT NULL, " +  
		"createtime TEXT NOT NULL);");
}

// follow one uploader
// fromId: follower's user id
// toId: uploader's user id
// callback: (err)
exports.follow = function(fromId, toId, callback){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var createTime = year+' '+month+' '+day+' '+hour+' '+minute;
	var add = db.prepare("INSERT INTO follow VALUES " +
		"(NULL, ?, ?, ?);");
	add.run([fromId, toId, createTime], callback)
}

// unfollow one uploader
// rowId: rowId
// callback: (err)
exports.unfollow = function(rowId, callback){
	var del = db.prepare("DELETE FROM follow WHERE " +
		"rowid = ?;");
	del.run([rowId], callback)
}

// search all my following users
// userId: user id
// callback: (row)
exports.findAllFollowingFromUserId = function(userId, callback){	
	db.all("SELECT * FROM follow WHERE " +
		"fanid = ?;", [userId], function(err, rows){
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

// search all my following users in pages
// userId: user id
// pageSize: how many rows one page displays
// pageIdx: page index
// callback: (row)
exports.findFollowingPageFromUserId = function(userId, pageSize, pageIdx, callback){	
	db.all("SELECT * FROM follow WHERE " +
		"fanid = ? LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*pageIdx)], function(err, rows){
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

// return the count of my following
// userId: user id
// callback: (row)
exports.findFollowingCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM follow WHERE " +
		"fanid = ?;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

// search all my fans
// userId: user id
// callback: (row)
exports.findAllFollowerFromUserId = function(userId, callback){	
	db.all("SELECT * FROM follow WHERE " +
		"upid = ?;", [userId], function(err, rows){
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

// search all my fans in pages
// userId: user id
// pageSize: how many rows one page displays
// pageIdx: page index
// callback: (row)
exports.findFollowerPageFromUserId = function(userId, pageSize, pageIdx, callback){	
	db.all("SELECT * FROM follow WHERE " +
		"upid = ? LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*pageIdx)], function(err, rows){
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

// return the count of my fans
// userId: user id
// callback: (row)
exports.findFollowerCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM follow WHERE " +
		"upid = ?;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

// get exact one follow record
// fromId: follower's user id
// toId: uploader's user id
// callback: (row)
exports.findExactFollowRecord = function(fromId, toId, callback){
	db.get("SELECT * FROM follow WHERE " +
		"fanid = ? AND upid = ?;", [fromId, toId], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}