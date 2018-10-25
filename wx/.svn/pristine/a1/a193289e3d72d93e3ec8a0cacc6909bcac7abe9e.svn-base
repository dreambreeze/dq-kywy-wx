var common = require('../../common.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //导航tabBar
    navTabBar: common.config.navTabBar
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //检查是否有权限使用
    common.isExpiredTime(app.globalData.authorizerId).catch(function () {
      wx.reLaunch({
        url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=小程序使用权限已过期&notJump=1',
      });
    });

    //开启 sharetickets
    wx.showShareMenu({ withShareTicket: true })

    var _this = this;

    //检查用户openid是否保存在本地
    var openid = wx.getStorageSync('openid');
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    if(!openid){
      common.getLogin(app.globalData.authorizerId).then(function(data){
        openid = data;
        //查询用户信息
        common.getUInfo('nickname,avatarUrl,names', app.globalData.authorizerId, openid).then(function (data) {
          wx.hideLoading();
          _this.setData({
            userInfo: data.info
          });
        }).catch(function (data) {
          wx.hideLoading();
          _this.setData({
            userInfo: data
          });
        });
      }).catch(function(data){
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data.message ? data.message : data,
          showCancel: false
        });
      });
    }else{
      //查询用户信息
      common.getUInfo('nickname,avatarUrl,names', app.globalData.authorizerId, openid).then(function (data) {
        wx.hideLoading();
        _this.setData({
          userInfo: data.info
        });
      }).catch(function (data) {
        wx.hideLoading();
        _this.setData({
          userInfo: data
        });
      });
    }

    var query = wx.createSelectorQuery();
    var minHeight = 0;
    var setHeightTimer = null;
    query.selectViewport().boundingClientRect(function (rect) {
      minHeight = rect.height;
    }).exec();

    clearTimeout(setHeightTimer);
    setHeightTimer = setTimeout(function () {
      _this.setData({
        minHeight: minHeight + 'px'
      });
    }, 1000);
  },
  /**
   * 监听页面分享
   */
  onShareAppMessage: function () {
    return {
      title: '客源无忧微信营销平台'
    }
  },
  /**
   * 点击底部导航
   */
  enginNav: function (e) {
    //点击跳转URL
    var url = e.currentTarget.dataset.url;
    //是否允许点击
    let isTo = e.currentTarget.dataset.isto;
    if (!isTo) {
      wx.showModal({
        title: '提示',
        content: '功能开发中，敬请期待',
        showCancel: false
      });
      return false;
    }
    wx.redirectTo({
      url: url,
    });
  },
  /**
   * 点击功能导航
   */
  ucenterNav: function (e) {
    let url = e.currentTarget.dataset.url;
    let opened = e.currentTarget.dataset.opened;
    let funname = e.currentTarget.dataset.funname;
    //是否开通
    if (opened == 0) {
      wx.showModal({
        title: '提示',
        content: '功能暂未开通',
        showCancel: false
      });
      return false;
    }
    
    if (!url) {
      return false;
    }

    wx.navigateTo({
      url: url,
    });
  },
  /**
   * 技术支持跳转
   */
  jishuzhichi: function () {
    common.jishuzhichi();
  },

  /**
   * 个人资料设置
   * ../ucentermodel/pages/infobind
   */
  infobind: function(){
    wx.navigateTo({
      url: '../ucentermodel/pages/infobind/infobind',
    });
  },

  /**
   * 获取用户信息
   */
  getUInfo: function(e){
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var detail = e.detail;
    var openid = wx.getStorageSync('openid');
    var _this = this;
    if (detail.errMsg != 'getUserInfo:ok'){
      wx.hideLoading();
      return false;
    }
    wx.request({
      url: common.config.host + '/index.php/Api/Base/saveUserInfo',
      data: {
        'openid': openid,
        'authorizerId': app.globalData.authorizerId,
        'encryptedData': detail.encryptedData,
        'iv': detail.iv,
        'type': 1
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1){
            _this.setData({
              userInfo: {
                'nickname': detail.userInfo.nickName,
                'avatarurl': detail.userInfo.avatarUrl
              }
            });
          }else{
            wx.showModal({
              title: '提示',
              content: res.data.info,
              showCancel: false
            });
          }
        }else{
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
  * 监听页面分享  单聊不可获取shareTickets   群聊可以
  */
  onShareAppMessage: function (options) {
    let that = this;
    var sharefrom = options.from
    if (sharefrom == "menu") {//button：页面内转发按钮；menu：右上角转发菜单
      sharefrom = "menu"
    } else {
      sharefrom = "button"
    }
    var shareObj = new Object

    shareObj = {
      title: '客源无忧微信营销平台',
      url: "pages/index/index",
      success: function (res) {
        console.log(res)
        if (res.shareTickets) {//群聊
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success: function (res) {
              console.log(res)
            },
            fail: function (res) {
              console.log(res)
            },
            complete: function (res) { }
          })
        } else {//单聊
          //
        }

        wx.showLoading({
          title: '加载中',
          mask: true
        });

        //用户openid
        let openid = wx.getStorageSync('openid');

        common.getShareCoupon(app.globalData.authorizerId, openid).then(function (data) {
          wx.hideLoading();

          wx.showModal({
            title: '提示',
            content: "恭喜您分享获得优惠券，可去我的券包查看",
            showCancel: false
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
        wx.showToast({
          icon: 'none',
          title: '您取消了分享',
        })

      },
    }

    return shareObj
  },



  /**
   * 监听页面显示
   */
  onShow: function(){
    let _this = this;
    //加载我的个人中心后台分配的功能模块
    let fid = common.config.navTabBar[3].id;
    let ucenterNav = wx.getStorageSync('ucenterNav');
    if (ucenterNav) {
      _this.setData({
        fmodule: ucenterNav,
        info: ''
      });
    } else {
      common.getFunction(fid, app.globalData.authorizerId, 1).then(function (data) {
        wx.setStorageSync('ucenterNav', data.info);
        _this.setData({
          fmodule: data.info,
          info: ''
        });
      }).catch(function (data) {
        _this.setData({
          fmodule: false,
          info: data
        });
      });
    }
  }

})