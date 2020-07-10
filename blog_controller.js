"use strict";
// controller_blog system

var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(cookieParser());
var fs = require('fs');
var multer = require('multer');
var pathLib = require('path');
var qs = require('querystring');
var http = require('http');

var articleService = require('./article_service');
var followService = require('./follow_service');
var imageService = require('./image_service');
var cacheService = require('./cache_service');
app.use('/static', express.static('static'));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("Access-Control-Allow-Credentials","true");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/explore', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/explore.html");
})

app.get('/blog/user', function (req, res) {
	//var targetId = req.params.userid;
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/main_page.html");
})

app.get('/blog/article/:artid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/article_view.html");
})

app.get('/blog/article_write/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/article_write.html");
})

app.get('/blog/gallery/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/gallery_page.html");
})


app.get('/blog/gallery_upload/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/gallery_upload.html");
})

app.get('/blog/gallery_draw/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/gallery_draw.html");
})

app.get('/blog/gallery_view/:artid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/gallery_view.html");
})

app.get('/blog/followings/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/followings.html");
})

app.get('/blog/followers/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/followers.html");
})


app.get('/blog/friends_blog_page/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/friends_blog_page.html");
})

app.get('/blog/friends_gallery_page/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/friends_gallery_page.html");
})

app.get('/blog/view_friends_blog/:artid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/view_friends_blog.html");
})

app.get('/blog/view_friends_gallery/:artid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/view_friends_gallery.html");
})

app.get('/blog/change_avatar/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/change_avatar.html");
})

app.get('/explore/trend', function (req, res) {
	var result = {
		"data":"nothing"
	};
	res.send(JSON.stringify(result));
})

function sub_reqVerifyUserTkt(tkt, usrId, callback){
	var headers = {
		'Content-Type':'application/x-www-form-urlencoded'
	};
	var bodyData = {
		"ticket":tkt,
		"id":usrId,
		"from":"blog"
	};
	var bodyStr = qs.stringify(bodyData);
	var options = {
		method:'POST',
		host:'127.0.0.1',
		port:'9700',
		path:'/verify',
		headers:headers
	};

	var req = http.request(options, function(res){
		res.setEncoding('utf-8');
		res.on('data',function(chunk){
			var obj = JSON.parse(chunk);
			if (obj.result == "OK"){
				callback(1);
			}
			else{
				callback(0);
			}
		});
	});
	req.write(bodyStr);
	req.end();
}
app.post('/verify_sid', function (req, res) {
	var sid = req.body.sid;
	cacheService.getKV(sid, function(data){
		if (data){
			if (data.length > 0){
				res.cookie('sid', sid, {maxAge: 1800000});
				cacheService.setKV(sid, data, 1800, function(data2){});
				var result = {
					"result":"OK",
					"id":data
				};
				res.send(JSON.stringify(result));
			}
			else{
				var result = {
					"result":"FAILED"
				};
				res.send(JSON.stringify(result));
			}
		}
		else{
			var result = {
				"result":"FAILED"
			};
			res.send(JSON.stringify(result));
		}
	});
})
app.post('/verify_tkt', function (req, res) {
	var tkt = req.body.tkt;
	var id = req.body.usrId;
	sub_reqVerifyUserTkt(tkt, id, function(data){
		if (data == 1){
			var newSid = cacheService.createUUID();
			cacheService.setKV(newSid, id, 1800, function(data2){});
			res.cookie('sid', newSid, {maxAge: 1800000});
			var result = {
				"result":"OK",
				"tkt":tkt,
				"usrId": id,
				"sid": newSid
			};
			res.send(JSON.stringify(result));
		}
		else{
      console.log(tkt);
			var result = {
				"result":"FAILED"
			};
			res.send(JSON.stringify(result));
		}
	});
})
function getUsrIdFromSid(sid, callback){
	cacheService.getKV(sid, function(data){
		if (data){
			callback(data);
		}
		else{
			callback(null);
		}
	});
}

app.post('/blog/checkfollow', function (req, res){
	var fromId = req.body.fromId;
	var toId = req.body.toId;
	followService.findExactFollowRecord(fromId, toId, function(row){
		if (row){
			var result = {
				"result":"EXIST",
				"from":fromId,
				"to":toId
			};
			res.send(JSON.stringify(result));
		} else {
			var result = {
				"result":"NOTEXIST",
				"from":fromId,
				"to":toId
			};
			res.send(JSON.stringify(result));
		}
	});
})


// get user's following and followers
// id: user id
// mode: 0-Counts 1-Following list 2-Follower list [pageSize][pageIndex]
app.post('/blog/user/:userid/info', function (req, res) {
	var id = req.params.userid;
	var mode = req.body.mode;
	if (mode == 0){
		followService.findFollowingCountFromUserId(id, function(row){
			var following = row;
			followService.findFollowerCountFromUserId(id, function(row2){
				var fan = row2;
				var result = {
					"usrId":id,
					"followingCount":following,
					"fanCount":fan
				};
				res.send(JSON.stringify(result));
			});
		});
	}
	else if (mode == 1){
		var pageSize = req.body.pageSize;
		var pageIdx = req.body.pageIndex;
		followService.findFollowingPageFromUserId(id, pageSize, pageIdx, function(row){
			var result = {
				"usrId":id,
				"pageSize":pageSize,
				"pageIndex":pageIdx,
				"list":row
			};
			res.send(JSON.stringify(result));
		});
	}
	else if (mode == 2){
		var pageSize = req.body.pageSize;
		var pageIdx = req.body.pageIndex;
		followService.findFollowerPageFromUserId(id, pageSize, pageIdx, function(row){
			var result = {
				"usrId":id,
				"pageSize":pageSize,
				"pageIndex":pageIdx,
				"list":row
			};
			res.send(JSON.stringify(result));
		});
	}
})

function sub_getAvatar(req, res){
	var usrId = req.body.usrId;
	imageService.findAllImgIdFromArtId(usrId, 2, function(rows){
    console.log(rows[0]);
    if (rows[0] == undefined){
      var result = {
        "result":"NOAVATAR"
      };
      res.send(JSON.stringify(result));
    } else {
      if (rows){
        imageService.findImageFromImgId(rows[0].imgid, function(row){
          if (row){
            var result = {
              "result":"OK",
              "img":row
            };
            res.send(JSON.stringify(result));
          }else{
            var result = {
              "result":"FAILED"
            };
            res.send(JSON.stringify(result));
          }
        });
      }
      else{
        var result = {
          "result":"EMPTY"
        };
        res.send(JSON.stringify(result));
      }
    }

	});
}
app.post('/blog/getavatar', sub_getAvatar)
app.post('/blog/getAvatar', sub_getAvatar)

// apis below require signed-in
// interceptor/filter
app.use(function (req, res, next){
	var sid = req.cookies['sid'];
	console.log("sid=" + sid);
    // verify session
	cacheService.getKV(sid, function(data){
		if (data){
			cacheService.setKV(sid, data, 1800, function(data2){});
			next();
		}
		else{
			//res.status(401);
			//res.send("Log in expired");
			//var from = req.orginalurl;
			//from = from.replace(":","%3A");
			//from = from.replace("/","%2F");
			//from = from.replace("&","%26");
			//from = from.replace("?","%3F");
			res.redirect('http://127.0.0.1:9700/home?from=blog');
		}
	});
})

app.get('/blog/getart', function (req, res) {
	var articleId = req.query.id;
	articleService.findOneArticleDetailFromArtId(articleId, function(row){
		if (row){
			if (row.arttype == 1){
				var result = {
					"result":"OK",
					"rowId":row.rowid,
					"articleId":row.artid,
					"authorId":row.authorid,
					"title":row.arttitle,
					"glance":row.glance,
					"content":row.content,
					"articleType":row.arttype,
					"createTime":row.createtime,
					"modifyTime":row.modifytime,
					"status":row.status
				};
				res.send(JSON.stringify(result));
			}
			else if (row.arttype == 2){
				var sid = req.cookies['sid'];
				getUsrIdFromSid(sid, function(usrId){
					if (row.authorid == usrId){
						var result = {
							"result":"OK",
							"rowId":row.rowid,
							"articleId":row.artid,
							"authorId":row.authorid,
							"title":row.arttitle,
							"glance":row.glance,
							"content":row.content,
							"articleType":row.arttype,
							"createTime":row.createtime,
							"modifyTime":row.modifytime,
							"status":row.status
						};
						res.send(JSON.stringify(result));
					}
					else{
						followService.findExactFollowRecord(usrId, row.authorid, function(row2){
							if (row2){
								var result = {
									"result":"OK",
									"rowId":row.rowid,
									"articleId":row.artid,
									"authorId":row.authorid,
									"title":row.arttitle,
									"glance":row.glance,
									"content":row.content,
									"articleType":row.arttype,
									"createTime":row.createtime,
									"modifyTime":row.modifytime,
									"status":row.status
								};
								res.send(JSON.stringify(result));
							}
							else{
								var result = {
									"result":"REJECTED"
								};
								res.send(JSON.stringify(result));
							}
						});
					}
				});
			}
			else if (row.arttype == 3){
				var sid = req.cookies['sid'];
				getUsrIdFromSid(sid, function(usrId){
					if (row.authorid == usrId){
						var result = {
							"result":"OK",
							"rowId":row.rowid,
							"articleId":row.artid,
							"authorId":row.authorid,
							"title":row.arttitle,
							"glance":row.glance,
							"content":row.content,
							"articleType":row.arttype,
							"createTime":row.createtime,
							"modifyTime":row.modifytime,
							"status":row.status
						};
						res.send(JSON.stringify(result));
					}
					else{
						var result = {
							"result":"REJECTED"
						};
						res.send(JSON.stringify(result));
					}
				});
			}
		}
		else{
			var result = {
				"result":"FAILED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.get('/blog/getpic', function (req, res) {
	var articleId = req.query.id;
	articleService.findOnePictureDetailFromPicId(articleId, function(row){
		if (row){
			if (row.arttype == 1){
				var result = {
					"result":"OK",
					"rowId":row.rowid,
					"picId":row.artid,
					"authorId":row.authorid,
					"title":row.arttitle,
					"content":row.glance,
					"imgId":row.content,
					"articleType":row.arttype,
					"createTime":row.createtime,
					"modifyTime":row.modifytime,
					"status":row.status
				};
				res.send(JSON.stringify(result));
			}
			else if (row.arttype == 2){
				var sid = req.cookies['sid'];
				getUsrIdFromSid(sid, function(usrId){
					if (row.authorid == usrId){
						var result = {
							"result":"OK",
							"rowId":row.rowid,
							"picId":row.artid,
							"authorId":row.authorid,
							"title":row.arttitle,
							"content":row.glance,
							"imgId":row.content,
							"articleType":row.arttype,
							"createTime":row.createtime,
							"modifyTime":row.modifytime,
							"status":row.status
						};
						res.send(JSON.stringify(result));
					}
					else{
						followService.findExactFollowRecord(usrId, row.authorid, function(row2){
							if (row2){
								var result = {
									"result":"OK",
									"rowId":row.rowid,
									"picId":row.artid,
									"authorId":row.authorid,
									"title":row.arttitle,
									"content":row.glance,
									"imgId":row.content,
									"articleType":row.arttype,
									"createTime":row.createtime,
									"modifyTime":row.modifytime,
									"status":row.status
								};
								res.send(JSON.stringify(result));
							}
							else{
								var result = {
									"result":"REJECTED"
								};
								res.send(JSON.stringify(result));
							}
						});
					}
				});
			}
			else if (row.arttype == 3){
				var sid = req.cookies['sid'];
				getUsrIdFromSid(sid, function(usrId){
					if (row.authorid == usrId){
						var result = {
							"result":"OK",
							"rowId":row.rowid,
							"picId":row.artid,
							"authorId":row.authorid,
							"title":row.arttitle,
							"content":row.glance,
							"imgId":row.content,
							"articleType":row.arttype,
							"createTime":row.createtime,
							"modifyTime":row.modifytime,
							"status":row.status
						};
						res.send(JSON.stringify(result));
					}
					else{
						var result = {
							"result":"REJECTED"
						};
						res.send(JSON.stringify(result));
					}
				});
			}
		}
		else{
			var result = {
				"result":"FAILED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/blog/user/:userid/newart', function (req, res) {
	var usrId = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (usrId == usrIdGet){
			var artId = articleService.createNewArtId();
			articleService.addArticle(usrId, artId, function(err){
				if (err){
					var result = {
						"result":"FAILED",
						"usrId":usrId
					};
					res.send(JSON.stringify(result));
				}
				else{
					articleService.findOneArticleDetailFromArtId(artId, function(row){
						if (row){
							var result = {
								"result":"OK",
								"usrId":usrId,
								"artId":artId,
								"rowId":row.rowid
							};
							res.send(JSON.stringify(result));
						}
						else{
							var result = {
								"result":"FAILED",
								"usrId":usrId
							};
							res.send(JSON.stringify(result));
						}
					});

				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/blog/user/:userid/newpic', function (req, res) {
	var usrId = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (usrId == usrIdGet){
			var picId = articleService.createNewArtId();
			articleService.addPicture(usrId, picId, function(err){
				if (err){
					var result = {
						"result":"FAILED",
						"usrId":usrId
					};
					res.send(JSON.stringify(result));
				}
				else{
					articleService.findOnePictureDetailFromPicId(picId, function(row){
						if (row){
							var result = {
								"result":"OK",
								"usrId":usrId,
								"picId":picId,
								"rowId":row.rowid
							};
							res.send(JSON.stringify(result));
						}
						else{
							var result = {
								"result":"FAILED",
								"usrId":usrId
							};
							res.send(JSON.stringify(result));
						}
					});

				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/blog/user/:userid/save', function (req, res) {
	var usrId = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (usrId == usrIdGet){
			var rowId = req.body.rowId;
			var artId = req.body.artId;
			var title = req.body.artTitle;
			var content = req.body.artContent;
			var permit = req.body.permit;  //1,2,3
			articleService.updateOneArticle(rowId, usrId, title, content, permit, function(err){
				if (err){
					var result = {
						"result":"FAILED",
						"usrId":usrId,
						"artId":artId
					};
					res.send(JSON.stringify(result));
				}
				else{
					var result = {
						"result":"OK",
						"usrId":usrId,
						"artId":artId
					};
					res.send(JSON.stringify(result));
				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});

})

app.post('/blog/user/:userid/savepic', function (req, res) {
	var usrId = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (usrId == usrIdGet){
			var rowId = req.body.rowId;
			var picId = req.body.picId;
			var title = req.body.picTitle;
			var glance = req.body.picContent;
			var imgId = req.body.imgId;
			var permit = req.body.permit;  //1,2,3

			articleService.updateOnePicture(rowId, usrId, title, glance, imgId, permit, function(err){
				if (err){
					var result = {
						"result":"FAILED",
						"usrId":usrId,
						"picId":picId
					};
					res.send(JSON.stringify(result));
				}
				else{
					var result = {
						"result":"OK",
						"usrId":usrId,
						"picId":picId
					};
					res.send(JSON.stringify(result));
				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/blog/user/:userid/deleteart', function (req, res) {
	var usrId = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (usrId == usrIdGet){
			var rowId = req.body.rowId;
			articleService.disableArticle(rowId, usrId, function(err){
				if (err){
					var result = {
						"result":"FAILED",
						"usrId":usrId,
						"rowId":rowId
					};
					res.send(JSON.stringify(result));
				}
				else{
					var result = {
						"result":"OK",
						"usrId":usrId,
						"rowId":rowId
					};
					res.send(JSON.stringify(result));
				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/blog/user/:userid/deletepic', function (req, res) {
	var usrId = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (usrId == usrIdGet){
			var rowId = req.body.rowId;
			articleService.disablePicture(rowId, usrId, function(err){
				if (err){
					var result = {
						"result":"FAILED",
						"usrId":usrId,
						"rowId":rowId
					};
					res.send(JSON.stringify(result));
				}
				else{
					var result = {
						"result":"OK",
						"usrId":usrId,
						"rowId":rowId
					};
					res.send(JSON.stringify(result));
				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

// get user's article list
// userid: user id
// mode: 'count'->return article count
//       'page'->return one page of list  [page: page index][size: how many results one page can display]
app.post('/blog/user/:userid/list', function (req, res) {
	var id = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (id == usrIdGet){  // self
			var mode = req.body.mode;
			if (mode == "count"){
				articleService.findArticleCountFromUserId(id, function(row){
					var result = {
						"usrId":id,
						"mode":mode,
						"count":row
					};
					res.send(JSON.stringify(result));
				});
			}
			else if (mode == "page"){
				var pageIdx = req.body.page;
				var pageSize = req.body.size;
				articleService.findArticleInPageFromUserId(id, pageSize, pageIdx, function(row){
					var result = {
						"usrId":id,
						"mode":mode,
						"articles":row
					};
					res.send(JSON.stringify(result));
				});
			}
		}
		else{  // visitor
			followService.findExactFollowRecord(usrIdGet, id, function(row){
				if (row){  // follow
					var mode = req.body.mode;
					if (mode == "count"){
						articleService.findFollowArticleCountFromUserId(id, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"count":row
							};
							res.send(JSON.stringify(result));
						});
					}
					else if (mode == "page"){
						var pageIdx = req.body.page;
						var pageSize = req.body.size;
						articleService.findFollowArticleInPageFromUserId(id, pageSize, pageIdx, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"articles":row
							};
							res.send(JSON.stringify(result));
						});
					}
				}
				else{  // not follow
					var mode = req.body.mode;
					if (mode == "count"){
						articleService.findPublicArticleCountFromUserId(id, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"count":row
							};
							res.send(JSON.stringify(result));
						});
					}
					else if (mode == "page"){
						var pageIdx = req.body.page;
						var pageSize = req.body.size;
						articleService.findPublicArticleInPageFromUserId(id, pageSize, pageIdx, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"articles":row
							};
							res.send(JSON.stringify(result));
						});
					}
				}
			});
		}
	});
})

// get user's picture list
// userid: user id
// mode: 'count'->return picture count
//       'page'->return one page of list  [page: page index][size: how many results one page can display]
app.post('/blog/user/:userid/piclist', function (req, res) {
	var id = req.params.userid;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (id == usrIdGet){  // self
			var mode = req.body.mode;
			if (mode == "count"){
				articleService.findPictureCountFromUserId(id, function(row){
					var result = {
						"usrId":id,
						"mode":mode,
						"count":row
					};
					res.send(JSON.stringify(result));
				});
			}
			else if (mode == "page"){
				var pageIdx = req.body.page;
				var pageSize = req.body.size;
				articleService.findPictureInPageFromUserId(id, pageSize, pageIdx, function(row){
					var result = {
						"usrId":id,
						"mode":mode,
						"pictures":row
					};
					res.send(JSON.stringify(result));
				});
			}
		}else{  // visitor
			followService.findExactFollowRecord(usrIdGet, id, function(row){
				if (row){  // follow
					var mode = req.body.mode;
					if (mode == "count"){
						articleService.findFollowPictureCountFromUserId(id, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"count":row
							};
							res.send(JSON.stringify(result));
						});
					}
					else if (mode == "page"){
						var pageIdx = req.body.page;
						var pageSize = req.body.size;
						articleService.findFollowPictureInPageFromUserId(id, pageSize, pageIdx, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"articles":row
							};
							res.send(JSON.stringify(result));
						});
					}
				}
				else{  // not follow
					var mode = req.body.mode;
					if (mode == "count"){
						articleService.findPublicPictureCountFromUserId(id, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"count":row
							};
							res.send(JSON.stringify(result));
						});
					}
					else if (mode == "page"){
						var pageIdx = req.body.page;
						var pageSize = req.body.size;
						articleService.findPublicPictureInPageFromUserId(id, pageSize, pageIdx, function(row){
							var result = {
								"usrId":id,
								"mode":mode,
								"articles":row
							};
							res.send(JSON.stringify(result));
						});
					}
				}
			});
		}
	});
})

app.post('/blog/follow', function (req, res) {
	var fromId = req.body.fromId;
	var toId = req.body.toId;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (fromId == usrIdGet){
			followService.findExactFollowRecord(fromId, toId, function(row){
				if (row){
					var result = {
						"result":"EXIST",
						"from":fromId,
						"to":toId
					};
					res.send(JSON.stringify(result));
				}
				else{
					followService.follow(fromId, toId, function(err){
						if (err){
							var result = {
								"result":"FAILED",
								"from":fromId,
								"to":toId
							};
							res.send(JSON.stringify(result));
						}
						else{
							var result = {
								"result":"OK",
								"from":fromId,
								"to":toId
							};
							res.send(JSON.stringify(result));
						}
					});
				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/blog/unfollow', function (req, res) {
	var fromId = req.body.fromId;
	var toId = req.body.toId;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (fromId == usrIdGet){
			followService.findExactFollowRecord(fromId, toId, function(row){
				if (row){
					followService.unfollow(row.rowid, function(err){
						if (err){
							var result = {
								"result":"FAILED",
								"from":fromId,
								"to":toId
							};
							res.send(JSON.stringify(result));
						}
						else{
							var result = {
								"result":"OK",
								"from":fromId,
								"to":toId
							};
							res.send(JSON.stringify(result));
						}
					});
				}
				else{
					var result = {
						"result":"FAILED",
						"from":fromId,
						"to":toId
					};
					res.send(JSON.stringify(result));
				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

// get image bin
app.post('/img_get', function(req, res){
	var imgId = req.body.imgId;
	imageService.findImageFromImgId(imgId, function(row){
		if (row){
			if (row.domain == 1){
				var targetId = row.artid;
				articleService.findOneArtTypeFromArtId(targetId, function(row2){
					if (row2.arttype == 1){
						var result = {
							"result":"OK",
							"image":row
						};
						res.send(JSON.stringify(result));
					}
					else if (row2.arttype == 2){
						var sid = req.cookies['sid'];
						getUsrIdFromSid(sid, function(usrIdGet){
							if (row2.authorid == usrIdGet){
								var result = {
									"result":"OK",
									"image":row
								};
								res.send(JSON.stringify(result));
							}
							else{
								followService.findExactFollowRecord(usrIdGet, row2.authorid, function(row3){
									if (row3){
										var result = {
											"result":"OK",
											"image":row
										};
										res.send(JSON.stringify(result));
									}
									else{
										var result = {
											"result":"REJECTED"
										};
										res.send(JSON.stringify(result));
									}
								});
							}
						});
					}
					else if (row2.arttype == 3){
						var sid = req.cookies['sid'];
						getUsrIdFromSid(sid, function(usrIdGet){
							if (row2.authorid == usrIdGet){
								var result = {
									"result":"OK",
									"image":row
								};
								res.send(JSON.stringify(result));
							}
							else{
								var result = {
									"result":"REJECTED"
								};
								res.send(JSON.stringify(result));
							}
						});
					}
				});
			}
			else if (row.domain == 2){
				var result = {
					"result":"OK",
					"image":row
				};
				res.send(JSON.stringify(result));
			}
		}
		else{
			var result = {
				"result":"FAILED",
				"imgId":imgId
			};
			res.send(JSON.stringify(result));
		}
	});
})

// get avatar image or article images
// domain: "art" - blog article images    "avatar" - user's avatar image
app.post('/img_collection', function(req, res){
	var domain = req.body.domain;
	if (domain == "art"){
		var targetId = req.body.artId;
		articleService.findOneArtTypeFromArtId(targetId, function(check){
			if (check.arttype == 1){
				imageService.findAllImgIdFromArtId(targetId, 1, function(rows){
					if (rows){
						var result = {
							"result":"OK",
							"collection":rows
						};
						res.send(JSON.stringify(result));
					}
				});
			}
			else{
				var sid = req.cookies['sid'];
				getUsrIdFromSid(sid, function(usrIdGet){
					if (check.authorid == usrIdGet){
						imageService.findAllImgIdFromArtId(targetId, 1, function(rows){
							if (rows){
								var result = {
									"result":"OK",
									"collection":rows
								};
								res.send(JSON.stringify(result));
							}
						});
					}
					else{
						if (check.arttype == 2){
							followService.findExactFollowRecord(usrIdGet, check.authorid, function(row){
								if (row){
									imageService.findAllImgIdFromArtId(targetId, 1, function(rows){
										if (rows){
											var result = {
												"result":"OK",
												"collection":rows
											};
											res.send(JSON.stringify(result));
										}
									});
								}
								else{
									var result = {
										"result":"REJECTED"
									};
									res.send(JSON.stringify(result));
								}
							});
						}
						else if (check.arttype == 3){
							var result = {
								"result":"REJECTED"
							};
							res.send(JSON.stringify(result));
						}
					}
				});
			}
		});
	}
	else if (domain == "avatar"){
		var targetId = req.body.usrId;
		imageService.findAllImgIdFromArtId(targetId, 2, function(rows){
			if (rows){
				var result = {
					"result":"OK",
					"collection":rows
				};
				res.send(JSON.stringify(result));
			}
			else{
				var result = {
					"result":"FAILED"
				};
				res.send(JSON.stringify(result));
			}
		});
	}
})

// upload image api with base64
// data: base64 string
// domain: "art" - blog article images    "avatar" - user's avatar image
app.post('/img_uploadbase64', function(req, res){
	var domain = req.body.domain;
	var data = req.body.base64;
	var domainCode = 0;
	var targetId = -1;
	if (domain == "art"){
		targetId = req.body.artId;
		domainCode = 1;
	}
	else if (domain == "avatar"){
		targetId = req.body.usrId;
		domainCode = 2;
	}
	//console.log(data);
	//console.log(domain);
	//console.log(targetId);
	articleService.findOneArtTypeFromArtId(targetId, function(check){
		if (check){
			var sid = req.cookies['sid'];
			getUsrIdFromSid(sid, function(usrIdGet){
				if (check.authorid == usrIdGet){
					imageService.newImage(data, targetId, 3, domainCode, function(imgId){  // format = 3 -> base64
						if (imgId){
							var result = {
								"result":"OK",
								"imgId":imgId,
								"targetId":targetId,
								"format":3
							};
							res.send(JSON.stringify(result));
						}
						else{
							var result = {
								"result":"FAILED"
							};
							res.send(JSON.stringify(result));
						}
					});
				}
				else{
					var result = {
						"result":"REJECTED"
					};
					res.send(JSON.stringify(result));
				}
			});
		}
	});
})

// upload image api
// name in HTML should be 'file', using 'form-data'
// domain: "art" - blog article images    "avatar" - user's avatar image
app.use(multer({dest: './tmp_upload'}).any());  //app.use(multer({dest: './dist'}).array('file'));
app.post('/img_upload', function(req, res){
	var domain = req.body.domain;
  console.log("requested");
	var domainCode = 0;
	var targetId = -1;
	if (domain == "art"){
		targetId = req.body.artId;
		domainCode = 1;
	}
	else if (domain == "avatar"){
		targetId = req.body.usrId;
		domainCode = 2;
    console.log("2");

	}
	articleService.findOneArtTypeFromArtId(targetId, function(check){
    console.log("7");
    console.log("check"+check);
		if (domain == "avatar"){
			var sid = req.cookies['sid'];
			getUsrIdFromSid(sid, function(usrIdGet){
				if (targetId == usrIdGet){
					fs.readFile(req.files[0].path, function(err, data){
						if(err){
							console.log('Error');
						}
						else{
							var imgFilename = req.files[0].originalname;
							var formatStr = pathLib.extname(imgFilename);
							var imgType = -1;
							if (formatStr == ".jpg" || formatStr == ".JPG"){
								imgType = 0;
							}
							else if (formatStr == ".png" || formatStr == ".PNG"){
								imgType = 1;
							}
							else if (formatStr == ".gif" || formatStr == ".GIF"){
								imgType = 2;
							}
							imageService.newImage(data, targetId, imgType, domainCode, function(imgId){
								if (imgId){
									var tmpFiles = fs.readdirSync('./tmp_upload/');
									for (var tmpFileIdx in tmpFiles){
										var tmpFilePath = './tmp_upload/' + tmpFiles[tmpFileIdx];
										fs.unlinkSync(tmpFilePath);
									}
									var result = {
										"result":"OK",
										"imgId":imgId,
										"targetId":targetId,
										"format":imgType
									};
									res.send(JSON.stringify(result));
								}
								else{
									var result = {
										"result":"FAILED"
									};
									res.send(JSON.stringify(result));
								}
							});
						}
					});
				}
			});
		}
		else if (check){
			var sid = req.cookies['sid'];
			getUsrIdFromSid(sid, function(usrIdGet){
				if (check.authorid == usrIdGet){
					fs.readFile(req.files[0].path, function(err, data){
						if(err){
							console.log('Error');
						}
						else{
              console.log("3");

							var imgFilename = req.files[0].originalname;
							var formatStr = pathLib.extname(imgFilename);
							var imgType = -1;
							if (formatStr == ".jpg" || formatStr == ".JPG"){
								imgType = 0;
							}
							else if (formatStr == ".png" || formatStr == ".PNG"){
								imgType = 1;
							}
							else if (formatStr == ".gif" || formatStr == ".GIF"){
								imgType = 2;
							}
							imageService.newImage(data, targetId, imgType, domainCode, function(imgId){
								if (imgId){
                  console.log("4");

									var tmpFiles = fs.readdirSync('./tmp_upload/');
									for (var tmpFileIdx in tmpFiles){
										var tmpFilePath = './tmp_upload/' + tmpFiles[tmpFileIdx];
										fs.unlinkSync(tmpFilePath);
									}
									var result = {
										"result":"OK",
										"imgId":imgId,
										"targetId":targetId,
										"format":imgType
									};
									res.send(JSON.stringify(result));
								}
								else{
                  console.log("5");

									var result = {
										"result":"FAILED"
									};
									res.send(JSON.stringify(result));
								}

							});
						}
					});
				}
				else{
          console.log("6");

					var result = {
						"result":"REJECTED"
					};
					res.send(JSON.stringify(result));
				}
			});
		}
	});
})

// delete image with imgId
app.post('/img_delete', function(req, res){
	var imgId = req.body.imgId;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(usrIdGet){
		if (usrIdGet){
			imageService.findImageFromImgId(imgId, function(row){
				if (row){
					if (row.domain == 2){
						if (row.artid == usrIdGet){
							imageService.deleteImage(imgId, function(err){
								if (err){
									var result = {
										"result":"FAILED",
										"imgId":imgId
									};
									res.send(JSON.stringify(result));
								}
								else{
									var result = {
										"result":"OK",
										"imgId":imgId
									};
									res.send(JSON.stringify(result));
								}
							});
						}
						else{
							var result = {
								"result":"REJECTED"
							};
							res.send(JSON.stringify(result));
						}
					}
					else{
						articleService.findOneArtTypeFromArtId(row.artid, function(row2){
							if (row2){
								if (usrIdGet == row2.authorid){
									imageService.deleteImage(imgId, function(err){
										if (err){
											var result = {
												"result":"FAILED",
												"imgId":imgId
											};
											res.send(JSON.stringify(result));
										}
										else{
											var result = {
												"result":"OK",
												"imgId":imgId
											};
											res.send(JSON.stringify(result));
										}
									});
								}
								else{
									var result = {
										"result":"REJECTED"
									};
									res.send(JSON.stringify(result));
								}
							}else{
								var result = {
									"result":"FAILED",
									"imgId":imgId
								};
								res.send(JSON.stringify(result));
							}
						});
					}
				}
				else{
					var result = {
						"result":"FAILED",
						"imgId":imgId
					};
					res.send(JSON.stringify(result));
				}
			});
		}
		else{
			var result = {
				"result":"REJECTED"
			};
			res.send(JSON.stringify(result));
		}
	});
})


var server = app.listen(9701, async function () {
	articleService.initSqlite();
	followService.initSqlite();
	imageService.initSqlite();

	console.log('blog server starts at 9701.');

})
