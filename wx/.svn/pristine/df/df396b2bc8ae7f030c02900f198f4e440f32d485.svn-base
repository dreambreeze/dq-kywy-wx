var common = require('../../common.js');
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据   默认选择第一个sku  规格的东西
   * subtype 0:加入购物车，， 1：立即购买
   */
  data: {
    imgUrls: [
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/16.png",
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/16.png",
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/16.png",
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/16.png",],
    goodsdetail:[],
    goodssku:[],
    showGoodsSelect:true,
    num:1,
    showupdateNum:false,
    scale:0,
    subtype:0,
    cartcount:0,
    goodsdesc:null,
    isLogin:null
  },
  
  onLoad: function (options) {
    this.setData({isLogin:app.globalData.isLogin});
    this.loadingdata(options)
  },

  //
  loadingdata:function(options){
    var id = options.id
    var that = this
    var host = common.config.host
    var uid = app.globalData.uid ? app.globalData.uid : ""
    wx.request({
      url: host + "/minashop/mina/shopgoodsdetail",
      data: { "id": id, "user_id": uid },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          goodsdetail: res.data.detail,
          goodssku: res.data.goodssku,
          cartcount: res.data.cartcount,
          imgUrls: res.data.detail.image.split(","),
          showImgUrl: common.config.showImgUrl,
          goodsdesc: res.data.desc,
        })
        //var desc = '<div>我是HTML代码</div>';
        //console.log(that.data.goodsdesc.desc)
        if (res.data.desc)
          WxParse.wxParse('desc', 'html', res.data.desc.desc, that, 5);

        wx.setNavigationBarTitle({ title: res.data.detail.name })
      }
    })
  },

  //选择规格
  selectscale:function(e){
    this.setData({
      scale:e.currentTarget.dataset.id
    })
  },


  hideGoodsSelect:function(){
    this.setData({
      showGoodsSelect: true
    })
  },
  showGoodsSelect:function(){
    var isLogin = this.data.isLogin
    if (isLogin) {
    this.setData({
      showGoodsSelect: false,
      subtype:1
    })
    } else {
      wx.showModal({
        title: '用户未登录',
        content: '如需体验小程序更多权益，请点击确定，前往登录页面授权登录。',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../shoplogin/shoplogin',
            })
          }
        }
      })
    }
  },
  add: function () {
    var num = parseInt(this.data.num)+1
      this.setData({
        num:num
      })
  },
  reduce:function(){
    var num = this.data.num
    if(num>1){
      num = num-1
      this.setData({
        num: num
      })
    }
  },
  updateNum:function(){
   this.setData({
     showupdateNum:true,
   }) 
  },
  cancel:function(){
    this.setData({
      showupdateNum: false,
    }) 
  },
  ok:function(e){
   // var num=this.bindbulr(e)
    this.setData({
      showupdateNum: false,
    }) 
  },
  bindblur:function(e){
    var num =  parseInt(e.detail.value)
    console.log(typeof (parseInt(num)))
    if (typeof (num) == "number" && num != '' && num >0) {
      this.setData({
        num:num
      })
    }else{
      this.setData({
        num: 1
      })
    }
  },

  //确定提交   0 加入购物车 1 立即下单
  shopsubmit:function(e){
  
    var that = this
    var host = common.config.host
    var scale = that.data.goodssku[that.data.scale]
    var list = {}
    list.goods_id = scale['goods_id']
    list.goods_name= that.data.goodsdetail['name']
    list.goodssku_id = scale["id"]
    list.goodssku_name= scale["scale"]
    list.num = that.data.num
    list.price = scale["price"]
    list.user_id = app.globalData.uid
   // list = JSON.stringify(list)
    var subtype = e.currentTarget.dataset.type
    if(subtype==0){//加入购物车
      wx.request({
        url: host + "/minashop/mina/shopaddcart",
        data: { "list": list},
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if(res){
            wx.showToast({
              title: res.data.msg,
            })
            that.setData({ cartcount: res.data.cartcount})//重新加载购物车内数量
            that.hideGoodsSelect()
          }
        }
      })
    }else{//立即购买
      list.image = scale['image']
      var buylist = [];
      buylist.unshift(list)
      wx.setStorageSync("buylist", buylist)
      wx.navigateTo({
        url: '../shopcommit/shopcommit' ,
      })
    }
   
  },
  addCart:function(){
    var isLogin = this.data.isLogin
    if (isLogin) {
    this.showGoodsSelect()
    this.setData({
      subtype:0
    })
    }else{
    wx.showModal({
      title: '用户未登录',
      content: '如需体验小程序更多权益，请点击确定，前往登录页面授权登录。',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '../shoplogin/shoplogin',
          })
        }
      }
    })
    }
  },
  onShareAppMessage: function () {
  
  },
  //点击去购物车
  goCart:function(){
    wx.switchTab({
      url: '../shopcart/shopcart',
    })
  }
})