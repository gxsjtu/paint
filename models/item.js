var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var ItemSchema = new Schema({
  name: String,
  author: String,
  price: String,
  isForIndexSwiper: {
    type: Boolean,
    default: false,

  },
  dimension: {
    height: Number,
    width: Number
  },
  comment: String,
  create_at: {
    type: String,
    default: () => {
      return moment().format('YYYY-MM-DD HH:mm:ss')
    }
  }
}, {
  versionKey: false
});

var Item = mongoose.model('Item', ItemSchema);
module.exports = Item;
