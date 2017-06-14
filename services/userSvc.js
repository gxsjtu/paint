var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Item = require('../models/item.js');
const _ = require('lodash');
const Global = require('../global.js');
const fs = require('fs');
const moment = require('moment');
const api = require('../services/apiWrapper.js');

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
