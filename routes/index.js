var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const IndexSvc = require('../services/indexSvc.js');
const Promise = require('promise');
const ItemSvc = require('../services/itemSvc.js');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');

router.use(Jssdk.jssdk);

/* GET home page. */
router.get('/', oAuth.oAuth, function(req, res, next) {
  //获取index页面的走马灯图片
  var indexSvc = new IndexSvc();
  Promise.all([indexSvc.getSwipers(), indexSvc.getTodayItems()]).then(data => {
    res.render("index", {
      jssdk: req.jssdk,
      headers: data[0],
      today: data[1],
    });
  }).catch(err => console.log(err));
});

router.get('/openId', function(req, res, next) {
  var code = req.query.code;
  var state = req.query.state;
  oAuth.client.getAccessToken(code, function(err, result) {
    if (err || !(result.data)) {
      console.log(err);
      oAuth.oAuth(req, res, next);
    }
    req.session.openId = result.data.openid;
    res.redirect(state);
  });
});

module.exports = router;
