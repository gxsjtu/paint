var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Token = require('../models/token.js');
const _ = require('lodash');

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

module.exports = TokenSvc;
