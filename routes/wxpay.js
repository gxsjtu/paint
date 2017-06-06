var express = require('express');
var router = express.Router();
const PaySvc = require('../services/paySvc.js');
const Promise = require('promise');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');
const oAuth = require('../services/oAuth.js');
const _ = require('lodash');
const ItemSvc = require('../services/itemSvc.js');
var itemSvc = new ItemSvc();
const Jssdk = require('../services/jssdk.js');
const Global = require('../global.js');
var WXPay = require('weixin-pay');
const fs = require('fs');
const path = require('path');
const Item = require('../models/item.js');

var wxpay = WXPay({
  appid: Global.appId,
  mch_id: Global.mch_id,
  partner_key: Global.partner_key, //微信商户平台API密钥
  pfx: fs.readFileSync(path.normalize(__dirname + '/..' + '/apiclient_cert.p12')), //微信商户平台证书
});

router.get('/pay', Jssdk.jssdk, function(req, res, next) {
  var itemId = req.query.itemId;
  itemSvc.getItemById(itemId).then(item => {
    if (item) {
      var paySvc = new PaySvc(wxpay);
      var lastBids = _.max(item.bids, 'price');
      var price = lastBids.price;
      var openId = req.session.openId;
      var payargs = '';
      paySvc.getBrandWCPayRequestParams(openId, itemId, price * 100).then(data => {
        res.render("wxpay", {
          payargs: data,
          item: item,
          price: price,
          jssdk: req.jssdk
        });
      }).catch(err => {
        res.status(404).end();
      });
    } else {
      res.json(new Result(Errors.GetItemsFailed));
    }
  }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
});

// 支付结果异步通知
router.post('/notify', wxpay.useWXCallback(function(msg, req, res, next) {
  // 处理商户业务逻辑
  var openId = msg.openid;
  var itemId = _.split(msg.out_trade_no, '_');
  var status = 0;
  if (msg.return_code === "SUCCESS") {
    status = 1;
  }
  Item.findOneAndUpdate({
    _id: itemId[0]
  }, {
    order: {
      openId: openId,
      status: status
    }
  }, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }).then(data => {
    console.log(data);
    res.success();
  }).catch(err => {
    console.log(err);
    res.fail()
  });
  // res.success() 向微信返回处理成功信息，res.fail()返回失败信息。
}));

module.exports = router;
