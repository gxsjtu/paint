var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var parameterSchema = new Schema({
  token: String,
  updated: String
}, {
  versionKey: false
});

var Parameter = mongoose.model('Parameter', parameterSchema);
module.exports = Parameter;
