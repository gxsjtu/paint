var Errors = require('./error.js');
var Result = require('./result.js');
const Promise = require('promise');
var Item = require('../models/item.js');
const _ = require('lodash');
const Global = require('../global.js');
const fs = require('fs');
const moment = require('moment');
const UserSvc = require('../services/userSvc.js');
const api = require('../services/apiWrapper.js');
var imageUri = __dirname + '/..' + '/public/images/upload/';
const download = require('image-downloader');
var cache = require('memory-cache');
var images = require("images");
var text2png = require('text2png');
const path = require('path');
const uuidv4 = require('uuid/v4');
var QRCode = require('qrcode');

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

function getProfile(openId) {
  return new Promise((resolve, reject) => {
    var value = cache.get(openId);
    if (!value) {
      api.getUser(openId, (err, data) => {
        if (err) {
          return reject(err);
        }
        cache.put(openId, data);
        return resolve(data);
      })
    } else {
      return resolve(value);
    }
  });
};

function getQrCode(openId, itemId) {
  return new Promise((resolve, reject) => {
    QRCode.toFile(path.normalize(imageUri + openId + '.qrcode.png'), Global.server + "/item/" + itemId, {
      type: 'image/png'
    }, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(err);
    });
  });
};

function getAvatar(openId) {
  return new Promise((resolve, reject) => {
    return resolve();
    getProfile(openId).then(data => {
      var uri = data.headimgurl;
      download.image({
          url: uri,
          dest: imageUri + openId + '.avatar'
        })
        .then(({
          filename,
          image
        }) => {
          return resolve(data.nickname);
        }).catch((err) => {
          return resolve(data.nickname);
        });
    }).catch(err => {
      return reject(err);
    });
  });
};

ItemSvc.prototype.sendShareCard = function(openId, itemId) {
  //发送我的分享卡
  return new Promise((resolve, reject) => {
    Promise.all([getQrCode(openId, itemId), getAvatar(openId), this.getItemById(itemId)]).then(data => {
      //生成二维码 + avatar + 背景
      var background = images(path.normalize(imageUri + data[2].images[0]));
      var canvas = images(background.size().width, background.size().height + 520).fill(0xfe, 0xfb, 0xf0, 1);
      var qrcode = images(path.normalize(imageUri + openId + '.qrcode.png')).size(180);
      var logo1 = images(path.normalize(__dirname + '/..' + '/public/logo1.png')).size(126, 26);
      var logo2 = images(path.normalize(__dirname + '/..' + '/public/logo2.png')).size(180);
      var logo3 = images(path.normalize(__dirname + '/..' + '/public/logo3.png')).size(20);

      Promise.all([createText(data[2].name, 80), createText(data[2].author + ' 作品', 48), createText(data[2].type + '，' + data[2].dimension.width + 'cm x ' + data[2].dimension.height + 'cm，底价' + data[2].price + '元', 52)]).then(data => {
        data[2] = data[2].size(background.size().width * 0.68);
        canvas
          .draw(background, 0, 0)
          .draw(data[0], (background.size().width - data[0].size().width) / 2, background.size().height + 40)
          .draw(data[1], (background.size().width - data[1].size().width) / 2, background.size().height + 150)
          .draw(data[2], (background.size().width - data[2].size().width) / 2, background.size().height + 230)
          .draw(qrcode, background.size().width / 2 + 60, background.size().height + 300)
          // .draw(avatar, background.size().width / 2 + 60 + (qrcode.size().width - avatar.size().width) / 2, background.size().height + 300 + (qrcode.size().width - avatar.size().width) / 2)
          .draw(logo3, background.size().width / 2, background.size().height + 300 + 40)
          .draw(logo2, background.size().width / 2 - 60 - 160, background.size().height + 300 + 20)
          .draw(logo1, background.size().width / 2 + 60 + (qrcode.size().width - logo1.size().width) / 2, background.size().height + 300 + 180)
          .saveAsync(path.normalize(imageUri + openId) + '.jpg', (err, result) => {
            //发送客服消息到用户
            //上传临时素材图片
            api.uploadMedia(path.normalize(imageUri + openId) + '.jpg', "image", (err, result) => {
              if (!err) {
                api.sendImage(openId, result.media_id, (err, result) => {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve(data[1]);
                  }
                });
              }
            });
          });
      }).catch(err => {
        return reject(err);
      });
    }).catch(err => {
      return reject(err);
    });
  });
}

function createText(str, fontSize) {
  return new Promise((resolve, reject) => {
    var id = uuidv4();
    fs.writeFile(path.normalize(imageUri + id + '.png'), text2png(str, {
      font: fontSize + 'px STKaiti',
      lineSpacing: 20,
    }), (err, result) => {
      if (!err) {
        var info = images(path.normalize(imageUri + id + '.png'));
        return resolve(info);
      }
      return reject(err);
    });
  });
}


ItemSvc.prototype.getShareItemsByOpenId = function(openId, type) {
  if (type == 1) {
    //未开始
    return new Promise((resolve, reject) => {
      Item.find({
        openId: openId,
        "valid.from": {
          "$gt": moment().format('YYYY-MM-DD HH:mm')
        }

      }).sort({
        create_at: -1
      }).exec((err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  } else if (type == 2) {
    //进行中
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
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  } else if (type == 3) {
    //已结束
    return new Promise((resolve, reject) => {
      Item.find({
        openId: openId,
        "valid.to": {
          "$lt": moment().format('YYYY-MM-DD HH:mm')
        }
      }).sort({
        create_at: -1
      }).exec((err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  } else {
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
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }
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
        return x == openId;
      })

      return resolve({
        likes: data.likes.length,
        canLike: (canLike ? false : true)
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
            Promise.all([sendTemplate2Author(name, price, data), sendTemplate2Participants(name, data)]).then(data => {
              return resolve(data);
            }).catch(err => {
              console.log(err);
              resolve();
            });
          }).catch(err => {
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

function sendTemplate2Author(name, price, item) {
  return new Promise((resolve, reject) => {
    //推送模板消息给作者
    var url = Global.server + '/item/' + item._id;
    var doc = {
      "first": {
        "value": "「" + name + "」" + "成功出价您的作品" + "「" + item.name + "」" + "，出价为" + price + '元。',
        "color": "#173177"
      },
      "keyword1": {
        "value": item.name,
        "color": "#173177"
      },
      "keyword2": {
        "value": item.valid.to,
        "color": "#173177"
      }
    };
    api.sendTemplate(item.openId, "A8Ofs9ct3CWj7-9LUOaT0lr97O-GFBDM-mSyog-lVQ0", url, doc, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function sendTemplate2Participants(name, item) {
  return new Promise((resolve, reject) => {
    //找到目前的倒数第二个出价人
    var bid;
    if (item.bids.length >= 2) {
      bid = item.bids[item.bids.length - 2];
    }
    if (bid) {
      var url = Global.server + '/item/' + item._id;
      var doc = {
        "first": {
          "value": "您的出价已经被" + "「" + name + "」" + "超越",
          "color": "#173177"
        },
        "keyword1": {
          "value": item.name,
          "color": "#173177"
        },
        "keyword2": {
          "value": item.bids[item.bids.length - 1].price + "元",
          "color": "#173177"
        },
        "remark": {
          "value": "拍卖截止时间：" + item.valid.to,
          "color": "#173177"
        },
      };
      api.sendTemplate(bid.openId, "MrG0VuEuOR99sr8pk9DGnLyhZaSje6XBPg0wSnKWLo4", url, doc, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    }
    return resolve();
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

ItemSvc.prototype.update = function(itemId, name, author, width, height, comment, type, catalog, price, from, to, avatar, nick, openId){
    return new Promise((resolve, reject) => {
        Item.update(
          {_id:itemId},
          {
            name:name,
            author:author,
            dimension:{width: width, height: height},
            catalog: catalog,
            type: type,
            comment: comment,
            price: price,
            valid: { from: from, to: to},
            avatar: avatar,
            nick: nick,
            openId: openId
          },
          {upsert: true}
        ).then(data => {
          resolve(data);
        }).catch(err => {
          return reject(false);
        })
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
