var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Item = require('../models/item.js');
const _ = require('lodash');
const Global = require('../global.js');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(Global.appId, Global.appSecret);

var UserSvc = function(){

}

UserSvc.prototype.getProfile = function (openId) {
  return new Promise((resolve, reject) => {
    api.getUser(openId, (err, data) => {
      if(err){
        return reject(err);
      }
      return resolve(data);
    });
  });
};

module.exports = UserSvc;
