var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const Errors = require('../services/error.js');
var itemSvc = new ItemSvc();

router.use(Jssdk.jssdk);

router.get('/search/:type/:catalog/:key', function(req, res, next) {
  var method = 'search';
  var type = req.params.type;
  var catalog = req.params.catalog;
  var key = req.params.key;
  res.render("todayMore", {
    typeStr: method,
    type: type,
    catalog: catalog,
    key: key
  });
})

router.get('/:type', oAuth.oAuth, function(req, res, next) {
  var type = req.params.type;
  res.render("todayMore", {
    typeStr: type,
    openId: req.query.openId
  });
})

module.exports = router;
