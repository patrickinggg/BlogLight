"use strict";
// model_blog_follow

var sqlite3 = require('sqlite3').verbose();
var db = undefined;

var uuid = require('uuid');

exports.initSqlite = function(){
	db = new sqlite3.Database("images.sqlite3", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        function(err){
            if (err) {console.log('FAIL ' + err);}
        });
	db.run("CREATE TABLE IF NOT EXISTS images " +
        "(rowid INTEGER PRIMARY KEY AUTOINCREMENT, imgid TEXT NOT NULL, artid TEXT, img BLOB, " +
		"imgtype INTEGER NOT NULL, domain INTEGER NOT NULL);");
}

// write image into database
// blob: image bin
// artId: article id
// imgType: image format
// domain: domain code, 1-art  2-avatar
// callback: (imgId)
exports.newImage = function(blob, artId, imgType, domain, callback){
	var imgId = uuid.v1();
	var add = db.prepare("INSERT INTO images VALUES " +
		"(NULL, ?, ?, ?, ?, ?);");
	add.run([imgId, artId, blob, imgType, domain], function(err){
		if (err){
			callback(null);
		}
		else{
			callback(imgId);
		}
	});
}

// delete image
// imgId: image id
// callback: (err)
exports.deleteImage = function(imgId, callback){
	var del = db.prepare("DELETE FROM images WHERE " +
		"imgid = ?;");
	del.run([imgId], callback);
}

// get image using imgId
// imgId: image id
// callback: (row)
exports.findImageFromImgId = function(imgId, callback){
	db.get("SELECT * FROM images WHERE " +
		"imgid = ?;", [imgId], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}

// get all image ids using artId and domainCode
// artId: target Id, it is article Id or user Id
// domain: domain code, 1-art  2-avatar
// callback: (rows)
exports.findAllImgIdFromArtId = function(artId, domain, callback){
	db.all("SELECT imgid FROM images WHERE " +
		"artid = ? AND domain = ?;", [artId, domain], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows);
			}
		});
}
