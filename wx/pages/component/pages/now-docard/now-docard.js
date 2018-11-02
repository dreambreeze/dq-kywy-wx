var app = getApp();
var common = require('../../../../common.js');
//当前要办的卡
var currentCard = '';
//充值规则
var recharRules = [];
//性别
var sex;
//选中的充值金额
var am = 0;
//赠送金额
var gift = 0;
//重新获取验证码秒数
var seconds;
//定时器
var verifyTimer = null;
//用户手机号
var inputPhone;
//是否已同意开卡细则
var openingRules = 0;
//当前要办的卡ID
var cardid;
//生日，默认为空
var birthday = '';
//当前的充值金额规则组
var amountIdx;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    amountIdx: amountIdx,
    //当前要办的卡
    currentCard: currentCard,
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无会员卡图片的默认会员卡图
    cardPicUrl: common.config.cardPicUrl,
    //充值规则
    recharRules: recharRules,
    //重新获取验证码秒数
    seconds: seconds,
    //生日，默认为空
    birthday: birthday,
    //性别
    sex:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cardid = options.cardid;
    if (!cardid) {
      wx.showModal({
        title: '提示',
        content: '办卡信息不存在',
      });
      return false;
    }
    wx.showLoading({
      title: '加载中',
    });
    var openid = wx.getStorageSync('openid');
    var _this = this;

    //用户openid不存在时
    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function (data) {
        openid = data;

        //获取卡类型
        wx.request({
          url: common.config.host + '/index.php/Api/Base/getVipCard',
          data: {
            'openid': openid,
            'authorizerId': app.globalData.authorizerId,
            'type': 1
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            wx.hideLoading();
            if (res.statusCode == 200 && res.data.status == 1) {
              //获取当前要开的卡类型
              for (var i = 0; i < res.data.info.length; i++) {
                if (res.data.info[i].AutoID == cardid) {
                  currentCard = res.data.info[i];
                  currentCard['names'] = res.data.names;
                  currentCard['phone'] = res.data.phone;
                }
              }

              //获取充值规则
              var ruleArr = [];
              var rule = currentCard.rules.split(';');

              for (var i = 0; i < rule.length; i++) {
                ruleArr.push({
                  'am': parseFloat(rule[i].split('=')[0]),
                  'gift': parseFloat(rule[i].split('=')[1])
                });
              }

              //先排序
              ruleArr = ruleArr.sort(common.compare('am'));

              //当前选中的充值金额
              for (let i = 0; i < ruleArr.length; i++) {
                if (ruleArr[i].am >= parseFloat(currentCard.NewAccLevel)) {
                  amountIdx = i;
                  am = ruleArr[i].am;
                  gift = ruleArr[i].gift;
                  break;
                }
              }

              _this.setData({
                currentCard: currentCard,
                recharRules: ruleArr,
                NewAccLevel: parseFloat(currentCard.NewAccLevel),
                amountIdx: amountIdx
              });

            } else {
              wx.showModal({
                title: '提示',
                content: res.data.info ? res.data.info : '请求失败',
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
                showCancel: false,
                success: res => {
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
                success: res => {
                  if (res.confirm) {
                    wx.navigateBack();
                  }
                }
              });
            }
          }
        });

        //获取用户基本信息
        common.getUInfo('*', app.globalData.authorizerId, openid).then(function (data) {
          wx.hideLoading();
          birthday = data.info.birthday;
          sex = data.info.sex;

          // 用户手机号
          inputPhone = data.info.phone;

          _this.setData({
            userInfo: data.info,
            birthday: birthday,
            inputPhone: inputPhone
          });

        }).catch(function (data) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: data.message ? data.message : data,
            showCancel: false
          });
        });
      }).catch(function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data.message ? data.message : data,
          showCancel: false
        });
      });
    } else {
      //获取卡类型
      wx.request({
        url: common.config.host + '/index.php/Api/Base/getVipCard',
        data: {
          'openid': openid,
          'authorizerId': app.globalData.authorizerId,
          'type': 1
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.hideLoading();
          if (res.statusCode == 200 && res.data.status == 1) {
            //获取当前要开的卡类型
            for (var i = 0; i < res.data.info.length; i++) {
              if (res.data.info[i].AutoID == cardid) {
                currentCard = res.data.info[i];
                currentCard['names'] = res.data.names;
                currentCard['phone'] = res.data.phone;
              }
            }

            //获取充值规则
            var ruleArr = [];
            var rule = currentCard.rules.split(';');

            for (var i = 0; i < rule.length; i++) {
              ruleArr.push({
                'am': parseFloat(rule[i].split('=')[0]),
                'gift': parseFloat(rule[i].split('=')[1])
              });
            }

            //先排序
            ruleArr = ruleArr.sort(common.compare('am'));

            //当前选中的充值金额
            for (let i = 0; i < ruleArr.length; i++) {
              if (ruleArr[i].am >= parseFloat(currentCard.NewAccLevel)) {
                amountIdx = i;
                am = ruleArr[i].am;
                gift = ruleArr[i].gift;
                break;
              }
            }

            _this.setData({
              currentCard: currentCard,
              recharRules: ruleArr,
              NewAccLevel: parseFloat(currentCard.NewAccLevel),
              amountIdx: amountIdx
            });

          } else {
            wx.showModal({
              title: '提示',
              content: res.data.info ? res.data.info : '请求失败',
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
              showCancel: false,
              success: res => {
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
              success: res => {
                if (res.confirm) {
                  wx.navigateBack();
                }
              }
            });
          }
        }
      });

      //获取用户基本信息
      common.getUInfo('*', app.globalData.authorizerId, openid).then(function (data) {
        wx.hideLoading();
        birthday = data.info.birthday;
        sex = data.info.sex;
        // 用户手机号
        inputPhone = data.info.phone;

        _this.setData({
          userInfo: data.info,
          birthday: birthday,
          inputPhone: inputPhone
        });

      }).catch(function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data.message ? data.message : data,
          showCancel: false
        });
      });
    }

    //是否已同意开卡细则
    openingRules = 0;
  },
  /**
   * 点击切换金额
   */
  changeAmount: function (e) {
    if (parseFloat(e.target.dataset.am) < parseFloat(currentCard.NewAccLevel)) {
      return false;
    }

    am = e.target.dataset.am;
    gift = e.target.dataset.gift;

    this.setData({
      amountIdx: e.target.dataset.idx
    });
  },

  /**
   * 点击确定按钮
   */

  formSubmit: function (e) {
    var _val = e.detail.value;

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

    //充值金额是否大于0
    if (am == 0) {
      wx.showModal({
        title: '提示',
        content: '没有充值金额！请选择充值金额',
        showCancel: false
      });
      return false;
    }

    //是否达到最低开卡标准(金额)
    if (parseFloat(am) < parseFloat(currentCard.NewAccLevel)) {
      wx.showModal({
        title: '提示',
        content: '充值金额未达到开卡标准金额，此卡开卡标准金额为' + currentCard.NewAccLevel + '元',
        showCancel: false
      });
      return false;
    }

    //是否已同意开卡细则
    if (currentCard.MMInfo && openingRules != 1) {
      wx.showModal({
        title: '提示',
        content: '请仔细阅读开卡细则并同意开卡细则',
        showCancel: false
      });
      return false;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var formId = e.detail.formId;
    var openid = wx.getStorageSync('openid');

    //获取手机设备信息
    var systemInfo = '';
    try {
      var res = wx.getSystemInfoSync();
      systemInfo = res.model;
    } catch (e) {
      systemInfo = '未知（获取失败）';
    }

    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/docardUniformOrders',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'formId': formId,
        'openid': openid,
        'rAmount': am,
        'gAmount': gift,
        'currentCard': currentCard,
        'userInfo': {
          'names': _val.names.trim(),
          'phone': _val.phone.trim(),
          'verify': _val.verify.trim(),
          'staffNo': _val.staffNo.trim(),
          'sex': sex,
          'birthday': birthday,
          'systemInfo': systemInfo
        }
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        var info = res.data.info;
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            wx.requestPayment({
              timeStamp: info.timeStamp,
              nonceStr: info.nonceStr,
              package: info.package,
              signType: info.signType,
              paySign: info.paySign,
              success: function (res) {
                console.log(res);
                if (res.errMsg == 'requestPayment:ok') {
                  //保存prepay_id用于发送小程序模版信息
                  common.savePrepayId(app.globalData.authorizerId, openid, info.package);
                  wx.showModal({
                    title: '提示',
                    content: '提交成功',
                    mask: true,
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        wx.redirectTo({
                          url: '/pages/ucentermodel/pages/orders/orders',
                        });
                      }
                    }
                  });
                }
              },
              fail: function (res) {
                if (res.errMsg == 'requestPayment:fail cancel') {
                  wx.showToast({
                    title: '支付已取消',
                    mask: true
                  });
                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.errMsg,
                    showCancel: false
                  });
                }
              }
            });
          } else {
            wx.showModal({
              title: '提示',
              content: info,
              showCancel: false
            });
          }
        } else {
          wx.showModal({
            title: '提示',
            content: info,
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
   * 开卡点击性别切换
   */
  changeSex: function (e) {
      sex = parseInt(e.currentTarget.dataset.sex);
      this.setData({
          sex: sex
      });
  },
  /**
   * 点击查看办卡细则
   */
  rules: function () {
    this.setData({
      showMask: true
    });
  },
  /**
   * 关闭办卡细则
   */
  closeRules: function () {
    this.setData({
      showMask: false
    });
  },

  /**
   * 用户输入的手机号
   */

  inputPhone: function (e) {
    inputPhone = e.detail.value;
  },

  /**
   * 点击同意开卡细则
   */
  openingRules: function (e) {
    openingRules = e.detail.value[0];
  },
  /**
   * 获取验证码
   */
  getVerify: function (e) {
    var _this = this;

    if (!inputPhone) {
      wx.showModal({
        title: '提示',
        content: '请输入手机号',
        showCancel: false
      });
      return false;
    }

    if (!common.ismobile(inputPhone)) {
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
        'phone': inputPhone,
        'authorizerId': app.globalData.authorizerId,
        'ShopNo': currentCard.ShopNo
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
            inputPhone = info.purePhoneNumber;
            _this.setData({
              inputPhone: info.purePhoneNumber
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
  }
})