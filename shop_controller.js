"use strict";
// controller_shop

var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(cookieParser());
var http = require('http');  
var qs = require('querystring');  

var creditService = require('./credit_service');
var cacheService = require('./cache_service');

var product1 = 5;
var product2 = 20;
var product3 = 100;

app.use('/static', express.static('static/shop'));

app.get('/shop', function (req, res) {
	res.status(200);
	res.type('text/html');
	res.sendFile(__dirname + "/static/shop/home.html");
})

app.post('/activate', function (req, res) {
	var usrId = req.body.user;
	creditService.findOneUserFromUsrId(usrId, function(row){
		if (row){
			var result = {
				"result":"EXIST",
				"usrId":usrId
			};
			res.send(JSON.stringify(result));
		}
		else{
			creditService.activateUser(usrId, function(err){
				if (err){
					var result = {
						"result":"FAILED",
						"usrId":usrId
					};
					res.send(JSON.stringify(result));
				}
				else{
					var result = {
						"result":"OK",
						"usrId":usrId
					};
					res.send(JSON.stringify(result));
				}
			});
		}
	});
	
})

app.post('/user/get', function (req, res) {
	var usrId = req.body.user;
	creditService.findOneUserFromUsrId(usrId, function(row){
		if (row){
			var result = {
				"result":"OK",
				"usrId":usrId,
				"credit":row.cre
			};
			res.send(JSON.stringify(result));
		}
		else{
			var result = {
				"result":"NOT_EXIST",
				"usrId":usrId
			};
			res.send(JSON.stringify(result));
		}
	});
})

function sub_reqAddFriendLimit(usrId, tkt, amount){
	var headers = {
		'Content-type':'application/json;charset=UTF-8'
	};
	var options = {
		method:'POST',
		host:'127.0.0.1',
		port:'9701',
		path:'/blog/user/' + usrId + '/addfriendlimit',
		headers:headers
	};
	var body = {
		"tkt":tkt, 
		"amount":amount
	};
	var req = http.request(options, function(res){
		//imp
	});
}

function sub_reqVerifyUserTkt(tkt, usrId, callback){
	var headers = {
		'Content-Type':'application/x-www-form-urlencoded'
	};
	var bodyData = {
		"ticket":tkt, 
		"id":usrId,
		"from":"shop"
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

app.post('/shop/purchase', function (req, res) {
	var sid = req.body.sid;
	var productId = req.body.prod;
	var productPrice = 0;
	if (productId == "product_id1"){
		productPrice = product1;
	}
	else if (productId == "product_id2"){
		productPrice = product2;
	}
	else if (productId == "product_id3"){
		productPrice = product3;
	}
	cacheService.getKV(sid, function(data){
		if (data){
			var usrId = data;
			creditService.creditTransfer(usrId, "admin", productPrice, 0, function(err){
				if (err){
					var result = {
						"result":"FAILED"
					};
					res.send(JSON.stringify(result));
				}
				else{
					//sub_reqAddFriendLimit
					var result = {
						"result":"OK"
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
	});

})

app.post('/shop/topup', function (req, res) {
	var sid = req.body.sid;
	cacheService.getKV(sid, function(data){
		if (data){
			creditService.creditAdd(data, 20, function(err){
				if (err){
					var result = {
						"result":"FAILED"
					};
					res.send(JSON.stringify(result));
				}
				else{
					var result = {
						"result":"OK"
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
	});
})

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
			var result = {
				"result":"FAILED"
			};
			res.send(JSON.stringify(result));
		}
	});
})

app.post('/transaction/get', function (req, res) {
	var sid = req.body.sid;
	var pageIdx = req.body.page;
	var pageSize = req.body.pageSize;
	cacheService.getKV(sid, function(data){
		if (data){
			creditService.findRecordInPageFromUserId(data, pageSize, pageIdx, function(rows){
				if (rows){
					var result = {
						"result":"OK",
						"record":rows
					};
					res.send(JSON.stringify(result));
				}
				else{
					var result = {
						"result":"EMPTY"
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
	});
})

app.post('/transaction/count', function (req, res) {
	var sid = req.body.sid;
	cacheService.getKV(sid, function(data){
		if (data){
			creditService.findRecordCountFromUserId(data, function(number){
				if (number){
					var result = {
						"result":"OK",
						"number":number
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
				"result":"FAILED"
			};
			res.send(JSON.stringify(result));
		}
	});

})

var server = app.listen(9702, function () {
	creditService.initSqlite();
	console.log('user server starts at 9702.');
})