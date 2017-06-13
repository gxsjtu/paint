var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const Errors = require('../services/error.js');
var itemSvc = new ItemSvc();

router.use(Jssdk.jssdk);

router.get('/', function(req, res, next) {
  var openId = req.query.openId;
  itemSvc.getShareItemsByOpenId(openId).then(data => {
    res.render("sharePage", {
      items: data,
      jssdk: req.jssdk,
    });
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
})

module.exports = router;
