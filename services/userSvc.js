var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Item = require('../models/item.js');
const _ = require('lodash');
const Global = require('../global.js');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(Global.appId, Global.appSecret);

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

UserSvc.prototype.getMyBids = function(num, openId, option, date) {
  if(!option){
    return new Promise((resolve, reject) => {
      Item.find({
        bids: {
          $elemMatch: {
            openId: openId
          }
        }
      }).sort({
        create_at: -1
      }).limit(num).lean().exec((err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      })
    });
  }else{
    if(option === "up"){
      return new Promise((resolve, reject) => {
        Item.find({
          bids: {
            $elemMatch: {
              openId: openId
            }
          }
        }).where({
          create_at: {
            $lt: date
          }
        }).sort({
          create_at: -1
        }).limit(num).lean().exec((err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      });
    }
    else{
      return new Promise((resolve, reject) => {
        Item.find({
          bids: {
            $elemMatch: {
              openId: openId
            }
          }
        }).where({
          create_at: {
            $gt: date
          }
        }).sort({
          create_at: 'asc'
        }).limit(num).lean().exec((err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      });
    }
  }
}

module.exports = UserSvc;
