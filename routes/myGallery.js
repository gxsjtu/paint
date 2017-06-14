var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const Errors = require('../services/error.js');
var itemSvc = new ItemSvc();

router.use(Jssdk.jssdk);

router.get('/getMyGalleryByType/:type', oAuth.oAuth, function(req, res, next) {
  var openId = req.query.openId;
  var type = req.params.type;

  itemSvc.getShareItemsByOpenId(openId,type).then(data => {
    res.json(data);
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
})

router.get('/', oAuth.oAuth, function(req, res, next) {
  var openId = req.query.openId;
  itemSvc.getShareItemsByOpenId(openId,2).then(data => {
    res.render("myGallery", {
      items: data,
      jssdk: req.jssdk
    });
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
})

module.exports = router;
