var common = require('../../../../common.js');
Page({
  data: {
      compeleteimg:'https://iservice.daqisoft.cn/Public/Home/images/amimgs/complete.png',
      adimg:'https://iservice.daqisoft.cn/Public/Home/images/amimgs/ad.png',
      arrivetime:5,
      MutexSign:"",
  },
  onLoad:function(options){
    var that = this
    this.setData({ MutexSign: options.MutexSign})
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
  toorder:function(){
    wx.navigateTo({
      url: '../orderdetail/orderdetail?MutexSign=' + this.data.MutexSign,
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