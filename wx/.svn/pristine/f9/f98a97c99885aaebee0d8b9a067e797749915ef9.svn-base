var timer = 3;
let timeEvent = null;
let notJump;
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
    notJump = options.notJump;
    this.setData({
      message: options.message,
      notJump: notJump
    });
  },
  /**
   * 页面显示事件
   */
  onShow: function () {
    var _this = this;
    if (notJump){
      return false;
    }
    clearInterval(timeEvent);
    timeEvent = setInterval(function () {
      timer--;
      _this.setData({
        timer: timer
      });
      if (timer <= 0) {
        clearInterval(timeEvent);
        timer = 3;
        wx.navigateBack();
      }
    }, 1000);
  },
  /**
   * 返回首页
   */
  backHome: function () {
    if (notJump) {
      return false;
    }
    clearInterval(timeEvent);
    timer = 3;
    wx.reLaunch({
      url: '/pages/index/index',
    });
  }
})