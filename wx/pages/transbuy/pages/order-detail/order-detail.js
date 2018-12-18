Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrDisplay: 'none'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      t: options.t
    });
  },
  /**
   * 监听用户分享
   */
  onShareAppMessage: function () {
    return {
      title: '待消费团购券',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 显示二维码
   */
  showConsume: function () {
    this.setData({
      qrDisplay: 'block'
    });
  },
  /**
   * 关闭二维码
   */
  closeQrcode: function () {
    this.setData({
      qrDisplay: 'none'
    });
  },
  /**
   * 评价页
   */
  assess: function () {
    wx.navigateTo({
      url: '../assess/assess',
    })
  }
})
