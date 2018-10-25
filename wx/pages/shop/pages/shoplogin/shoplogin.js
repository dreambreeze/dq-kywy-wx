var app = getApp()
var common = require("../../common.js");
Page({
  
  tapto:function(e){
    var that = this
    var operate  = e.currentTarget.dataset.operate;
    if(operate == 'refuse'){
      // wx.navigateBack({
      //   delta:1
      // })
      wx.switchTab({
        url: '../shopmine/shopmine',
      })
    }else{//去允许授权   1 已经允许获取userInfo就直接将isLogin置为true  否则 调到设置界面
      wx.showLoading({
        title: '加载中...',
      })
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            wx.authorize({
              scope: 'scope.userInfo',
              success() {
                  //console.log("已授权")
                  app.globalData.isLogin = true
                  wx.reLaunch({
                    url: '../shopmine/shopmine',
                  })
              }
            })
          }else{
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '用户未设置用户信息权限，如需体验小程序更多权益，请点击确定去设置打开',
             // showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  that.goSetting()
                }
              }
            })
          }
        }
      })
    }
  },
  /**
 * 打开用户设置
 */
  goSetting: function () {
    wx.showLoading({
      title: '加载中...',
    })
    var _this = this;
    var openid = wx.getStorageSync('openid');
    wx.openSetting({
      success(res) {
        console.log(res.authSetting)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (res) {
              app.globalData.userInfo = res.userInfo;
              wx.request({
                url: common.config.host + '/minashop/mina/saveUserInfo',
                data: {
                  'openid': openid,
                  'authorizerId': app.globalData.authorizerId,
                  'encryptedData': res.encryptedData,
                  'iv': res.iv,
                  'type': 1
                },
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  wx.showLoading({
                    title: '加载中...',
                  })
                  app.globalData.isLogin = true
                  app.globalData.uid = res.data.uid
                 // _this.loadingdata()
                  wx.reLaunch({
                    url: '../shopmine/shopmine',
                  })
                }
              });  
             
            }
          });
        } else {
          wx.switchTab({
            url: '../shopmine/shopmine',
          })
          // wx.showModal({
          //   title: '用户未授权',
          //   content: '如需体验小程序更多权益，请点击授权按钮，并点击确定。',
          //   showCancel: false,
          //   success: function (res) {
          //     if (res.confirm) {
          //       console.log('用户点击确定')
          //     }
          //   }
          // })
        }
      },
      complete(){
        wx.hideLoading()
      }
    });
  },
  
})