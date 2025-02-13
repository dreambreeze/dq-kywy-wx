Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var query = wx.createSelectorQuery();
    var minHeight = 0,
      _this = this,
      setHeightTimer = null;
    query.selectViewport().boundingClientRect(function (rect) {
      minHeight = rect.height;
    }).exec();

    clearTimeout(setHeightTimer);
    setHeightTimer = setTimeout(function () {
      _this.setData({
        minHeight: minHeight + 'px'
      });
    }, 1000);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '客源无忧微信营销平台'
    }
  },
  /**
   * 点击继续预约
   */
  continueBooking: function(){
    wx.navigateBack({
      delta: 1
    });
  }
})