var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var ItemSchema = new Schema({
  myMaxPrice: Number,//我出的最高价
  maxPrice: Number,//所有出价中的最高价
  canLike: Boolean,
  images: [String],
  openId: String,
  nick: String,
  avatar: String,
  name: String,
  author: String,
  price: String,
  catalog: String,
  dimension: {
    height: Number,
    width: Number
  },
  valid: {
    from: String,
    to: String
  },
  likes: [String],
  comment: String,
  bids: [{
    _id: false,
    openId: String,
    nick: String,
    avatar: String,
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
