var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
const _ = require('lodash');
const fs = require('fs');
const junk = require('junk');

var IndexSvc = function() {

};

IndexSvc.prototype.getSwipers = function() {
  return new Promise(function(resolve, reject) {
    return new Promise(function(resolve, reject) {
      var path = __dirname + '/..' + '/public/images/swiper/index';
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files.filter(junk.not));
        }
      })
    });
  });
};

module.exports = IndexSvc;
