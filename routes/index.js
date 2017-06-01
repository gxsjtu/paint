var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const IndexSvc = require('../services/indexSvc.js');
const Promise = require('promise');
const ItemSvc = require('../services/itemSvc.js');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');
const fs = require('fs');
var images = require("images");
var path = require("path");
const _ = require('lodash');

router.use(Jssdk.jssdk);

router.get('/images',function(req,res,next){
  // var bigImage = images(path.join(process.cwd() , '/public/images/swiper/index/5919570edb42022e589808ff'));
  var bigImage = images('http://img.mp.itc.cn/upload/20170529/350a44e9d2d843bfb69c562413fa9978_th.jpg');
  var smallImage = images(path.join(process.cwd(),'/public/images/2.jpg')).resize(100);
  var height1 = bigImage.height();
  var width1 = bigImage.width();
  var height2 = smallImage.height();
  var width2 = smallImage.width();
  var outputPath = path.join(process.cwd(),'/public/images/output.jpg');
  bigImage.draw(smallImage,width1-width2-20,height1-height2-20).save(outputPath);
  res.render('images',{
    image:'/images/output.jpg'
  })
})

/* GET home page. */
router.get('/', oAuth.oAuth, function(req, res, next) {
  //获取index页面的走马灯图片
  var indexSvc = new IndexSvc();
  var openId = req.session.openId;
  Promise.all([indexSvc.getSwipers(), indexSvc.getTodayItems(6, "", "")]).then(data => {
    var todayDatas = data[1];
    var result = [];
    _.forEach(todayDatas, (t) => {
      if (t.likes.indexOf(openId) < 0) {
        t.canLike = true;
      } else {
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
    // if (err || !(result.data)) {
    //   console.log(err);
    //   oAuth.oAuth(req, res, next);
    // }
    // req.session.openId = result.data.openid;
    // res.redirect(state);
    if (result && result.data && result.data.openid) {
      req.session.openId = result.data.openid;
    }
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
