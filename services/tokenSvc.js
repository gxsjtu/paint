var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Token = require('../models/token.js');
const _ = require('lodash');
const OAuth = require('wechat-oauth');

var TokenSvc = function() {};

TokenSvc.prototype.getToken = function(openid, cb) {
  Token.findOne({
    openid: openid
  }, function(err, result) {
    if (err) throw err;
    return cb(null, result);
  });
};

TokenSvc.prototype.setToken = function(openid, token, cb) {
  // 有则更新，无则添加
  var query = {
    openid: openid
  };
  var options = {
    upsert: true
  };
  Token.update(query, token, options, function(err, result) {
    if (err) throw err;
    return cb(null);
  });
};

TokenSvc.prototype.getOpenId = function() {
  var client = new OAuth(Global.appId, Global.appSecret, function(openid, callback) {
    // 传入一个根据openid获取对应的全局token的方法
    // 在getUser时会通过该方法来获取token
    tokenSvc.getToken(openid, callback);
  }, function(openid, token, callback) {
    // 持久化时请注意，每个openid都对应一个唯一的token!
    tokenSvc.setToken(openid, token, callback);
  });
};



module.exports = TokenSvc;
