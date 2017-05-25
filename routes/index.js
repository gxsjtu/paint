var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const IndexSvc = require('../services/indexSvc.js');
const Promise = require('promise');
const ItemSvc = require('../services/itemSvc.js');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');
const _ = require('lodash');

router.use(Jssdk.jssdk);

/* GET home page. */
router.get('/', oAuth.oAuth, function(req, res, next) {
  //获取index页面的走马灯图片
  var indexSvc = new IndexSvc();
  var openId = req.session.openId;
  Promise.all([indexSvc.getSwipers(), indexSvc.getTodayItems(6)]).then(data => {
    var todayDatas = data[1];
    var result = [];
    _.forEach(todayDatas,(t) => {
        if(t.likes.indexOf(openId) < 0){
          t.canLike = true;
        }else{
          t.canLike = false;
        }
        result.push(t);
    });

    res.render("index", {
      jssdk: req.jssdk,
      headers: data[0],
      today: result
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

router.get('/like/:itemId', oAuth.oAuth, function(req, res, next) {
  var itemSvc = new ItemSvc();
  var itemId = req.params.itemId;
  var openId = req.session.openId;
  itemSvc.like(itemId, openId).then(data => {
    res.json(new Result(Errors.Success, data))
  }).catch(res.json(new Result(Errors.Success, 0)));
});

module.exports = router;
