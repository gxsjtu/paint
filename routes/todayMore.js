var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const Errors = require('../services/error.js');
var itemSvc = new ItemSvc();

router.use(Jssdk.jssdk);
router.get('/:type', function(req, res, next) {
    var type = req.params.type;
    res.render("todayMore", {typeStr:type});
})
router.get('/:type/:search', function(req, res, next) {
    var type = req.params.type;
    var search = req.params.search;
    res.render("todayMore", {typeStr:type});
})

module.exports = router;
