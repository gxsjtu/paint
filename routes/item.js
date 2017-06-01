var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const Promise = require('promise');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const UserSvc = require('../services/userSvc.js');
const IndexSvc = require('../services/indexSvc.js');
var itemSvc = new ItemSvc();
var userSvc = new UserSvc();
var indexSvc = new IndexSvc();
router.use(Jssdk.jssdk);

router.get('/getMyBids', function(req, res, next) {
  var openId = req.session.openId;
  userSvc.getMyBids(openId).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(err => res.json(new Result(Errors.GetMyBidsFailed, err)));
});


router.get('/getTodayItems/:upOrDown/:creatAt', function(req, res, next) {
  var upOrDown = req.params.upOrDown;
  var createAt = req.params.creatAt;
  if(upOrDown == 0){
    upOrDown = '';
    creatAt = '';
  }
  indexSvc.getTodayItems(30,upOrDown,createAt).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
});

router.get('/getItemBySearch/:key/:group/:upOrDown/:creatAt', function(req, res, next) {
  var key = req.params.key;
  var group = req.params.group;
  var upOrDown = req.params.upOrDown;
  var createAt = req.params.creatAt;
  if(upOrDown == 0){
    upOrDown = '';
    creatAt = '';
  }
  itemSvc.getSearchItems(30,upOrDown,createAt).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
});

router.get('/:itemId', oAuth.oAuth, function(req, res, next) {
  var itemId = req.params.itemId;
  var openId = req.session.openId;
  Promise.all([itemSvc.getItemById(itemId), itemSvc.getLikes(itemId, openId)]).then(data => {
    var isMe = (openId == data[0].openId ? true : false);
    res.render("item", {
      item: data[0],
      like: data[1],
      isMe: isMe
    });
  }).catch(err => {
    res.json(err);
  });
});

router.get('/getItemsByOpenId', oAuth.oAuth, function(req, res, next) {
  var openId = req.session.openId;
  itemSvc.getItemsByOpenId(openId).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
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
