module.exports.Success = {
  status: 0,
  message: 'OK'
};
module.exports.NotFound = {
  status: 1,
  message: '记录不存在！'
};
module.exports.SaveItemFailed = {
  status: 2,
  message: '保存画作失败！'
};
module.exports.GetTodayFailed = {
  status: 3,
  message: '获取今日最新失败！'
};
module.exports.BidFailed = {
  status: 4,
  message: '出价无效！'
};
module.exports.GetItemsFailed = {
  status: 5,
  message: '获取用户作品失败！'
};
