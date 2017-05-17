var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var ItemSchema = new Schema({
  images: [String],
  openId: String,
  name: String,
  author: String,
  price: String,
  dimension: {
    height: Number,
    width: Number
  },
  valid:{
    from: String,
    to: String
  },
  likes: [String],
  comment: String,
  bids: [{
    openId: String,
    price: Number,
    create_at: {
      type: String,
      default: () => {
        return moment().format('YYYY-MM-DD HH:mm:ss')
      }
    }
  }],
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
