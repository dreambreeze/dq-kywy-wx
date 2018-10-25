let app = getApp();
let common = require('../../../../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arrow: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');

    common.getUserCoupon(app.globalData.authorizerId, openid, 2).then(function (data) {
      wx.hideLoading();
      _this.setData({
        coupons: data.info
      });
    }).catch(function (data) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });
    });
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
  },

  //监听下拉刷新
  onPullDownRefresh: function () {
    let _this = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');

    common.getUserCoupon(app.globalData.authorizerId, openid, 2).then(function (data) {
      wx.hideLoading();
      _this.setData({
        coupons: data.info
      });
    }).catch(function (data) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });
    });

    wx.stopPullDownRefresh();
  }
})