"use strict";
// model_user

var sqlite3 = require('sqlite3').verbose();
var db = undefined;

exports.initSqlite = function(){
	db = new sqlite3.Database("userInfo.sqlite3", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        function(err){
            if (err) {console.log('FAIL ' + err);}
        });
	db.run("CREATE TABLE IF NOT EXISTS users " +
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(32) NOT NULL, " +
		"pwd TEXT NOT NULL, email TEXT NOT NULL, status INTEGER NOT NULL);");
}

// add one new user into the database
// name: username
// pwd: password
// email: email address
// callback: (err)
exports.addUser = function(name, pwd, email, callback){
	var add = db.prepare("INSERT INTO users VALUES " +
		"(NULL, ?, ?, ?, 1);");
	add.run([name, pwd, email], callback);
}

// disable one user but not delete it
// id: user id
// callback: (err)
exports.disableUser = function(id, callback){
	var disable = db.prepare("UPDATE users " +
		"SET status = 0 WHERE id = ?;");
	disable.run([id], callback);
}

// search the first user using id
// id: user id
// callback: (row)
exports.findOneUserFromId = function(id, callback){
	db.get("SELECT * FROM users WHERE " +
		"id = ?;", [id], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}

// search the first user using id
// id: user id
// callback: (row)
exports.findOneUserFromName = function(name, callback){
	db.get("SELECT * FROM users WHERE " +
		"name = ?;", [name], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}

// search the first user using email address
// email: email address
// callback: (row)
exports.findOneUserFromEmail = function(email, callback){
	db.get("SELECT * FROM users WHERE " +
		"email = ?;", [email], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}

// update one userinfo
// id: user id
// newName: username
// newPwd: password
// newEmail: email address
// callback: (err)
exports.updateOneUser = function(id, newName, newPwd, newEmail, callback){
	var update = db.prepare("UPDATE users " +
		"SET name = ?, pwd = ?, email = ? " +
		"WHERE id = ?;");
	update.run([newName, newPwd, newEmail, id], callback);
}
