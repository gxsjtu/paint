var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const Errors = require('../services/error.js');
var itemSvc = new ItemSvc();

router.use(Jssdk.jssdk);
router.get('/', oAuth.oAuth, function(req, res, next) {
  var openId = req.query.openId;
  itemSvc.getItemsByOpenId(openId).then(data => {
    res.render("myGallery", {
      items: data
    });
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
})

module.exports = router;
