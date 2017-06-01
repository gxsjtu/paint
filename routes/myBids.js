var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const UserSvc = require('../services/userSvc.js');
const Errors = require('../services/error.js');
var userSvc = new UserSvc();
const Promise = require('promise');

router.use(Jssdk.jssdk);
router.get('/', function(req, res, next) {
  res.render("todayMore", {typeStr:'myBids'});
})

module.exports = router;
