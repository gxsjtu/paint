var express = require('express');
var router = express.Router();
const PaySvc = require('../services/paySvc.js');
const Promise = require('promise');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');

router.get('/pay', oAuth.oAuth, function(req, res, next) {
  var paySvc = new PaySvc();
  var itemId = '59262f11f02f215fb0f62d7c';
  var price = 110;
  var openId = req.session.openId;
  var payargs = '';
  paySvc.getBrandWCPayRequestParams(openId, itemId, price).then(data => {
    res.render("wxpay", {
      payargs: data
    });
  }).catch(err => {
    res.status(404).end();
  });
});

router.get('/notify', oAuth.oAuth, function(req, res, next) {
  res.end();
});

module.exports = router;
