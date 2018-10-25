//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputLimit: '0/50',
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无门店图片的默认门店图
    bannerImg: common.config.bannerImg,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    //获取当前预约的门店信息
    var currentReserveStore = wx.getStorageSync('currentReserveStore');

    this.setData({
      currentReserveStore: currentReserveStore
    });

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //当前预约的项目AutiId
    var projectStorage = wx.getStorageSync('projectStorage');

    //获取所有项目信息
    common.getProjectInfo(app.globalData.authorizerId, currentReserveStore[0].nodeid, 0, 0, projectStorage).then(function (data) {
      wx.hideLoading();
      _this.setData({
        pname: data[0].serviceitemname,
        servicetime: data[0].servicetime
      });
    }).catch(function (data) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });
    });

    //获取预约房间数据
    var roomStorage = wx.getStorageSync('roomStorage');

    this.setData({
      roomStorage: roomStorage
    });
  },
  /**
   * 监听页面加载输入备注事件
   */
  remarks: function (e) {
    var val = e.detail.value;

    this.setData({
      inputLimit: val.length + '/50'
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
  /**
   * 购买成功
   */
  toSuccess: function () {
    wx.redirectTo({
      url: '../pay-success/pay-success',
    });
  }
})