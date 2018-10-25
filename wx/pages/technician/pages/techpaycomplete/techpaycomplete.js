var common = require('../../../../common.js');
var app = getApp()
Page({
  data: {
    compeleteimg: 'https://iservice.daqisoft.cn/Public/Home/images/techimgs/complete.png',
    adimg: 'https://iservice.daqisoft.cn/Public/Home/images/techimgs/ad.png',
    arrivetime: 5,
    artime:0,

  },
  onLoad: function (options) {
  var that = this
  that.setData({
      artime: options.artime,
      guid: options.guid,
      dateobj: app.globalData.dateobj
    })
    //获取小程序广告
    common.getAppletAd().then(function (data) {
      that.setData({
        ad: data.info
      });
    }).catch(function (data) {
      that.setData({
        ad: false
      });
    });
  },
  toorder: function () {
    wx.redirectTo({
      url: '../../../ucentermodel/pages/orders/orders?guid=' + this.data.guid,
    })
  },
  /**
  * 点击广告跳转链接
  */
  jumpAd: function (e) {
    let adurl = e.currentTarget.dataset.adurl;
    if (adurl) {
      common.jishuzhichi(adurl);
    }
  }
})