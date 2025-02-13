Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons: [0,1,2,3],
    arrow: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  /**
   * 点击查看卡券详情信息
   */
  lookDetail: function (e) {
    var idx = e.currentTarget.dataset.idx;
    var ishide = e.currentTarget.dataset.ishide;
    var query = wx.createSelectorQuery();
    var _this = this;
    query.selectAll('.coupon-info').boundingClientRect(function (e) {
      if (e[idx].height == 0) {
        _this.setData({
          ishide: true,
          arrow: 1
        });
      } else {
        _this.setData({
          ishide: false,
          arrow: 0
        });
      }
    }).exec();

    this.setData({
      display: idx
    });
  }
})