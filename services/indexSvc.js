var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
const _ = require('lodash');
const fs = require('fs');
const junk = require('junk');
const Global = require('../global.js');
const Item = require('../models/item.js');
const moment = require('moment');

var IndexSvc = function() {

};

IndexSvc.prototype.getSwipers = function() {
  return new Promise(function(resolve, reject) {
    var path = __dirname + '/..' + '/public/images/swiper/index';
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        var res = [];
        _.forEach(files.filter(junk.not), x => {
          res.push(
            Global.server + '/images/swiper/index/' + x
          );
        })
        resolve(res);
      }
    })
  });
}

IndexSvc.prototype.getTodayItems = function() {
  return new Promise((resolve, reject) => {
    Item.find().gt(moment().date()).lt(moment().date().add(1, "days")).sort({
      create_at: -1
    }).take(6).exec((err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

module.exports = IndexSvc;
