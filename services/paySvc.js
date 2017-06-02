var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
const _ = require('lodash');
const Global = require('../global.js');
var WXPay = require('weixin-pay');
const fs = require('fs');

var wxpay = WXPay({
  appid: Global.appId,
  mch_id: Global.mch_id,
  partner_key: Global.partner_key, //微信商户平台API密钥
  pfx: fs.readFileSync('../apiclient_cert.p12'), //微信商户平台证书
});

var PaySvc = function();

PaySvc.prototype.getBrandWCPayRequestParams = function(openId, itemId, price) {
  return new Promise((resolve, reject) => {
    wxpay.getBrandWCPayRequestParams({
      openid: openId,
      // body: '公众号支付测试',
      // detail: '公众号支付测试',
      out_trade_no: itemId,
      total_fee: price,
      //spbill_create_ip: '192.168.2.210',
      //notify_url: 'http://wxpay_notify_url'
    }, function(err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

module.exports = PaySvc;
