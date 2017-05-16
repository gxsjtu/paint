var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const Promise = require('Promise');
const UserSvc = require('../services/userSvc.js');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');

router.use(Jssdk.jssdk);

/* GET home page. */
router.get('/', oAuth.oAuth, function(req, res, next) {
  var usrSvc = new UserSvc();
  userSvc.getProfile(req.session.openId).then(data => {
    console.log(data);
    res.json(data);
  }).catch(err => {
    res.json(err);
  });
});

module.exports = router;
