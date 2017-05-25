var express = require('express');
var router = express.Router();

const Promise = require('promise');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');

router.get('/', function(req, res, next) {
  res.render("search");
});

module.exports = router;
