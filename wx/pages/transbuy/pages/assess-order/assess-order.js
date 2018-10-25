let app = getApp();
let common = require('../../../../common.js');

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
    let _this = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');

    //查询E团购订单
    common.getEBuyOrder(app.globalData.authorizerId, openid, 3).then(function (data) {
      wx.hideLoading();
      if (data.info) {
        _this.setData({
          orderData: data.info
        });
      }
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
    * 跳转至订单详情
    */
  orderDilTo: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/ucentermodel/pages/orderdetail/orderdetail?id=' + id,
    });
  },
  /**
   * 评价页
   */
  assess: function (e) {
    let pid = e.currentTarget.dataset.pid;
    let nodeid = e.currentTarget.dataset.nodeid;
    let id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '../assess/assess?pid=' + pid + '&nodeid=' + nodeid + '&id=' + id,
    });
  },

  /**
   * 跳转至购买页
   */
  againBuy: function (e) {
    let pid = e.currentTarget.dataset.pid;
    let nodeid = e.currentTarget.dataset.nodeid;

    wx.navigateTo({
      url: '../project-detail/project-detail?pid=' + pid + '&nodeid=' + nodeid,
    });
  }

})