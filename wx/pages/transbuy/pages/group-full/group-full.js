var common = require('../../../../common.js');
var app = getApp()

var intype = 1;//默认进入方式是本人进入，2为分享后 参团者进入
Page({
  data: {
    compeleteimg:'https://iservice.daqisoft.cn/Public/Home/images/amimgs/complete.png',
    isshow:"true",
    whypng:"https://iservice.daqisoft.cn/Public/Home/images/why.png"
  },
  onLoad:function(options){
    var that = this

    var orderno = options.orderno
    var groupno = options.groupno
    var nodeid = options.nodeid
    var pid = options.pid
    this.setData({ groupno: groupno, orderno: orderno, nodeid: nodeid,pid:pid})



    common.getGroupShopping(app.globalData.authorizerId, nodeid, pid, '', '', groupno, 2).then(function (res) {
      var multiinfo = res.info[0]
      that.setData({
        store: multiinfo,
        project: multiinfo.project[0],
      })
      //项目订单   pstatus=2
      common.getGroupOrders(app.globalData.authorizerId, nodeid, '', "", '', groupno, 2).then(function (data) {
        if (data.status == 1) {
          var ordersData=data.info
          let lux =new Array
          for (var i = 0; i < ordersData[groupno].nums; i++){
            lux.push(i)
          }
          that.setData({
            mutiple: data.mutiple,
            num: data.length,
            ordersData: data.info,
            lux:lux
          })
          that.countDown()
        }
      }).catch(function (data) {
      })
    }).catch(function (data) {})

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

  toorder:function(e){
    var id = e.currentTarget.dataset.id;
    var orderno = e.currentTarget.dataset.orderno;
    var nodeid = e.currentTarget.dataset.nodeid;
    wx.navigateTo({
      url: '../group-orderdetail/group-orderdetail?orderno=' + orderno+'&pid=' + id + '&nodeid=' + nodeid,
    })
  },

  gobuy: function (e) {
    var pid = e.currentTarget.dataset.id
    var groupno = e.currentTarget.dataset.groupno
    wx.navigateTo({
      url: '../group-commit/group-commit?groupno=' + groupno + '&pid=' + pid + '&buytype=3',
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
  },




  onUnload(){
    wx.removeStorageSync('grproject')
  }
})
