var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Item = require('../models/item.js');
const _ = require('lodash');


var ItemSvc = function(){

}

ItemSvc.prototype.save = function (name, author, width, height, comment, type, catalog, price, images) {
  var item = new Item();
  item.images = images;
  return new Promise((resolve, reject) => {
      item.save(err => {
        if(err){
          return reject(err);
        }
        return resolve();
      });
  });
};

module.exports = ItemSvc;
