var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
const _ = require('lodash');
const fs = require('fs');
const junk = require('junk');
const Global = require('../global.js');
const Item = require('../models/item.js');
const moment = require('moment');
const async = require('async');
const ItemSvc = require('../services/itemSvc.js');

var IndexSvc = function() {

};

IndexSvc.prototype.getSwipers = function() {
  return new Promise(function(resolve, reject) {
    var path = __dirname + '/..' + '/public/images/swiper/index';
    fs.readdir(path, (err, files) => {
      if (err) {
        return reject(err);
      } else {
        var res = [];
        _.forEach(files.filter(junk.not), x => {
          res.push(
            Global.server + '/images/swiper/index/' + x
          );
        })
        return resolve(res);
      }
    })
  });
}

IndexSvc.prototype.getTodayItems = function(openId) {
  var itemSvc = new ItemSvc();
  return new Promise((resolve, reject) => {
    Item.where({
      // create_at: {
      //   $gt: moment().format('YYYY-MM-DD'),
      //   $lt: moment().add(1, "days").format('YYYY-MM-DD')
      // }
    }).sort({
      create_at: -1
    }).limit(6).exec((err, data) => {
      if (err) {
        return reject(err);
      }
      //
      async.each(data, (x, callback) => {
        itemSvc.getLikes(x._id, openId).then(y => {
          x.canLike = y.canLike;
          x.likes = y.likes;
        });
        callback();
        return resolve(data);
      }, err => {
        return resolve(data);
      });
    });
  });
};

module.exports = IndexSvc;
