var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const Errors = require('../services/error.js');
var itemSvc = new ItemSvc();

// router.use(Jssdk.jssdk);
router.get('/', function(req, res, next) {
  var openId = 'o9nEBjwL7fxFLngQFPszSw8XRfPc';
  itemSvc.getItemsByOpenId(openId).then(data => {
    res.render("myGallery", {
      items: data,
      jssdk: req.jssdk,
    });
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
})

module.exports = router;
