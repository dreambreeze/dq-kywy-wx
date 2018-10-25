var app = getApp()
var common = require("../../common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    orderNum:{},
    isLogin:null
  },
  onLoad:function(){
    var isLogin = app.globalData.isLogin
    console.log(isLogin)
    if (app.globalData.isLogin){
      this.loadingdata()
     
    }else{

    } 
    this.setData({
      showImgUrl1:"",
      navTabBar:wx.getStorageSync("shopNav")
    })
  },
  makePhoneCall:function(){
    wx.makePhoneCall({
      phoneNumber: '13983677077' //仅为示例，并非真实的电话号码
    })
  },
  //我的优惠券
  minecoupon:function(){
    wx.navigateTo({
      url: '../shopminecoupon/shopminecoupon',
    })
  },
  //收货地址
  mineaddr:function(){
    wx.navigateTo({
      url: '../shopaddr/shopaddr',
    })
  },

  //go订单页
  vieworder:function(e){
    wx.navigateTo({
      url: '../shopmineorder/shopmineorder?status='+e.currentTarget.dataset.status,
    })
  },

  //加载数据
  loadingdata:function(){
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      userInfo: app.globalData.userInfo
    })
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopmine",
      data: { "request": 1, "uid": app.globalData.uid },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealdata(res, that)
      }
    })
  },

  //加载数据后的  业务数据计算
  dealdata: function (res, that) {
    that.setData({
      orderNum: res.data.statuss,
      isLogin: app.globalData.isLogin,
    })
    
   wx.hideLoading()
  },

  loginout:function(){
   app.globalData.isLogin = false,
   this.loadingdata()
  },
  
  gologin:function(){
    wx.navigateTo({
      url: '../shoplogin/shoplogin',
    })
  },

  /**
     * 点击底部导航
     */
  shopNav: function (e) {
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

 
})