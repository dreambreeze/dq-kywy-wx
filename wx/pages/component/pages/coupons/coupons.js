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
    //检查功能是否开启
    let promotions = wx.getStorageSync('promotions');
    if (promotions) {
      common.checkFunOpened(promotions, 7);
    }

    //获取优惠券
    let _this = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function (data) {
        openid = data;
        _this.getReceiveCoupon(app.globalData.authorizerId, openid).then(function (data) {
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
      }).catch(function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    } else {
      _this.getReceiveCoupon(app.globalData.authorizerId, openid).then(function (data) {
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
    }

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
  /**
   * 点击立即领取按钮
   */
  nowUse: function (e) {
    let id = e.currentTarget.dataset.id;
    let _this = this;

    if (!id) {
      wx.showModal({
        title: '提示',
        content: '领取失败',
        showCancel: false
      });
      return false;
    }

    //领取券
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');

    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/receiveCoupon',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'id': id,
        'openid': openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            wx.showModal({
              title: '提示',
              content: res.data.info,
              cancelText: '再逛逛',
              confirmText: '去使用',
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '../coupons-pack/coupons-pack',
                  });
                } else if (res.cancel) {
                  wx.showLoading({
                    title: '加载中',
                    mask: true
                  });
                  _this.getReceiveCoupon(app.globalData.authorizerId, openid).then(function (data) {
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
                }
              }
            });
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.info,
              showCancel: false
            });
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败',
            showCancel: false
          });
        }
      },
      fail: function (res) {
        wx.hideLoading();
        if (res.errMsg == 'request:fail timeout') {
          wx.showModal({
            title: '提示',
            content: '请求超时',
            showCancel: false
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败',
            showCancel: false
          });
        }
      }
    });
  },

  /**
   * 查询用户可领取的券
   */
  getReceiveCoupon: function (authorizerId, openid) {
    let p = new Promise(function (resolve, reject) {
      wx.request({
        url: common.config.host + '/index.php/Api/Requestdata/getReceiveCoupon',
        data: {
          'authorizerId': authorizerId,
          'openid': openid
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          //返回成功
          if (res.statusCode == 200) {
            if (res.data.status == 1) {
              resolve(res.data);
            } else {
              reject(res.data.info);
            }
          } else {
            reject('请求失败');
          }
        },
        fail: function (res) {
          wx.hideLoading();
          if (res.errMsg == 'request:fail timeout') {
            wx.showModal({
              title: '提示',
              content: '请求超时',
              showCancel: false
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '请求失败',
              showCancel: false
            });
          }
        }
      });
    });

    return p;
  },

  //监听下拉刷新
  onPullDownRefresh: function () {
    var _this = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //获取用户openid
    let openid = wx.getStorageSync('openid');

    _this.getReceiveCoupon(app.globalData.authorizerId, openid).then(function (data) {
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