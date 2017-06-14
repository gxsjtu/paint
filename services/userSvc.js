var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Item = require('../models/item.js');
const _ = require('lodash');
const Global = require('../global.js');
var WechatAPI = require('wechat-api');
const fs = require('fs');
const Parameter = require('../models/parameter.js');
const moment = require('moment');

var api = new WechatAPI(Global.appId, Global.appSecret, function(callback) {
    // 传入一个获取全局token的方法
    // fs.readFile(__dirname + '/access_token.txt', 'utf8', function(err, txt) {
    //   if (err || !txt) {
    //     return callback(err);
    //   }
    //   callback(null, JSON.parse(txt));
    // });
    Parameter.findOne({}, (err, data) => {
      if (err || !data) {
        return callback(err);
      }
      return callback(null, JSON.parse(data.token));
    });
  },
  function(token, callback) {
    // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
    // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
    //fs.writeFile(__dirname + '/access_token.txt', JSON.stringify(token), callback);
    Parameter.findOneAndUpdate({}, {
      token: JSON.stringify(token),
      updated: moment().format('YYYY-MM-DD HH:mm:ss')
    }, {
      upsert: true,
      new: true
    }, (err, data) => {
      if (err) {
        console.log(err);
      }
    });
  });

var UserSvc = function() {

}

UserSvc.prototype.getProfile = function(openId) {
  return new Promise((resolve, reject) => {
    api.getUser(openId, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

UserSvc.prototype.getMyBids = function(openId) {
  return new Promise((resolve, reject) => {
    Item.find({
      bids: {
        $elemMatch: {
          openId: openId
        }
      }
    }).sort({
      create_at: -1
    }).lean().exec((err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    })
  });
};

module.exports = UserSvc;
