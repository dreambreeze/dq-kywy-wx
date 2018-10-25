var app=getApp();
var common = require('../../common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
   addr: {},
   orderList: [{}],
   goods: {},
   order:[],
   showImgUrl:null,
   storename:"",
   traces:{},
  },

  onLoad:function(options){
    this.loadingdata(options.id ? options.id:1)
    this.setData({ showImgUrl: common.config.showImgUrl, storename: app.globalData.storename})
  },

  //加载数据
  loadingdata: function (id) {
    wx.showLoading({title:"加载中..."})
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/order/shoporderdetail",
      data: {"id":id},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealdata(res, that)
      }
    })
  },
  //加载完成后的数据 预装 处理
  dealdata: function (res, that) {
    console.log(res.data)
   // console.log(Collections.reverse(res.data.traces.Traces))
    that.setData({
      orderList: res.data.orderitem,
      addr: res.data.addr,
      express: res.data.express,
      order: res.data.order,
      traces: res.data.traces
    })
    wx.hideLoading()
  },

  //收货地址
  mineaddr:function(){
    wx.navigateTo({
      url: '../shopaddr/shopaddr',
    })
  },
  viewNext:function(e){
    common.viewNext(e)
  },
})