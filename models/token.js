var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var TokenSchema = new Schema({
  access_token: String,
  expires_in: Number,
  refresh_token: String,
  openid: String,
  scope: String,
  create_at: String
}, {
  versionKey: false
});

var Token = mongoose.model('Log', TokenSchema);
module.exports = Token;
