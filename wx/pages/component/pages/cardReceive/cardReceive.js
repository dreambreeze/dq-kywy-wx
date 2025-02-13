var common = require('../../../../common.js');
var app = getApp();
//用户生日
var birthday = '';
//用户性别
var sex = 1;
//业务表唯一标识
var guid = '';
//用户的领取会员卡手机号
var receivePhone = '';
//用户绑定的手机号
var phone = '';

//用户输入的需要绑定会员卡的手机号
var bindPhone;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selfModalDisplay: 'display:none;',
    selfModalTop: 'top:0rpx;',
    bindPhoneseconds: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    guid = options.guid;
    receivePhone = options.receivePhone;

    if (!guid || !receivePhone) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '参数错误',
        showCancel: false
      });
    }

    var _this = this;

    //获取用户openid
    var openid = wx.getStorageSync('openid');

    common.getUInfo('*', app.globalData.authorizerId, openid).then(function (data) {
      wx.hideLoading();
      birthday = data.info.birthday;
      sex = data.info.sex;
      phone = data.info.phone;

      _this.setData({
        userInfo: data.info,
        birthday: birthday
      });
    }).catch(function (data) {
      wx.hideLoading();
      _this.setData({
        userInfo: false
      });
      wx.showModal({
        title: '提示',
        content: '',
        showCancel: false,
        success: res => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      })
    });

    //计算提示框距离顶部的位置
    var query = wx.createSelectorQuery();
    query.selectViewport().boundingClientRect();
    query.select('.selfModal').boundingClientRect();
    query.exec(function (res) {
      var smtop = (res[0].height - res[1].height) / 2;
      _this.setData({
        selfModalTop: 'top:' + smtop + 'px;'
      });
    });

  },

  /**
   * 选择切换生日
   */
  birthdayChange: function (e) {
    birthday = e.detail.value;

    this.setData({
      birthday: birthday
    });
  },

  /**
   * 取消选择生日
   */
  birthdayCancel: function () {
    birthday = '';
    this.setData({
      birthday: ''
    });
  },

  /**
   * 开卡点击性别切换
   */
  sexchange: function (e) {
    sex = parseInt(e.currentTarget.dataset.sex);
    this.setData({
      'userInfo.sex': sex
    });
  },

  /**
  * 领取会员卡
  */
  cardReceive: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    if (!guid) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '参数错误',
        showCancel: false
      });
    }

    var _this = this;

    var openid = wx.getStorageSync('openid');

    if (receivePhone != phone) {
      _this.setData({
        selfModalDisplay: 'display:block;',
      });
      return false;
    } else {
      wx.request({
        url: common.config.host + '/index.php/Api/Requestdata/cardReceive',
        data: {
          'authorizerId': app.globalData.authorizerId,
          'rguid': guid,
          'phone': phone,
          'openid': openid,
          'birthday': birthday,
          'sex': sex
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.hideLoading();
          if (res.statusCode == 200) {
            if (res.data.status == 1) {
              wx.showModal({
                title: '提示',
                content: res.data.info,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.reLaunch({
                      url: '/pages/vip-center/vip-center',
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
              content: '请求失败，服务器错误',
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
    }
  },

  /**
   * 用户输入的绑定会员卡的手机号
   */
  bindPhoneInput: function (e) {
    bindPhone = e.detail.value;
  },

  /**
   * 输入绑定手机号后点确定
   */
  bindPhone: function () {
    var _this = this;
    if (bindPhone.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号',
        showCancel: false
      });
      return false;
    }

    if (!common.ismobile(bindPhone)) {
      wx.showModal({
        title: '提示',
        content: '手机号格式错误',
        showCancel: false
      });
      return false;
    }

    if (bindPhone != phone && bindPhone != receivePhone) {
      wx.showModal({
        title: '提示',
        content: '请勿随意输入手机号，手机号与绑定的手机号、验证的手机号不一致',
        showCancel: false
      });
      return false;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/cardReceive',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'rguid': guid,
        'phone': bindPhone,
        'birthday': birthday,
        'sex': sex
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            wx.showModal({
              title: '提示',
              content: res.data.info,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.reLaunch({
                    url: '/pages/vip-center/vip-center',
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
            content: '请求失败，服务器错误',
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
  }
})
