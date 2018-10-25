// ucenter/index/index.js
Page({
  data: {
    result: ''
  },
  onLoad:function(){
    console.log("扫一扫");
    wx.scanCode({
      success: function (res) {
        that.setData({
          result: res.result
        });
        wx.navigateTo({
          url: '../index/index',
        })
      },
      fail: function (res) {
      }
    })
  },
 
  scanCode: function () {
    var that = this
    wx.scanCode({
      success: function (res) {
        that.setData({
          result: res.result
        });
        wx.navigateTo({
          url: '../index/index',
        })
      },
      fail: function (res) {
      }
    })
  },

  detail:function(){
    wx.navigateTo({
      url: '../../shop1/shop1',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '客源无忧微信营销平台'
    }
  }
})