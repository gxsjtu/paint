var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const Promise = require('promise');
const ItemSvc = require('../services/itemSvc.js');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');
const UserSvc = require('../services/userSvc.js');

router.use(Jssdk.jssdk);
var itemSvc = new ItemSvc();
var userSvc = new UserSvc();

/* GET home page. */
router.get('/', oAuth.oAuth, function(req, res, next) {
  Promise.all([itemSvc.getType(), itemSvc.getCatalog()]).then(data => {
    res.render("sell", {
      jssdk: req.jssdk,
      type: data[0],
      catalog: data[1],
    });
  }).catch(err => console.log(err));
});

router.post('/saveItem', function(req, res, next) {
  var images = req.body.images;
  var name = req.body.name;
  var author = req.body.author;
  var catalog = req.body.catalog;
  var comment = req.body.comment;
  var type = req.body.type;
  var price = req.body.price;
  var width = req.body.width;
  var height = req.body.height;
  var from = req.body.auctionStartDate;
  var to = req.body.auctionEndDate;
  var avatar = "";
  var nick = "";

  userSvc.getProfile(req.session.openId).then(data => {
    avatar = data.headimgurl;
    nick = data.nickname;
  }).catch(err => {

  }).finally(() => {
    itemSvc.save(name, author, width, height, comment, type, catalog, price, images, from, to, avatar, nick, req.session.openId).then(data => {
      res.json(new Result(Errors.Success, data));
    }).catch(err => {
      res.json(new Result(Errors.SaveItemFailed, err));
    });
  });
});

module.exports = router;
