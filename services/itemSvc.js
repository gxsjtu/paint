var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Item = require('../models/item.js');
const _ = require('lodash');
const Global = require('../global.js');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(Global.appId, Global.appSecret);
const fs = require('fs');
const moment = require('moment');
const UserSvc = require('../services/userSvc.js');

var ItemSvc = function() {

}

ItemSvc.prototype.getItemsByOpenId = function(openId) {
  return new Promise((resolve, reject) => {
    Item.find({
      openId: openId
    }).sort({
      create_at: -1
    }).exec((err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

ItemSvc.prototype.getShareItemsByOpenId = function(openId) {
  return new Promise((resolve, reject) => {
    Item.find({
      openId: openId,
      "$and": [{
        "valid.from": {
          "$lt": moment().format('YYYY-MM-DD HH:mm:ss')
        }
      }, {
        "valid.to": {
          "$gt": moment().format('YYYY-MM-DD HH:mm:ss')
        }
      }]
    }).sort({
      create_at: -1
    }).exec((err, data) => {
      console.log(data);
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

ItemSvc.prototype.getItemById = function(id) {
  return new Promise((resolve, reject) => {
    Item.findById(id).then(data => {
      return resolve(data);
    }).catch(err => {
      return reject(err);
    });
  });
};

ItemSvc.prototype.getType = function() {
  return new Promise((resolve, reject) => {
    return resolve(["油画", "国画", "水彩", "彩铅"]);
  });
};

ItemSvc.prototype.getCatalog = function() {
  return new Promise((resolve, reject) => {
    return resolve(["人物", "山水", "花鸟", "风景", "动物", "历史"]);
  });
};

ItemSvc.prototype.like = function(id, openId) {
  return new Promise((resolve, reject) => {
    Item.findOneAndUpdate({
      _id: id
    }, {
      $push: {
        likes: openId
      }
    }, {
      new: true
    }).then(data => {
      return resolve(data.likes.length);
    }).catch(err => {
      return reject(0);
    });
  });
};

ItemSvc.prototype.getLikes = function(id, openId) {
  return new Promise((resolve, reject) => {
    Item.findById(id).then(data => {
      if (!data || !(data.likes)) {
        return resolve({
          likes: 0,
          canLike: true
        });
      }
      var canLike = _.find(data.likes, x => {
        return x.openId == openId;
      })

      return resolve({
        likes: data.likes.length,
        canLike: (canLike ? true : false)
      });
    }).catch(err => {
      return reject(err);
    });
  });
};

ItemSvc.prototype.getBids = function(id) {
  return new Promise((resolve, reject) => {
    Item.findById(id).then(data => {
      if (!data || !(data.bids)) {
        return resolve([]);
      }
      return resolve(_.orderBy(data.bids, ["create_at"], "desc"));
    }).catch(err => {
      return reject(err);
    });
  });
};

ItemSvc.prototype.bid = function(itemId, openId, price) {
  return new Promise((resolve, reject) => {
    this.canBid(itemId, openId, price).then(data => {
      if (data == true) {
        var usrSvc = new UserSvc();
        usrSvc.getProfile(openId).then(data => {
          var name = data.nickname;
          Item.findOneAndUpdate({
            _id: itemId
          }, {
            $push: {
              bids: {
                price: price,
                openId: openId,
                avatar: data.headimgurl,
                nick: data.nickname
              }
            }
          }, {
            new: true
          }).then(data => {
            //推送模板消息给作者
            var doc = {
              "first": {
                "value": "「" + name + "」" + "成功出价您的作品" + "「" + data.name + "」" + "，出价为" + price + '元。',
                "color": "#173177"
              },
              "keyword1": {
                "value": data.name,
                "color": "#173177"
              },
              "keyword2": {
                "value": data.valid.to,
                "color": "#173177"
              },
              // "remark": {
              //   "value": "欢迎再次购买！",
              //   "color": "#173177"
              // }
            };
            api.sendTemplate(data.openId, "A8Ofs9ct3CWj7-9LUOaT0lr97O-GFBDM-mSyog-lVQ0", "", doc, (err, result) => {
              return resolve();
            });
          }).catch(err => {
            console.log(err);
            return reject(err);
          });
        }).catch(err => {
          return reject(err);
        });
      } else {
        return reject(new Error("出价无效！"));
      }
    });
  });
}

ItemSvc.prototype.canBid = function(id, openId, price) {
  // 1. 不能连续出价
  // 2. 出价必须在拍卖时间内
  // 3. 出价必须在最新价格上+最小调价
  return new Promise((resolve, reject) => {
    Item.findById(id).then(data => {
      if (!data) {
        return reject(false);
      }
      // 2. 出价必须在拍卖时间内
      var current = moment();
      if (current > data.valid.to || current < data.valid.from) {
        return reject(false);
      }
      // 1. 不能连续出价
      //获取最后一个出价人的openid
      var tmp = _.orderBy(data.bids, ["create_at"], 'desc');
      if (tmp.length == 0) {
        return resolve(true);
      }
      if (_.head(tmp).openId === openId) {
        return resolve(false);
      }
      //3. 必须大于最后一个出价
      if (_.head(tmp).price >= price) {
        return resolve(false);
      }
      return resolve(true);
    }).catch(err => {
      return reject(false);
    });
  });
};

ItemSvc.prototype.search = function(group, key) {
  Item.find({
    catalog: {
      $in: group
    }
  })
}

ItemSvc.prototype.save = function(name, author, width, height, comment, type, catalog, price, images, from, to, avatar, nick, openId) {
  var item = new Item();
  item.openId = openId;
  item.images = images;
  item.name = name;
  item.author = author;
  item.catalog = catalog;
  item.comment = comment;
  item.type = type;
  item.price = price;
  item.dimension = {
    height: height,
    width: width
  };
  item.valid = {
    from: from,
    to: to
  }
  item.avatar = avatar;
  item.nick = nick;
  return new Promise((resolve, reject) => {
    item.save(err => {
      if (err) {
        return reject(err);
      }
      //从微信服务器下载图片
      _.forEach(item.images, x => {
        api.getMedia(x, (err, data) => {
          if (!err) {
            fs.writeFile(__dirname + "/.." + "/public/images/upload/" + x, data, 'binary', function(err) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      return resolve(item);
    });
  });
};

ItemSvc.prototype.getSearchItems = function(num, key, type, catalog, upOrDown, create_at) {
  if (catalog == 0) {
    // catalog="人物,山水,花鸟,风景,动物,历史";
    catalog = "";
  }
  if (type == 0) {
    // type="油画,国画,水彩,彩铅";
    type = "";
  }
  if (key == '000') {
    key = '.*';
  }
  var re = new RegExp(key, 'i');
  var itemSvc = new ItemSvc();
  if (!upOrDown) {
    return new Promise((resolve, reject) => {
      Item.where({
        catalog: {
          $in: catalog.split(',')
        },
        type: {
          $in: type.split(',')
        },
        $or: [{
          "author": re
        }, {
          "name": re
        }]
      }).sort({
        create_at: -1
      }).limit(num).lean().exec((err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  } else {
    if (upOrDown === "up") {
      // 加载更多 上拉
      return new Promise((resolve, reject) => {
        Item.where({
          create_at: {
            $lt: create_at
          },
          catalog: {
            $in: group.split(',')
          },
          $or: [{
            "author": re
          }, {
            "name": re
          }]
        }).sort({
          create_at: -1
        }).limit(num).lean().exec((err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        Item.where({
          create_at: {
            $gt: create_at
          },
          catalog: {
            $in: group.split(',')
          },
          $or: [{
            "author": re
          }, {
            "name": re
          }]
        }).sort({
          create_at: 'asc'
        }).limit(num).lean().exec((err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      });
    }
  }
};
//我的订单
ItemSvc.prototype.getMyOrders = function(num, openId, upOrDown, create_at) {
  var itemSvc = new ItemSvc();
  if (!upOrDown) {
    return new Promise((resolve, reject) => {
      var ret = [];
      var tret = [];
      var toDate = moment().format('yyyy-MM-DD HH:mm');
      Item.find({
        'bids.openId': openId,
        'valid.to': {
          $lt: toDate
        }
      }).sort({
        create_at: -1
      }).limit(num).then(docs => {
        if (docs.length <= 0)
          return resolve([]);
        for (var k = 0; k < docs.length; k++) {
          var x = JSON.parse(JSON.stringify(docs[k]));
          var xbid = x.bids;
          if (xbid.length > 0) {
            tret = _.orderBy(xbid, ["create_at"], ["desc"]);
            if (tret[0].openId === openId) {
              ret.push({
                _id: x._id,
                author: x.author,
                avatar: x.avatar,
                bid: tret[0],
                bids: x.bids,
                create_at: x.create_at,
                dimension: x.dimension,
                images: x.images,
                likes: x.likes,
                name: x.name,
                nick: x.nick,
                price: x.price,
                valid: x.valid,
                order: x.order
              });
            }
          }
        }
        return resolve(ret);
      }).catch(err => {
        return reject(err);
      });
    });
  } else {
    if (upOrDown === "up") {
      // 加载更多 上拉
      return new Promise((resolve, reject) => {
        var ret = [];
        var tret = [];
        var toDate = moment().format('yyyy-MM-DD HH:mm');
        Item.find({
          'bids.openId': openId,
          'valid.to': {
            $lt: toDate
          },
          'create_at': {
            $lt: create_at
          }
        }).sort({
          create_at: -1
        }).limit(num).then(docs => {
          if (docs.length <= 0)
            return resolve([]);
          for (var k = 0; k < docs.length; k++) {
            var x = JSON.parse(JSON.stringify(docs[k]));
            var xbid = x.bids;
            if (xbid.length > 0) {
              tret = _.orderBy(xbid, ["create_at"], ["desc"]);
              if (tret[0].openId === openId) {
                ret.push({
                  _id: x._id,
                  author: x.author,
                  avatar: x.avatar,
                  bid: tret[0],
                  bids: x.bids,
                  create_at: x.create_at,
                  dimension: x.dimension,
                  images: x.images,
                  likes: x.likes,
                  name: x.name,
                  nick: x.nick,
                  price: x.price,
                  valid: x.valid,
                  order: x.order
                });
              }
            }
          }
          return resolve(ret);
        }).catch(err => {
          return reject(err);
        });
      })

    } else {
      return new Promise((resolve, reject) => {
        var ret = [];
        var tret = [];
        var toDate = moment().format('yyyy-MM-DD HH:mm');
        Item.find({
          'bids.openId': openId,
          'valid.to': {
            $lt: toDate
          },
          'create_at': {
            $gt: create_at
          }
        }).sort({
          create_at: -1
        }).limit(num).then(docs => {
          if (docs.length <= 0)
            return resolve([]);
          for (var k = 0; k < docs.length; k++) {
            var x = JSON.parse(JSON.stringify(docs[k]));
            var xbid = x.bids;
            if (xbid.length > 0) {
              tret = _.orderBy(xbid, ["create_at"], ["desc"]);
              if (tret[0].openId === openId) {
                ret.push({
                  _id: x._id,
                  author: x.author,
                  avatar: x.avatar,
                  bid: tret[0],
                  bids: x.bids,
                  create_at: x.create_at,
                  dimension: x.dimension,
                  images: x.images,
                  likes: x.likes,
                  name: x.name,
                  nick: x.nick,
                  price: x.price,
                  valid: x.valid,
                  order: x.order
                });
              }
            }
          }
          return resolve(ret);
        }).catch(err => {
          return reject(err);
        });
      })

    }
  }
};

module.exports = ItemSvc;
