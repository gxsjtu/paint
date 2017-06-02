var express = require('express');
var router = express.Router();

const Promise = require('promise');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');

router.get('/', oAuth.oAuth,function(req, res, next) {
  var itemId = '59262f11f02f215fb0f62d7c';
  var price = 110;
  var openId = req.session.openId;
  var payargs = '';
  res.render("pay",{
    payargs:payargs
  });
});

module.exports = router;
