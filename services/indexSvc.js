var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
const _ = require('lodash');
const Item = require('../models/item.js');

var IndexSvc = function() {

};

IndexSvc.prototype.getSwipers = function() {
  return new Promise(function(resolve, reject) {
    Item.find({
      isForIndexSwiper: true
    }).then(data => {
      resolve(data);
    }).catch(err => {
      console.log(err);
      reject(err);
    });
  });
};

module.exports = IndexSvc;
