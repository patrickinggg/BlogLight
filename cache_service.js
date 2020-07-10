"use strict";
// model_cache

var uuid = require('uuid');
var redis = require('redis');
var client = redis.createClient(6379, '127.0.0.1');

// set key-value pair
// key: key
// value: value
// expire: expire time in second
// callback: (data)
function funcSetKVPair(key, value, expire, callback){
	client.set(key, value);
	client.expire(key, expire, function(err, data){
		if (err){
			callback(null);
		}
		else{
			callback(data);
		}
	});
}

// get key-value pair
// key: key
// callback: (data)
function funcGetKVPair(key, callback){
	client.get(key, function(err, data){
		if (err){
			callback(null);
		}
		else{
			callback(data);
		}
    });
}

// create UUID
// return: UUID
function funcGetRandomSession(){
	var session = uuid.v1();
	return session;
}


exports.setKV = funcSetKVPair;
exports.getKV = funcGetKVPair;
exports.createUUID = funcGetRandomSession;
