var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const IndexSvc = require('../services/indexSvc.js');
const Promise = require('Promise');
const ItemSvc = require('../services/itemSvc.js');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const OAuth = require('wechat-oauth');
const TokenSvc = require('../services/tokenSvc.js');
const Global = require('../global.js');
const axios = require('axios');

var tokenSvc = new TokenSvc();
var client = new OAuth(Global.appId, Global.appSecret, function(openid, callback) {
  // 传入一个根据openid获取对应的全局token的方法
  // 在getUser时会通过该方法来获取token
  tokenSvc.getToken(openid, callback);
}, function(openid, token, callback) {
  // 持久化时请注意，每个openid都对应一个唯一的token!
  tokenSvc.setToken(openid, token, callback);
});

router.use(Jssdk.jssdk);

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.openId) {
    var u = client.getAuthorizeURL("http://painting.shtx.com.cn/openId", req.originalUrl, 'snsapi_base');
    res.redirect(u);
  } else {
    //获取index页面的走马灯图片
    var indexSvc = new IndexSvc();
    Promise.all([indexSvc.getSwipers(), indexSvc.getTodayItems()]).then(data => {
      res.render("index", {
        jssdk: req.jssdk,
        headers: data[0],
        today: data[1],
      });
    }).catch(err => console.log(err));
  }
});

router.get('/openId', function(req, res, next) {
  var code = req.query.code;
  var state = req.query.state;
  client.getAccessToken(code, function(err, result) {
    req.session.openId = result.data.openid;
    res.redirect(state);
  });
});

module.exports = router;
