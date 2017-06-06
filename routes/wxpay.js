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

router.get('/pay/:itemId', function(req, res, next) {
  //res.render("wxpay");
  var itemId = req.params.itemId;
  itemSvc.getItemById(itemId).then(item => {
    if(item){
      var paySvc = new PaySvc();
      var lastBids = _.max(item.bids, 'price');
      var price = lastBids.price * 100;
      var openId = req.session.openId;
      var payargs = '';
      paySvc.getBrandWCPayRequestParams(openId, itemId, price).then(data => {
        res.render("wxpay", {
          payargs: data,
          item:item,
          price:price
        });
      }).catch(err => {
        res.status(404).end();
      });
    }
    else{
      res.json(new Result(Errors.GetItemsFailed));
    }
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
});

router.get('/notify', oAuth.oAuth, function(req, res, next) {
  res.end();
});

module.exports = router;
