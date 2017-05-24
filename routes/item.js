var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const Promise = require('promise');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
var itemSvc = new ItemSvc();
router.use(Jssdk.jssdk);

router.get('/:itemId', oAuth.oAuth, function(req, res, next) {
  var itemId = req.params.itemId;
  var openId = req.session.openId;
  Promise.all([itemSvc.getItemById(itemId), itemSvc.getLikes(itemId, openId)]).then(data => {
    res.render("item", {
      item: data[0],
      like: data[1]
    });
  }).catch(err => {
    res.json(err);
  });
});

router.get('/like/:itemId', oAuth.oAuth, function(req, res, next) {
  var itemId = req.params.itemId;
  var openId = req.session.openId;
  itemSvc.like(itemId, openId).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(err => res.json(new Result(Errors.Success, 0)));
});

router.get('/getBids/:itemId', oAuth.oAuth, function(req, res, next) {
  var itemId = req.params.itemId;
  itemSvc.getBids(itemId).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(err => res.json(new Result(Errors.Success, 0)));
});

router.get('/bid/:itemId/:price', oAuth.oAuth, function(req, res, next) {
  var itemId = req.params.itemId;
  var price = req.params.price;
  var openId = req.session.openId;
  itemSvc.bid(itemId, openId, price).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(err => {
    res.json(new Result(Errors.BidFailed, err))
  });
});


module.exports = router;
