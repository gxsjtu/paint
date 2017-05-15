var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const Oauth = require('../services/oauth.js');
const IndexSvc = require('../services/indexSvc.js');
const Promise = require('Promise');

router.use(Jssdk.jssdk);
router.use(Oauth.oauth);

/* GET home page. */
router.get('/', function(req, res, next) {
  //获取index页面的走马灯图片
  var indexSvc = new IndexSvc();
  Promise.all([indexSvc.getSwipers()]).then(data => {
    res.render("index", {
      jssdk: req.jssdk,
      headers: data[0]
    });
  }).catch(err => console.log(err));
});

router.get('/openId', function(req, res, next) {
  console.log(req.params);
});

module.exports = router;
