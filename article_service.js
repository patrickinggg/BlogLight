"use strict";
// model_article

var sqlite3 = require('sqlite3').verbose();
var db = undefined;

var uuid = require('uuid');

exports.initSqlite = function(){
	db = new sqlite3.Database("article.sqlite3", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        function(err){
            if (err) {console.log('FAIL ' + err);}
        });
	db.run("CREATE TABLE IF NOT EXISTS articles " +
        "(rowid INTEGER PRIMARY KEY AUTOINCREMENT, artid TEXT NOT NULL, " +
		"authorid INTEGER NOT NULL, arttitle TEXT, glance TEXT, content TEXT, arttype INTEGER NOT NULL, " +
		"createtime TEXT NOT NULL, modifytime TEXT NOT NULL, status INTEGER NOT NULL);");
}

// set article row into database
// userId: user id
// artId: article id
// callback: (err)
exports.addArticle = function(userId, artId, callback){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var createTime = year+' '+month+' '+day+' '+hour+' '+minute;
	var add = db.prepare("INSERT INTO articles VALUES " +
		"(NULL, ?, ?, ?, ?, 1, ?, ?, ?, 1);");
	add.run([artId, userId, 'new article', '', '', createTime, createTime], callback);
}

// set picture row into database
// userId: user id
// artId: picture id
// callback: (err)
exports.addPicture = function(userId, artId, callback){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var createTime = year+' '+month+' '+day+' '+hour+' '+minute;
	var add = db.prepare("INSERT INTO articles VALUES " +
		"(NULL, ?, ?, ?, ?, 1, ?, ?, ?, 2);");
	add.run([artId, userId, 'new picture', '', '', createTime, createTime], callback);
}

// search all articles belong to the user
// userId: user id
// callback: (row)
exports.findAllArticleFromUserId = function(userId, callback){
	db.all("SELECT rowid, artid, arttitle, glance, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND status = 1;", [userId], function(err, rows){
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

// search all pictures belong to the user
// userId: user id
// callback: (row)
exports.findAllPictureFromUserId = function(userId, callback){
	db.all("SELECT rowid, artid, arttitle, glance, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND status = 2;", [userId], function(err, rows){
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

// search all articles belong to the user and return the count
// userId: user id
// callback: (row)
exports.findArticleCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM articles WHERE " +
		"authorid = ? AND status = 1;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

exports.findFollowArticleCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM articles WHERE " +
		"authorid = ? AND (arttype = 1 OR arttype = 2) AND status = 1;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

exports.findPublicArticleCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM articles WHERE " +
		"authorid = ? AND arttype = 1 AND status = 1;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

// search all pictures belong to the user and return the count
// userId: user id
// callback: (row)
exports.findPictureCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM articles WHERE " +
		"authorid = ? AND status = 2;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

exports.findFollowPictureCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM articles WHERE " +
		"authorid = ? AND (arttype = 1 OR arttype = 2) AND status = 2;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

exports.findPublicPictureCountFromUserId = function(userId, callback){
	var find = db.prepare("SELECT rowid FROM articles WHERE " +
		"authorid = ? AND arttype = 1 AND status = 2;");
	find.all([userId], function(err, rows){
			if (err){
				callback(null);
			}else{
				callback(rows.length);
			}
		});
}

// search all articles in specific page belong to the user
// pageSize: how many articles in one page
// page: page number, from 0
// callback: (row)
exports.findArticleInPageFromUserId = function(userId, pageSize, page, callback){
	db.all("SELECT rowid, artid, arttitle, glance, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND status = 1 LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*page)], function(err, rows){
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

exports.findFollowArticleInPageFromUserId = function(userId, pageSize, page, callback){
	db.all("SELECT rowid, artid, arttitle, glance, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND (arttype = 1 OR arttype = 2) AND status = 1 LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*page)], function(err, rows){
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

exports.findPublicArticleInPageFromUserId = function(userId, pageSize, page, callback){
	db.all("SELECT rowid, artid, arttitle, glance, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND arttype = 1 AND status = 1 LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*page)], function(err, rows){
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

// search all pictures in specific page belong to the user
// pageSize: how many pictures in one page
// page: page number, from 0
// callback: (row)
exports.findPictureInPageFromUserId = function(userId, pageSize, page, callback){
	db.all("SELECT rowid, artid, arttitle, glance, content, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND status = 2 LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*page)], function(err, rows){
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

exports.findFollowPictureInPageFromUserId = function(userId, pageSize, page, callback){
	db.all("SELECT rowid, artid, arttitle, glance, content, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND (arttype = 1 OR arttype = 2) AND status = 2 LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*page)], function(err, rows){
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

exports.findPublicPictureInPageFromUserId = function(userId, pageSize, page, callback){
	db.all("SELECT rowid, artid, arttitle, glance, content, arttype, createtime FROM articles WHERE " +
		"authorid = ? AND arttype = 1 AND status = 2 LIMIT ? OFFSET ?;", [userId, pageSize, (pageSize*page)], function(err, rows){
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

// search article details using artId
// artId: article id
// callback: (row)
exports.findOneArticleDetailFromArtId = function(artId, callback){
	db.get("SELECT * FROM articles WHERE " +
		"artid = ? AND status = 1;", [artId], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}

// search picture details using artId
// picId: picture id
// callback: (row)
exports.findOnePictureDetailFromPicId = function(picId, callback){
	db.get("SELECT * FROM articles WHERE " +
		"artid = ? AND status = 2;", [picId], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}

exports.findOneArtTypeFromArtId = function(artId, callback){
	db.get("SELECT rowid, artid, authorid, arttype FROM articles WHERE " +
		"artid = ?;", [artId], function(err, row){
			if (err){
				callback(null);
			}else{
				callback(row);
			}
		});
}

// disable one article but not delete it
// rowId: rowId in article database, not the article id
// callback: (err)
exports.disableArticle = function(rowId, authorId, callback){
	var disable = db.prepare("UPDATE articles " +
		"SET status = 0 WHERE rowid = ? AND authorid = ?;");
	disable.run([rowId, authorId], callback);
}

// disable one picture but not delete it
// rowId: rowId in article database, not the article id
// callback: (err)
exports.disablePicture = function(rowId, authorId, callback){
	var disable = db.prepare("UPDATE articles " +
		"SET status = -1 WHERE rowid = ? AND authorid = ?;");
	disable.run([rowId, authorId], callback);
}

// update one article
// rowId: rowId in article database
// title: article title
// content: article text
// artType: article type
// callback: (err)
exports.updateOneArticle = function(rowId, authorId, title, content, artType, callback){
	var glance = '';
	if (content.length > 20){
		glance = content.slice(0, 20);
	}
	else{
		glance = content;
	}

	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var modTime = year+' '+month+' '+day+' '+hour+' '+minute;

	var update = db.prepare("UPDATE articles " +
		"SET arttitle = ?, glance = ?, content = ?, arttype = ?, modifytime = ? " +
		"WHERE rowid = ? AND authorid = ? AND status = 1;");
	update.run([title, glance, content, artType, modTime, rowId, authorId], callback);
}

// update one picture
// rowId: rowId in article database
// title: picture title
// glance: picture text
// content: image id in image service
// artType: picture type
// callback: (err)
exports.updateOnePicture = function(rowId, authorId, title, glance, content, artType, callback){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var modTime = year+' '+month+' '+day+' '+hour+' '+minute;

	var update = db.prepare("UPDATE articles " +
		"SET arttitle = ?, glance = ?, content = ?, arttype = ?, modifytime = ? " +
		"WHERE rowid = ? AND authorid = ? AND status = 2;");
	update.run([title, glance, content, artType, modTime, rowId, authorId], callback);
}

exports.createNewArtId = function(){
	var artId = uuid.v1();
	return artId;
}
