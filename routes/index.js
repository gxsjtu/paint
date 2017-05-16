var express = require('express');
var router = express.Router();
const Jssdk = require('../services/jssdk.js');
const Oauth = require('../services/oauth.js');
const IndexSvc = require('../services/indexSvc.js');
const Promise = require('Promise');
const ItemSvc = require('../services/itemSvc.js');
const Result = require('../services/result.js');
const Errors = require('../services/error.js');

router.use(Jssdk.jssdk);
router.use(Oauth.oauth);

/* GET home page. */
router.get('/', function(req, res, next) {
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

router.get('/today', function(req, res, next) {
  console.log(req.params);
});

router.post('/saveItem', function(req, res, next) {
  var images = req.body.images;
  var name = req.body.name;
  var author = req.body.author;
  var catalog = req.body.catalog;
  var comment = req.body.comment;
  var type = req.body.type;
  var price = req.body.price;
  var width = req.body.width;
  var height = req.body.height;

  var itemSvc = new ItemSvc(name, author, width, height, comment, type, catalog, price, images);
  itemSv.save().then(data => {
    res.json(new Result(Errors.Success));
  }).catch(err => {
    res.json(new Result(Errors.SaveItemFailed, err));
  });
});

module.exports = router;
