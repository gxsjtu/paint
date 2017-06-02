var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
const _ = require('lodash');
const Global = require('../global.js');
var WXPay = require('weixin-pay');
const fs = require('fs');
const path = require('path');

var wxpay = WXPay({
  appid: Global.appId,
  mch_id: Global.mch_id,
  partner_key: Global.partner_key, //微信商户平台API密钥
  pfx: fs.readFileSync(path.normalize(__dirname + '/..' + '/apiclient_cert.p12')), //微信商户平台证书
});

var PaySvc = function() {};

PaySvc.prototype.getBrandWCPayRequestParams = function(openId, itemId, price) {
  return new Promise((resolve, reject) => {
    wxpay.getBrandWCPayRequestParams({
      openid: openId,
      body: '公众号支付测试body',
      detail: '公众号支付测试detail',
      out_trade_no: itemId,
      total_fee: price,
      //spbill_create_ip: '192.168.2.210',
      notify_url: Global.server + '/pay/notify'
    }, function(err, result) {
      if (err) {
        return reject(err);
      }
      console.log(result);
      return resolve(JSON.stringify(result));
    });
  });
};

module.exports = PaySvc;
