let app = getApp();
let common = require('../../../../common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 页面加载
   */
  onLoad: function (option) {
    let id = option.id;
    let _this = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');

    //查询E团购订单详情
    common.getEBuyDetail(app.globalData.authorizerId, openid, id).then(function (data) {
      wx.hideLoading();
      if (!data.info) {
        wx.showModal({
          title: '提示',
          content: '项目不存在',
          showCancel: false
        });
      } else {
        _this.setData({
          orderData: data.info
        });

        //计算距离
        common.geocoder(data.info.address_detail).then(function (data) {
          common.calculateDistance([data]).then(function (data) {
            _this.setData({
              distance: (parseInt(data) / 1000).toFixed(2) + 'km'
            });
          }).catch(function(data){
            _this.setData({
              distance: '未知'
            });
          });
        }).catch(function (data) {
          _this.setData({
            distance: '未知'
          });
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

    //获取小程序广告
    common.getAppletAd().then(function (data) {
      _this.setData({
        ad: data.info
      });
    }).catch(function (data) {
      _this.setData({
        ad: false
      });
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
  * 打电话
  */
  callphone: function (e) {
    let tel = e.currentTarget.dataset.tel;
    if (!tel) {
      wx.showModal({
        title: '提示',
        content: '未设置电话',
        showCancel: false
      });
      return false;
    }

    wx.makePhoneCall({
      phoneNumber: tel
    });
  },

  /**
  * 打开小程序地图组件展示地址
  */
  location: function (e) {
    let address = e.currentTarget.dataset.address;
    let sname = e.currentTarget.dataset.sname;

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
                    name: sname,
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
                                name: sname,
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
                name: sname,
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
  jumpAd: function (e) {
    let adurl = e.currentTarget.dataset.adurl;
    if (adurl) {
      common.jishuzhichi(adurl);
    }
  }
})