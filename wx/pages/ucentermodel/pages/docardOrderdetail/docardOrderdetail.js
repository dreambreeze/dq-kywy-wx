var app = getApp();
var common = require('../../../../common.js');
// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../../pages/common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
//当前订单
var orderData;
//门店地址
var address;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无会员卡图片的默认会员卡图
    cardPicUrl: common.config.cardPicUrl,
    orderData: orderData,
    distance: '未知'
  },

  /**
   * 页面加载
   */
  onLoad: function (option) {
    var _this = this;

    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: common.config.QQMapWXKey
    });

    wx.showLoading({
      title: '加载中',
      mask: true
    });
    //查询办卡订单详情
    if (option.type == 1) {
      common.checkingOrder(app.globalData.authorizerId, option.guid, option.type).then(function (data) {
        wx.hideLoading();
        if (!data.info) {
          wx.showModal({
            title: '提示',
            content: '订单不存在',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          });
        } else {
          orderData = data.info;

          //获取地址解析(地址转坐标)
          address = orderData[0].mysqldocardinfo.province + orderData[0].mysqldocardinfo.city + orderData[0].mysqldocardinfo.area + orderData[0].mysqldocardinfo.address_detail;

          if (address) {
            common.geocoder(address).then(function (data) {
              common.calculateDistance([data]).then(function (data) {
                _this.setData({
                  distance: ((data / 1000).toFixed(2)) + 'km'
                });
              }).catch(function (data) {
                _this.setData({
                  distance: '未知'
                });
              });
            }).catch(function (data) {
              _this.setData({
                distance: '未知'
              });
            });
          } else {
            _this.setData({
              distance: '未知'
            });
          }

          _this.setData({
            orderData: orderData,
            address: address
          });
        }
      }).catch(function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false,
          success: res => {
            if (res.confirm) {
              wx.navigateBack();
            }
          }
        });
      });
    }

    //获取小程序广告
    common.getAppletAd().then(function (data) {
      _this.setData({
        ad: data.info
      });
    }).catch(function(data){
      _this.setData({
        ad: false
      });
    });
  },

  /**
   * 页面跳转
   */
  jumpPage: function (ev) {
    var url = ev.currentTarget.dataset.url;
    if (typeof url != 'undefined') {
      wx.navigateTo({
        url: url,
      });
    }
  },

  /**
   * 拨打电话
   */
  phoneCall: function (ev) {
    var phone = ev.currentTarget.dataset.phone;
    if (!phone) {
      wx.showModal({
        title: '提示',
        content: '未设置电话号码',
        showCancel: false
      });
      return false;
    }

    wx.makePhoneCall({
      phoneNumber: phone,
    });
  },

  /**
   * 打开小程序地图组件展示地址
   */
  location: function () {
    if (address) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success(res) {
                // 用户已经同意
                common.geocoder(address).then(function (data) {
                  wx.hideLoading();
                  wx.openLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    name: orderData[0].mysqldocardinfo.store_name,
                    address: address
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
              fail: function () {
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '已拒绝使用地理位置，现在去设置允许使用地理位置',
                  success: function (res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success: (res) => {
                          if (res.authSetting['scope.userLocation']) {
                            wx.showLoading({
                              title: '加载中',
                              mask: true
                            });

                            common.geocoder(address).then(function (data) {
                              wx.hideLoading();
                              wx.openLocation({
                                latitude: data.latitude,
                                longitude: data.longitude,
                                name: orderData[0].mysqldocardinfo.store_name,
                                address: address
                              });
                            }).catch(function (data) {
                              wx.hideLoading();
                              wx.showModal({
                                title: '提示',
                                content: data,
                                showCancel: false
                              });
                            });
                          }
                        }
                      })
                    }
                  }
                });
              }
            });
          } else {
            common.geocoder(address).then(function (data) {
              wx.hideLoading();
              wx.openLocation({
                latitude: data.latitude,
                longitude: data.longitude,
                name: orderData[0].mysqldocardinfo.store_name,
                address: address
              });
            }).catch(function (data) {
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: data,
                showCancel: false
              });
            });
          }
        }
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '未设置地址',
        showCancel: false
      });
    }
  },

  /**
   * 点击广告跳转链接
   */
  jumpAd: function(e){
    let adurl = e.currentTarget.dataset.adurl;
    if(adurl){
      common.jishuzhichi(adurl);
    }
  }
})