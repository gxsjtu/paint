var express = require('express');
var router = express.Router();
const PaySvc = require('../services/paySvc.js');
const Promise = require('promise');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');
const _ = require('lodash');
const ItemSvc = require('../services/itemSvc.js');
var itemSvc = new ItemSvc();
const Jssdk = require('../services/jssdk.js');

router.get('/pay', Jssdk.jssdk, function(req, res, next) {
  var itemId = req.query.itemId;
  itemSvc.getItemById(itemId).then(item => {
    if (item) {
      var paySvc = new PaySvc();
      var lastBids = _.max(item.bids, 'price');
      var price = lastBids.price;
      var openId = req.session.openId;
      var payargs = '';
      paySvc.getBrandWCPayRequestParams(openId, itemId, price * 100).then(data => {
        res.render("wxpay", {
          payargs: data,
          item: item,
          price: price,
          jssdk: req.jssdk
        });
      }).catch(err => {
        res.status(404).end();
      });
    } else {
      res.json(new Result(Errors.GetItemsFailed));
    }
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
});

router.post('/notify', oAuth.oAuth, function(req, res, next) {
  console.log(req);
  res.end();
});

module.exports = router;
