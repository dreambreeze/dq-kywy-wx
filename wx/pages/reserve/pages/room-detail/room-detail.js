//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();
//当前房间数据
var rooms;
let rid = '';
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    maskDisplay: 'none',
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无房间图片的默认项目图
    roomDefaultImg: common.config.roomDefaultImg,
    //banner图点
    dots:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    rid = options.id;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    var locationStore = wx.getStorageSync('currentReserveStore');
    //获取房间信息
    common.getRoomInfo(app.globalData.authorizerId, locationStore[0].nodeid, 0, 0, rid, 0, -1).then(function (data) {
      wx.hideLoading();
      if (data.info.length == 0) {
        wx.showModal({
          title: '提示',
          content: '没有查询到房间信息数据',
          showCancel: false
        });
        return false;
      }

      rooms = data.info;

      _this.setData({
        room: data.info
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
   * 点击预约按钮
   */
  reserveBtn: function (ev) {
    wx.navigateBack();
  }
});