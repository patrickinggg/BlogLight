"use strict";
// controller_user

var express = require('express');
var qs = require('querystring');
var app = express();
const path = require('path');
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(cookieParser());


var userService = require('./user_service');
var cacheService = require('./cache_service');

app.use('/static', express.static('static'));


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


function getAppCode(url){
	if (url.match("blog")){
		return "blg";
	}
	else if(url.match("9701")){
		return "blg";
	}
	else if(url.match("shop")){
		return "shp";
	}
	else if(url.match("9702")){
		return "shp";
	}
	return "err";
}

function createSignInSessionTicket(id, appCode, callback){
	var sid = cacheService.createUUID();
	console.log(sid);
	cacheService.setKV(sid, id, 1800, function(data){
		if (data){
			var tkt = appCode + cacheService.createUUID();
			cacheService.setKV(tkt, sid, 1800, function(data2){
				if (data2){
					callback(new Array(sid, tkt));
				}
				else{
					callback(null);
				}
			});
		}
		else{
			callback(null);
		}
	});
}

app.get('/home', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/home.html");
})

app.get('/register', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/register.html");
})

app.get('/register_complete', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/register_complete.html");
})

app.get('/main_page', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/main_page.html");
})

app.get('/my_account/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/my_account.html");
})

app.get('/change_password/:userid', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/change_password.html");
})


app.post('/signin',function (req,res) {
	var urlFrom = req.body.from;
	var email = req.body.email;
	var pwd = req.body.pwd;
	if (urlFrom == null || email == null || pwd == null){
		var result = {
			"result":"INVALID"
		};
		res.send(JSON.stringify(result));
		return;
	}
	if (urlFrom == "" || email == "" || pwd == ""){

		var result = {
			"result":"INVALID"
		};
		res.send(JSON.stringify(result));
		return;
	}
	pwd = crypto.createHash('md5').update(pwd).digest("hex");
	console.log(pwd);
	var appCode = getAppCode(urlFrom);
	userService.findOneUserFromEmail(email, function(row){
		if (row){
			if (row.status == 1 && row.pwd == pwd){
				createSignInSessionTicket(row.id, appCode, function(data){
					if (data){
						var sid = data[0];
						var tkt = data[1];
						res.cookie('sid', sid, {maxAge: 1800000});
						var result = {
							"id":row.id,
							"to":urlFrom,
							"ticket":tkt,
							"result":"OK"
						};
						res.send(JSON.stringify(result));
					}
					else{

						var result = {
							"email":email,
							"result":"BUSY"
						};
						res.send(JSON.stringify(result));
					}
				});
			}
		}
		else{

			var result = {
				"email":email,
				"result":"FAILED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/signup',function (req,res) {
	var usr = req.body.usr;
	var pwd = req.body.pwd;
	pwd = crypto.createHash('md5').update(pwd).digest("hex");
	console.log(pwd);
	var email = req.body.email;
	console.log(usr);
	console.log(pwd);
	if (usr == null || email == null || pwd == null){
		var result = {
			"result":"INVALID"
		};
		res.send(JSON.stringify(result));
		return;
	}
	if (usr == "" || email == "" || pwd == ""){
		var result = {
			"result":"INVALID"
		};
		res.send(JSON.stringify(result));
		return;
	}
	userService.findOneUserFromEmail(email, function(row){
		if (row){
			var result = {
				"email":email,
				"result":"OCCUPIED"
			};
			res.send(JSON.stringify(result));
		}
		else{
			userService.addUser(usr, pwd, email, function(err){
				if (err){
					var result = {
						"email":email,
						"result":"FAILED"
					};
					res.redirect('/register');
				}
				else{
					var result = {
						"email":email,
						"result":"OK"
					};
					res.send(JSON.stringify(result));
				}
			});
		}
	});
})

app.post('/verify_sid',function (req,res) {
	var sid = req.body.sid;
	cacheService.getKV(sid, function(data){
		if (data){
			if (data.length > 0){
				cacheService.setKV(sid, data, 1800, function(data2){});
				res.cookie('sid', sid, {maxAge: 1800000});
				var result = {
					"result":"OK"
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

app.post('/verify',function (req,res) {
    var id = req.body.id;
	var tkt = req.body.ticket;
	var urlFrom = req.body.from;

	var appCode = getAppCode(urlFrom);
	var tktCode = String(tkt).slice(0,3);
	if (appCode == tktCode){
		cacheService.getKV(tkt, function(data){
			if (data){
				var sid = data;
				cacheService.getKV(sid, function(data2){
					if (data2){
						if (data2 == id){
							var result = {
								"id":id,
								"to":urlFrom,
								"ticket":tkt,
								"result":"OK"
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
				})
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
			"result":"FAILED"
		};
		res.send(JSON.stringify(result));
	}
})

// get user's basic glance info
// id: user id
app.get('/user/glance',function (req,res) {
    var id = req.query.id;
	userService.findOneUserFromId(id, function(row){
		if (row){
			var result = {
				"result":"OK",
				"id":id,
				"name":row.name
			};
			res.send(JSON.stringify(result));
		}
		else{
			var result = {
				"result":"FAILED",
				"id":id
			};
			res.send(JSON.stringify(result));
		}
	});
})

// get user's basic glance info from email
// email: user email
app.get('/user/glance_email',function (req,res) {
  // console.log( req.query.email);
  var email = req.query.email;
  console.log(email);
	userService.findOneUserFromEmail(email, function(row){
		if (row){
			var result = {
				"result":"OK",
				"id":row.id,
				"name":row.name
			};
			res.send(JSON.stringify(result));
		}
		else{
			var result = {
				"result":"FAILED",
				"email":email
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

// apis below require signed-in
// interceptor/filter
app.use(function (req, res, next){
	var sid = req.cookies['sid'];
    // verify session
	cacheService.getKV(sid, function(data){
		if (data){
			cacheService.setKV(sid, data, 1800, function(data2){});
			next();
		}
		else{
			//res.status(401);
			//res.send("Log in expired");
			res.redirect('http://127.0.0.1:9700/home');
		}
	});
})

// get user's basic info
// id: user id
app.post('/user/info',function (req,res) {
    var id = req.body.id;
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(idGet){
		if (idGet){
			if (id == idGet){
				userService.findOneUserFromId(id, function(row){
					if (row){
						var result = {
							"result":"OK",
							"id":id,
							"name":row.name,
							"email":row.email,
							"status":row.status
						};
						res.send(JSON.stringify(result));
					}
					else{
						var result = {
							"result":"FAILED",
							"id":id
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
			res.status(401);
			res.send("Log in expired");
		}
	});
})

// update user's basic info
// id: user id
// mode: 0-username  1-password
app.post('/user/update',function (req,res) {
    var id = req.body.id;
	// TODO: need verify
	var sid = req.cookies['sid'];
	getUsrIdFromSid(sid, function(idGet){
		if (idGet){
			if (id == idGet){
				userService.findOneUserFromId(id, function(row){
						if (row){
							var email = row.email;
							var mode = req.body.mode;
							if (mode == 0){
								var newname = req.body.name;
								userService.updateOneUser(id, newname, row.pwd, email, function(err){
									if (err){
										var result = {
											"result":"FAILED",
											"id":id
										};
										res.send(JSON.stringify(result));
									}
									else{
										var result = {
											"result":"OK",
											"id":id
										};
										res.send(JSON.stringify(result));
									}
								});
							}
							else if (mode == 1){
								var inputOldPwd = req.body.oldPwd;
								var inputNewPwd = req.body.newPwd;
								inputOldPwd = crypto.createHash('md5').update(inputOldPwd).digest("hex");
								inputNewPwd = crypto.createHash('md5').update(inputNewPwd).digest("hex");
								if (inputOldPwd == row.pwd){
									userService.updateOneUser(id, row.name, inputNewPwd, email, function(err){
										if (err){
											var result = {
												"result":"FAILED",
												"id":id
											};
											res.send(JSON.stringify(result));
										}
										else{
											var result = {
												"result":"OK",
												"id":id
											};
											res.send(JSON.stringify(result));
										}
									});
								}
								else{
									var result = {
										"result":"NOT_MATCH",
										"id":id
									};
									res.send(JSON.stringify(result));
								}
							}

						}
						else{
							var result = {
								"result":"NOT_FOUND",
								"id":id
							};
							res.send(JSON.stringify(result));
						}
					});
			}
		}
		else{
			res.status(401);
			res.send("Log in expired");
		}
	});

})


var server = app.listen(9700, function () {
	userService.initSqlite();
	console.log('user server starts at 9700.');
})
