var common = require('../../../../common.js');
var app = getApp();

//当前要转赠的卡
var transCard;
//重新获取验证码秒数
var seconds;
//定时器
var verifyTimer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    transCard: transCard,
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无会员卡图片的默认会员卡图
    cardPicUrl: common.config.cardPicUrl,
    seconds: seconds
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cardno = options.cardno;
    var shopno = options.shopno;
    //获取当前用户的所有会员卡
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var openid = wx.getStorageSync('openid')
      , _this = this;

    wx.request({
      url: common.config.host + '/index.php/Api/Base/getVipCard',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'openid': openid,
        'type': 2
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            if (res.data.info == '') {
              wx.showModal({
                title: '提示',
                content: '无会员卡类型',
                showCancel: false
              });
            } else {

              for (var i = 0; i < res.data.info.length; i++) {
                if (res.data.info[i].CardNo == cardno && res.data.info[i].ShopNo == shopno) {
                  transCard = res.data.info[i];
                }
              }

              //卡状态是否正常
              if (transCard.CardState != 0) {
                var CardStateMsg = '';
                switch (transCard.CardState) {
                  case 1:
                    CardStateMsg = '会员卡已锁定';
                    break;
                  case 2:
                    CardStateMsg = '会员卡已挂失';
                    break;
                }
                wx.showModal({
                  title: '提示',
                  content: CardStateMsg,
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.navigateBack();
                    }
                  }
                });
                return false;
              }

              transCard['names'] = res.data.names;
              transCard['phone'] = res.data.phone;
              transCard['Balance'] = (parseFloat(transCard.CardNum) + parseFloat(transCard.SendNum));
              
              _this.setData({
                transCard: transCard
              });

            }
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
  },

  /**
   * 点击转赠提交按钮
   */
  formSubmit: function (e) {
    var _val = e.detail.value;
    var formId = e.detail.formId;
    _val['szphone'] = _val.szphone.trim().replace(/[-]/g, '');

    if (_val.phone.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请先绑定手机号',
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

    if (_val.szphone.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请输入受赠人手机号',
        showCancel: false
      });
      return false;
    }

    if (!common.ismobile(_val.szphone.trim())) {
      wx.showModal({
        title: '提示',
        content: '受赠人手机号格式错误',
        showCancel: false
      });
      return false;
    }

    if (_val.phone.trim() == _val.szphone.trim()){
      wx.showModal({
        title: '提示',
        content: '不能转赠给自己',
        showCancel: false
      });
      return false;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var TaskSrc = '';
    try {
      var res = wx.getSystemInfoSync();
      TaskSrc = res.model;
    } catch (e) {
      TaskSrc = '未知（获取失败）';
    }
    
    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/transfer',
      data: {
        'value': _val,
        'authorizerId': app.globalData.authorizerId,
        'formId': formId,
        'transCard': transCard,
        'TaskSrc': TaskSrc
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            wx.redirectTo({
              url: '../cardtrans-success/cardtrans-success',
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
   * 获取验证码
   */
  getVerify: function (e) {
    var phone = e.currentTarget.dataset.phone,_this = this;
    if (phone == '') {
      wx.showModal({
        title: '提示',
        content: '请先绑定手机号',
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
        'authorizerId': app.globalData.authorizerId,
        'ShopNo': transCard.ShopNo
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
            verifyTimer = setInterval(function(){
              if (seconds <= 0){
                seconds = 0;
                clearInterval(verifyTimer);
              }
              _this.setData({
                seconds: seconds
              });
              seconds --;
            },1000);
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

  }
})