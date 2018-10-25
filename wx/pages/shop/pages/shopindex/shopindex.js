var common = require('../../common.js');
var app =getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls:[{}],
    types:[{}],
    hotProducts: [{}], 
    start:1,
    height:0,
    nomore:false,
    showImgUrl1:"",
    navTabBar: [
      {
        fun_name: "首页",
        fun_img	: "../../imgs/index.png",
        applet_address	:"../shopindex/shopindex",
        notcheck_img: "../../imgs/noindex.png",
        isTo	: true,
        id	: 1,
      },
      {
        fun_name: "分类",
        fun_img: "../../imgs/category.png",
        applet_address: "../shopcategory/shopcategory",
        notcheck_img: "../../imgs/nocategory.png",
        isTo: true,
        id: 2,
      },

      {
        fun_name: "购物车",
        fun_img: "../../imgs/carts.png",
        applet_address: "../shopcart/shopcart",
        notcheck_img: "../../imgs/nocarts.png",
        isTo: true,
        id: 3,
      },
      {
        fun_name: "我的",
        fun_img: "../../imgs/mine.png",
        applet_address: "../shopmine/shopmine",
        notcheck_img: "../../imgs/nomine.png",
        isTo: true,
        id: 4,
      },
      ]
  },

  onLoad:function(){
   
   wx.getSystemInfo({
     success: (res) => {
       this.setData({
         height: res.windowHeight
       })
     }
   })
   var openid= wx.getStorageSync("openid")
   if(openid){
     app.globalData.isLogin = true
   }else{
     //设置未登录状态
     app.globalData.isLogin = false
   }
  //  console.log(app.globalData.isLogin)
  //  console.log(app.globalData.authorizerId)
   this.loadingdata()
   
  },
  //向服务器请求加载数据
  loadingdata:function(){
    wx.showLoading({
      title: '加载中...',
    })
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopindex",
      data: {'openid': wx.getStorageSync("openid"), 'authorizerId': app.globalData.authorizerId},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //console.log(res)
        // console.log(res.data.imgs)
        that.setData({
          imgUrls: res.data.imgs,
          types: res.data.types,
          newProducts: res.data.newproducts,
          hotProducts: res.data.hotproducts,
          showImgUrl: common.config.showImgUrl
        })
        wx.hideLoading();
      }
    })
  },

  lower:function(){
    if (!this.data.nomore)
    this.toLowerLoading();
  },
  //上拉刷新向服务器请求加载数据
  toLowerLoading: function () {
    wx.showLoading({
      title: '加载中...',
    })
    var that = this
    var start = that.data.start + 1
    var hotProducts = that.data.hotProducts
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopindexforloaddata",
      data: { "start": start},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //console.log(res)
        // console.log(res.data.imgs)
        if (res.data.hotproducts.length<2){
          that.setData({ nomore: true})
        }
        hotProducts = hotProducts.concat(res.data.hotproducts)
        that.setData({
          hotProducts: hotProducts,
          start: start,
        })
        wx.hideLoading();
        wx.stopPullDownRefresh()
      }
    })
  },
  /**
     * 点击底部导航
     */
  shopNav: function (e) {
    var shopNav = this.data.navTabBar
    //点击跳转URL
    var url = e.currentTarget.dataset.url;
    //是否允许点击
    let isTo = e.currentTarget.dataset.isto;
    var p = new Promise(function (resolve,reject){
      wx.setStorageSync("shopNav", shopNav)
      resolve(1)
      }).then(function(res){
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
    }).catch(function(res){
      wx.showToast({
        icon:"none",
        title: '出错了请重试！',
      })
    })
   
  },

  onShareAppMessage: function () {
  
  },

  //页面上拉触底事件的处理函数
  onPullDownRefresh: function () {
    this.lower()
  }
})