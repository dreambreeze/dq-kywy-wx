var app = getApp()
var common = require('../../../../common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yyorder:{}
  },

  /**
   * 页面加载
   */
  onLoad: function (option) {
    var that = this
    var guid = option.guid
    //查询
    if (option.guid) {
      var yyorder = wx.getStorageSync("yyorder")
      var yystore = wx.getStorageSync("yystore")
      that.setData({ yyorder: yyorder, yystore: yystore, guid: guid, dateobj: app.globalData.dateobj})
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '客源无忧微信营销平台'
    }
  },

  onPullDownRefresh() {

    wx.showNavigationBarLoading() //在标题栏中显示加载
    var conditions = " RGUID = '" + this.data.guid + "'"
    this.loaddata('/index.php/Api/OnLineTasks/lists',
      {
        "authorizerId": app.globalData.authorizerId,
        "tablename": "onlinetasks",
        "conditions": conditions,
      }, 2)
    wx.stopPullDownRefresh() //停止下拉刷新
  },
 loaddata: function (url, data, operate) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    var that = this

    wx.request({
      url: common.config.host + url,
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealdata(res, operate)
      },
      fail: function (res) {
        wx.hideLoading();
        if (res.errMsg == 'request:fail timeout') {
          wx.showModal({
            title: '提示',
            content: '请求超时',
            showCancel: false
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败',
            showCancel: false
          });
        }
      }

    });
  },

  //处理加载过来的数据
  //  res   成功的数据   operate   加载  1-
  dealdata: function (res, operate) {
    switch (operate) {
      case 1:

        break
      case 2:
        if (res.data.status == 0) {
          //var order = this.data.order
          var order = res.data.data
          var orderlength = Object.keys(order).length
          for (var i in order) {
            order[i].taskjson = JSON.parse(order[i].taskjson)
            order[i].tasktime = order[i].tasktime.substring(0, 19)
            //处理工号
            order[i].taskjson.TechNo = ''
            for (var j in order[i].taskjson.TecInfos) {
              order[i].taskjson.TechNo += order[i].taskjson.TecInfos[j].WorkNo + "号、"
            }
            order[i].taskjson.TechNo = order[i].taskjson.TechNo.substring(0, order[i].taskjson.TechNo.length - 1)

          }
          this.setData({
            yyorder: order[0],
          })
        }
        wx.hideNavigationBarLoading() //完成停止加载

        break

    }
    wx.hideLoading()
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
