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
  Promise.all([itemSvc.getItemById(itemId)]).then(data => {
    res.render("item", {
      item: data[0]
    });
  }).catch(err => {
    res.json(err);
  });
});

module.exports = router;
