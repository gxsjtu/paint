const Parameter = require('../models/parameter.js');
const moment = require('moment');
const Global = require('../global.js');
var WechatAPI = require('wechat-api');

var api = new WechatAPI(Global.appId, Global.appSecret, function(callback) {
    Parameter.findOne({}, (err, data) => {
      if (err || !data) {
        return callback(err);
      }
      return callback(null, JSON.parse(data.token));
    });
  },
  function(token, callback) {
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

module.exports = api;
