var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const oAuth = require('../services/oAuth.js');
const ItemSvc = require('../services/itemSvc.js');
const Errors = require('../services/error.js');
var itemSvc = new ItemSvc();

router.use(Jssdk.jssdk);

router.get('/', function(req, res, next) {
  var isCanFull = false;
  var option = req.query.option;
  if (option == 'detail') {
    var itemId = req.query.itemId;
    var datas = []
    itemSvc.getItemById(itemId).then(data => {
      datas.push(data);
      res.render("sharePage", {
        items: datas,
        jssdk: req.jssdk,
        isFull: true
      }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
    })
  } else {
    var openId = req.query.openId;
    itemSvc.getShareItemsByOpenId(openId, 2).then(data => {
      if (data.length > 1) {
        isCanFull = false;
      } else {
        isCanFull = true;
      }
      res.render("sharePage", {
        items: data,
        jssdk: req.jssdk,
        isFull: isCanFull
      });
    }).catch(err => res.json(new Result(Errors.GetItemsFailed, err)));
  }
})

module.exports = router;
