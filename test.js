"use strict";
// controller_auto_test

var async = require('async');

var userService = require('./user_service');
var cacheService = require('./cache_service');
var articleService = require('./article_service');
var followService = require('./follow_service');
var imageService = require('./image_service');
var creditService = require('./credit_service');

function test_initialize(){
	userService.initSqlite();
	articleService.initSqlite();
	followService.initSqlite();
	imageService.initSqlite();
	creditService.initSqlite();
}

function test_userInfo(){
	async.series([
		function(callback){
			userService.addUser("test_name", "test_pwd", "test@test.com", function(err){
				if (err){
					callback("addUser failed");
				}
				else{
					callback(null);
				}
			});
		},
		function(callback){
			userService.findOneUserFromEmail("test@test.com", function(row){
				if (row){
					var usrId = row.id;
					userService.updateOneUser(usrId, "test_name2", "test_pwd2", "test@test.com", function(err){
						if (err){
							callback("updateUser failed");
						}
						else{
							callback(null);
						}
					});
				}
				else{
					callback("findUser failed");
				}
			});
		},
		function(callback){
			userService.findOneUserFromEmail("test@test.com", function(row){
				if (row.name == "test_name2"){
					userService.disableUser(row.id, function(err){
						if (err){
							callback("disableUser failed");
						}
						else{
							callback(null);
						}
					});
				}
				else{
					callback("updateUser failed 2");
				}
			});
		}
	], function(err, res){
		if (err){
			console.log("userInfo test abort, error info:")
			console.log(err);
		}
		else{
			console.log("userInfo test finished.");
		}
	});
}

function test_blogArticle(){
	var artId = articleService.createNewArtId();
	var rowId = -1;
	async.series([
		function(callback){
			articleService.addArticle(0, artId, function(err){
				if (err){
					callback("addArt failed");
				}else{
					callback(null);
				}
			});
		},
		function(callback){
			articleService.findArticleCountFromUserId(0, function(row){
				if (row){
					if (row > 0){
						callback(null);
					}else{
						callback("addArt failed 2");
					}
				}else{
					callback("findArtCount failed");
				}
			});
		},
		function(callback){
			articleService.findArticleInPageFromUserId(0, 20, 0, function(rows){
				if (rows){
					callback(null);
				}
				else{
					callback("findArtPage failed");
				}
			});
		},
		function(callback){
			articleService.findOneArticleDetailFromArtId(artId, function(row){
				if (row){
					callback(null);
				}
				else{
					callback("findOneArt failed");
				}
			});
		},
		function(callback){
			articleService.findOneArtTypeFromArtId(artId, function(row){
				if (row){
					rowId = row.rowid;
					callback(null);
				}
				else{
					callback("findOneArtType failed");
				}
			});
		},
		function(callback){
			articleService.updateOneArticle(rowId, 0, "test_title", "test_content", 2, function(err){
				if (err){
					callback("updateArt failed");
				}
				else{
					callback(null);
				}
			});
		},
		function(callback){
			articleService.findOneArticleDetailFromArtId(artId, function(row){
				if (row){
					if (row.glance == "test_content"){
						callback(null);
					}
					else{
						callback("updateArt failed 2");
					}
				}
				else{
					callback("findOneArt failed 2");
				}
			});
		},
		function(callback){
			articleService.disableArticle(rowId, 0, function(err){
				if (err){
					callback("disableArt failed");
				}
				else{
					articleService.findOneArticleDetailFromArtId(artId, function(row){
						if (row){
							callback("disableArt failed 2");
						}
						else{
							callback(null);
						}
					});
				}
			});
		}
	], function(err, res){
		if (err){
			console.log("blogArticle test abort, error info:")
			console.log(err);
		}
		else{
			console.log("blogArticle test finished.");
		}
	});
}

function test_blogFollow(){
	async.series([
		function(callback){
			followService.follow(0, 1, function(err){
				if (err){
					callback("follow failed");
				}else{
					callback(null);
				}
			});
		},
		function(callback){
			followService.findFollowingCountFromUserId(0, function(row){
				if (row){
					if (row > 0){
						callback(null);
					}else{
						callback("follow failed 2");
					}
				}
				else{
					callback("followingCount failed");
				}
			});
		},
		function(callback){
			followService.findFollowerCountFromUserId(1, function(row){
				if (row){
					if (row > 0){
						callback(null);
					}else{
						callback("follow failed 3");
					}
				}
				else{
					callback("followerCount failed");
				}
			});
		},
		function(callback){
			followService.findFollowingPageFromUserId(0, 20, 0, function(rows){
				if (rows){
					callback(null);
				}
				else{
					callback("followingPage failed");
				}
			});
		},
		function(callback){
			followService.findFollowerPageFromUserId(1, 20, 0, function(rows){
				if (rows){
					callback(null);
				}
				else{
					callback("followerPage failed");
				}
			});
		},
		function (callback){
			followService.findExactFollowRecord(0, 1, function(row){
				if (row){
					followService.unfollow(row.rowid, function(err){
						if (err){
							callback("unfollow failed");
						}
						else{
							followService.findExactFollowRecord(0, 1, function(row2){
								if (row2){
									callback("unfollow failed 2");
								}
								else{
									callback(null);
								}
							});
						}
					});
				}else{
					callback("findFollow failed");
				}
			});
		}
	], function(err, res){
		if (err){
			console.log("blogFollow test abort, error info:")
			console.log(err);
		}
		else{
			console.log("blogFollow test finished.");
		}
	});
}

function test_blogImageRepo(){
	var imgId = "";
	async.series([
		function(callback){
			var arr = 'test';
			imageService.newImage(arr, "test_artId", 0, 1, function(imgIdGet){
				if (imgIdGet){
					imgId = imgIdGet;
					callback(null);
				}
				else{
					callback("newImg failed");
				}
			});
		},
		function(callback){
			imageService.findImageFromImgId(imgId, function(row){
				if (row){
					if (row.img[0] == 't' && row.img[1] == 'e' && row.img[2] == 's' && row.img[3] == 't'){
						callback(null);
					}
					else{
						callback("getImg failed 2");
					}
				}
				else{
					callback("getImg failed");
				}
			});
		},
		function(callback){
			imageService.findAllImgIdFromArtId("test_artId", 1, function(rows){
				if (rows){
					callback(null);
				}
				else{
					callback("findAllImg failed");
				}
			});
		},
		function(callback){
			imageService.deleteImage(imgId, function(err){
				if (err){
					callback("deleteImg failed");
				}
				else{
					imageService.findImageFromImgId(imgId, function(row){
						if (row){
							callback("deleteImg failed 2");
						}
						else{
							callback(null);
						}
					});
				}
			});
		}
	], function(err, res){
		if (err){
			console.log("blogImageRepo test abort, error info:")
			console.log(err);
		}
		else{
			console.log("blogImageRepo test finished.");
		}
	});
}

function test_shop(){
	var creditNumber = -1;
	async.series([
		function(callback){
			creditService.activateUser(0, function(err){
				if (err){
					callback("activateUser failed");
				}
				else{
					callback(null);
				}
			});
		},
		function(callback){
			creditService.findOneUserFromUsrId(0, function(row){
				if (row){
					creditNumber = row.cre;
					callback(null);
				}
				else{
					callback("findUser failed");
				}
			});
		},
		function(callback){
			creditService.creditAdd(0, 20, function(err){
				if (err){
					callback("add 20 credit failed");
				}
				else{
					creditService.creditMinus(0, 5, function(err){
						if (err){
							callback("minus 5 credit failed");
						}
						else{
							callback(null);
						}
					});
				}
			});
		},
		function(callback){
			creditService.creditTransfer(0, "admin", 10, 0, function(err){
				if (err){
					callback("tranfer 10 credit failed");
				}
				else{
					creditService.findOneUserFromUsrId(0, function(row){
						if (row.cre == creditNumber + 5){
							callback(null);
						}
						else{
							callback("credit number not match");
						}
					});
				}
			});
		},
		function(callback){
			creditService.findRecordCountFromUserId(0, function(row){
				if (row >= 3){
					callback(null);
				}
				else{
					callback("findRecordCount failed");
				}
			});
		},
		function(callback){
			creditService.findRecordInPageFromUserId(0, 20, 0, function(rows){
				if (rows){
					callback(null);
				}
				else{
					callback("findRecordPage failed");
				}
			});
		}
	], function(err, res){
		if (err){
			console.log("shop test abort, error info:")
			console.log(err);
		}
		else{
			console.log("shop test finished.");
		}
	});
}

function test_cache(){
	var uuid = "";
	async.series([
		function(callback){
			uuid = cacheService.createUUID();
			cacheService.setKV(uuid, "test_value", 100, function(data){
				if (data){
					callback(null);
				}
				else{
					callback("setCache failed");
				}
			});
		},
		function(callback){
			cacheService.getKV(uuid, function(data){
				if (data){
					if (data == "test_value"){
						callback(null);
					}
					else{
						callback("getCache failed 2");
					}
				}
				else{
					callback("getCache failed");
				}
			});
		},
	], function(err, res){
		if (err){
			console.log("cache test abort, error info:")
			console.log(err);
		}
		else{
			console.log("cache test finished.");
		}
	});
}

test_initialize();
test_userInfo();
test_blogArticle();
test_blogFollow();
test_blogImageRepo();
test_shop();
test_cache();
