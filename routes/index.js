var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');

router.use(Jssdk.jssdk);

/* GET home page. */
router.get('/buy', function(req, res, next) {
  res.render('index', {
    jssdk: req.jssdk
  });
});

module.exports = router;
