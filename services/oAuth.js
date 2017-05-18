const Errors = require('./error.js');
const Result = require('./result.js');
const Promise = require('promise');
const TokenSvc = require('../services/tokenSvc.js');
var tokenSvc = new TokenSvc();
const _ = require('lodash');
const Global = require('../global.js');
const OAuth = require('wechat-oauth');

var client = new OAuth(Global.appId, Global.appSecret, function(openid, callback) {
  // 传入一个根据openid获取对应的全局token的方法
  // 在getUser时会通过该方法来获取token
  tokenSvc.getToken(openid, callback);
}, function(openid, token, callback) {
  // 持久化时请注意，每个openid都对应一个唯一的token!
  tokenSvc.setToken(openid, token, callback);
});

module.exports.oAuth = function(req, res, next) {
  if (!req.session.openId) {
    var u = client.getAuthorizeURL(Global.server + "/openId", req.originalUrl, 'snsapi_base');
    res.redirect(u);
  } else {
    next();
  }
}

module.exports.client = client;
