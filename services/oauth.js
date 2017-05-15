const Global = require('../global.js');
var OAuth = require('wechat-oauth');
const TokenSvc = require('../services/tokenSvc.js');
var client = new OAuth(Global.appId, Global.appSecret, function(openid, callback) {
  // 传入一个根据openid获取对应的全局token的方法
  // 在getUser时会通过该方法来获取token
  Token.getToken(openid, callback);
}, function(openid, token, callback) {
  // 持久化时请注意，每个openid都对应一个唯一的token!
  Token.setToken(openid, token, callback);
});
const url = require('url');

module.exports.oauth = function(req, res, next) {
  var u = client.getAuthorizeURL("http://painting.shtx.com.cn/openId", 'state', 'snsapi_base');
  next();
};
