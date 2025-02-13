var common = require('../../../../common.js');
var app = getApp();
//用户绑定的手机号
var phone = '';
//用户姓名
var names = '';
//重新获取验证码秒数
var seconds;
//定时器
var verifyTimer = null;
//发送小程序模版信息的formid
var formId;
//用户输入的领卡手机号
var receivePhone = '';
//当前转赠业务表的RGUID
var RGUID = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无会员卡图片的默认会员卡图
    cardPicUrl: common.config.cardPicUrl,
    seconds: seconds,
    receiveCard: false,
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无会员卡图片的默认会员卡图
    cardPicUrl: common.config.cardPicUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;

    wx.showLoading({
      title: '加载中',
    });

    var openid = wx.getStorageSync('openid');
    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function (data) {
        common.getUInfo('names,phone', app.globalData.authorizerId, data).then(function (data) {
          wx.hideLoading();
          names = data.info.names;
          phone = data.info.phone;

          //已绑定手机号查询待领取的会员卡
          if (phone) {

            //用户输入的领卡手机号
            receivePhone = phone;

            //查询待领取的会员卡
            _this.queryToreceive().then(function (data) {
              if (data.info.length == 0) {
                _this.setData({
                  receiveCard: false
                });
              } else {
                var receiveCard = data.info;
                for (let i = 0; i < receiveCard.length; i++) {
                  receiveCard[i]['Balance'] = (parseFloat(receiveCard[i].cardnum) + parseFloat(receiveCard[i].sendnum));
                }

                _this.setData({
                  receiveCard: receiveCard
                });
              }
            }).catch(function (data) {
              _this.setData({
                receiveCard: false
              });
            });
          } else {
            _this.setData({
              receiveCard: false
            });
          }

          _this.setData({
            names: data.info.names,
            phone: data.info.phone
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
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    } else {
      common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function (data) {
        wx.hideLoading();
        names = data.info.names;
        phone = data.info.phone;

        //已绑定手机号查询待领取的会员卡
        if (phone) {

          //用户输入的领卡手机号
          receivePhone = phone;

          //查询待领取的会员卡
          _this.queryToreceive().then(function (data) {
            if (data.info.length == 0) {
              _this.setData({
                receiveCard: false
              });
            } else {
              var receiveCard = data.info;
              for (let i = 0; i < receiveCard.length; i++) {
                receiveCard[i]['Balance'] = (parseFloat(receiveCard[i].cardnum) + parseFloat(receiveCard[i].sendnum));
              }

              _this.setData({
                receiveCard: receiveCard
              });
            }
          }).catch(function (data) {
            _this.setData({
              receiveCard: false
            });
          });
        } else {
          _this.setData({
            receiveCard: false
          });
        }

        _this.setData({
          names: data.info.names,
          phone: data.info.phone
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
  * 获取用户微信绑定的手机号
  */
  getPhoneNumber: function (e) {
    var _this = this;

    if (!e.detail.encryptedData) {
      wx.showModal({
        title: '提示',
        content: '获取手机号失败',
        showCancel: false
      });
      return false;
    }

    if (e.detail.errMsg != 'getPhoneNumber:ok') {
      wx.showModal({
        title: '提示',
        content: '获取手机号失败',
        showCancel: false
      });
      return false;
    }

    //解密获取手机号
    wx.showLoading({
      title: '加载中',
    });

    let openid = wx.getStorageSync('openid');

    wx.request({
      url: common.config.host + '/index.php/Api/Base/get_encryptedData',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'encryptedData': e.detail.encryptedData,
        'openid': openid,
        'iv': e.detail.iv
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            var info = JSON.parse(res.data.info);
            phone = info.purePhoneNumber;
            _this.setData({
              phone: info.purePhoneNumber
            });
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.info,
            });
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '获取失败',
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
   * 获取验证码
   */
  getVerify: function () {
    var _this = this;
    if (phone == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号',
        showCancel: false
      });
      return false;
    }

    if (!common.ismobile(phone)) {
      wx.showModal({
        title: '提示',
        content: '手机号格式错误',
        showCancel: false
      });
      return false;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    wx.request({
      url: common.config.host + '/index.php/Api/Base/getVerify',
      data: {
        'phone': phone,
        'authorizerId': app.globalData.authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            //开启定时器
            seconds = 60;
            clearInterval(verifyTimer);
            verifyTimer = setInterval(function () {
              if (seconds <= 0) {
                seconds = 0;
                clearInterval(verifyTimer);
              }
              _this.setData({
                seconds: seconds
              });
              seconds--;
            }, 1000);
            wx.showModal({
              title: '提示',
              content: res.data.info,
              showCancel: false
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
  },

  /**
  * 用户输入的手机号
  */
  inputPhone: function (e) {
    phone = e.detail.value;
  },

  /**
   * 查询待领取的会员卡
   */
  queryToreceive: function () {
    var p = new Promise(function (resolve, reject) {
      wx.request({
        url: common.config.host + '/index.php/Api/Requestdata/queryToreceive',
        data: {
          'authorizerId': app.globalData.authorizerId,
          'phone': phone
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.hideLoading();
          if (res.statusCode == 200) {
            if (res.data.status == 1) {
              resolve(res.data);
            } else {
              reject(res.data.info);
            }
          } else {
            reject('请求失败，服务器错误');
          }
        },
        fail: function (res) {
          wx.hideLoading();
          if (res.errMsg == 'request:fail timeout') {
            wx.showModal({
              title: '提示',
              content: '请求超时',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack();
                }
              }
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '请求失败',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack();
                }
              }
            });
          }
        }
      });

    });

    return p;
  },

  /**
   * 点击确定加载待领取卡
   */
  formSubmit: function (e) {
    var _val = e.detail.value;
    formId = e.detail.formId;
    var _this = this;

    if (_val.names.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请输入姓名',
        showCancel: false
      });
      return false;
    }

    if (_val.phone.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机',
        showCancel: false
      });
      return false;
    }

    if (!common.ismobile(_val.phone.trim())) {
      wx.showModal({
        title: '提示',
        content: '手机号格式错误',
        showCancel: false
      });
      return false;
    }

    if (_val.verify.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请输入验证码',
        showCancel: false
      });
      return false;
    }

    if (_val.verify.trim().length != 6 || !common.isnumber(_val.verify.trim())) {
      wx.showModal({
        title: '提示',
        content: '验证码错误',
        showCancel: false
      });
      return false;
    }

    //用户输入的领卡手机号
    receivePhone = _val.phone.trim();

    //查询待接收的会员卡
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var openid = wx.getStorageSync('openid');

    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/qToReceived',
      data: {
        'openid': openid,
        'value': _val,
        'authorizerId': app.globalData.authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1) {

            var receiveCard = res.data.info;

            for (let i = 0; i < receiveCard.length; i++) {
              receiveCard[i]['Balance'] = (parseFloat(receiveCard[i].cardnum) + parseFloat(receiveCard[i].sendnum));
            }

            _this.setData({
              receiveCard: receiveCard
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
   * 会员卡退回
   */
  cardReturn: function (e) {
    let rguid = e.detail.target.dataset.rguid;
    let _this = this;
    
    //提示是否确认退回
    wx.showModal({
      title: '提示',
      content: '确定要将此卡退回给转赠人吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });

          wx.request({
            url: common.config.host + '/index.php/Api/Requestdata/cardReturn',
            data: {
              'authorizerId': app.globalData.authorizerId,
              'rguid': rguid
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
                        _this.queryToreceive().then(function (data) {
                          if (data.info.length == 0) {
                            _this.setData({
                              receiveCard: false
                            });
                          } else {
                            var receiveCard = data.info;
                            for (let i = 0; i < receiveCard.length; i++) {
                              receiveCard[i]['Balance'] = (parseFloat(receiveCard[i].cardnum) + parseFloat(receiveCard[i].sendnum));
                            }
                            _this.setData({
                              receiveCard: receiveCard
                            });
                          }
                        }).catch(function (data) {
                          wx.reLaunch({
                            url: '/pages/index/index',
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
      }
    })
  },

  /**
   * 领取会员卡
   */
  cardReceive: function (e) {
    RGUID = e.currentTarget.dataset.rguid;

    wx.navigateTo({
      url: '../cardReceive/cardReceive?guid=' + RGUID + '&receivePhone=' + receivePhone,
    });
  },

  /**
   * 拨打电话
   */
  callPhone: function(e){
    let phone = e.currentTarget.dataset.phone;

    if(!phone){
      return false;
    }

    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})