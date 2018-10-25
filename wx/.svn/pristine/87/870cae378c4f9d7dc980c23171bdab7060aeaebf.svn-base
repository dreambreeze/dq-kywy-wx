var timer = 3,
  timeEvent = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer: timer
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 页面显示事件
   */
  onShow: function () {
    // var _this = this;
    // clearInterval(timeEvent);
    // timeEvent = setInterval(function () {
    //   timer--;
    //   _this.setData({
    //     timer: timer
    //   });
    //   if (timer <= 0) {
    //     clearInterval(timeEvent);
    //     timer = 3;
    //     wx.reLaunch({
    //       url: '/pages/vip-center/vip-center',
    //     });
    //   }
    // }, 1000);
  },
  /**
   * 返回首页
   */
  backHome: function () {
    // clearInterval(timeEvent);
    // timer = 3;
    wx.reLaunch({
      url: '/pages/vip-center/vip-center',
    });
  },

  /**
   * 监听页面分享
   */

  onShareAppMessage: function (options) {
    return {
      title: '我赠送了你一张会员卡，赶紧来领取吧',
      path: '/pages/component/pages/lqgiftcard/lqgiftcard',
      success: function() {
        wx.reLaunch({
          url: '/pages/vip-center/vip-center',
        });
      }
    }
  }

})