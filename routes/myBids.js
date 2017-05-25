var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const UserSvc = require('../services/userSvc.js');
const Errors = require('../services/error.js');
var userSvc = new UserSvc();
const Promise = require('promise');

router.use(Jssdk.jssdk);
router.get('/', oAuth.oAuth, function(req, res, next) {
  var openId = req.session.openId;
  Promise.all([userSvc.getMyBids(openId)]).then(data => {
    res.render("myBids", {
      items: data[0]
    });
  }).catch(err => console.log(err));
})

module.exports = router;
