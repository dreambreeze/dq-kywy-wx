var app =getApp();
var common = require('../../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showImgUrl:null,
    toright: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/toright.png',
    storeimg: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/store.png',
    cart:{},
    orderstatus:0,
    noorder: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/noorder.png',
    orderTypeList:[
      { id: 0, name: "全部", selected:true,'status':"已取消"},
      { id: 1, name: "待付款", selected: false, 'status': "待付款" },
      { id: 2, name: "待发货", selected: false, 'status': "待发货"},
      { id: 3, name: "待收货", selected: false, 'status': "待收货"},
      { id: 4, name: "待评价", selected: false, 'status': "待评价"},
    ],
    orderList: [{}],
    start: 1,
    height: 0,
    nomore: false,

    payment:0,
    payid:0,
    payWayList: [
      { id: 1, name: '会员卡支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/mmcard.png' },
      { id: 2, name: '微信支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/wechat.png' },
    ],
    pwseleted: 0,
    showPayWay: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载...',
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          height: res.windowHeight
        })
      }
    })
    this.setData({ showImgUrl: common.config.showImgUrl})
    if(options.status){
      this.setData({ 
        orderstatus: options.status
      })
    }
    this.loadingdata(options.status)

  },


  //加载数据
  loadingdata: function (field){
    //加载订单数据
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/order/shopmineorder",
      data: { "request": 2, "uid": app.globalData.uid, "field": field ? field : 0 },
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
    if (res.data.orderList.length<3){
      that.setData({ nomore: true})
    }
    wx.hideLoading()
    that.setData({
      orderList: res.data.orderList
    })

  },

  activeorder:function(e){
    wx.showLoading({
      title: '正在加载...',
    })
    var id = e.target.dataset.id
    
    var orderTypeList = this.data.orderTypeList
    for (var i in orderTypeList){
      if(id==i){
        orderTypeList[i].selected = true
      }else{
        orderTypeList[i].selected = false
      }
    }
    this.setData({
      orderTypeList: orderTypeList,
      orderstatus:e.target.dataset.id,
      start:1,
      nomore:false
    })

    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/order/shopmineorder",
      data: { "request": 2, "uid": app.globalData.uid,"field":id},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {

        that.dealdata(res, that)
      }
    })

  },

  viewOrderdetail:function(e){
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../shoporderdetail/shoporderdetail?id='+id,
    })
  },

  goshop:function(){
    wx.reLaunch({
      url: '../detail/detail',
    })
  },

  //订单按钮操作
  tapto:function(e){
    var operate = e.currentTarget.dataset.operate
    var id = e.currentTarget.dataset.id
    this.taploading(operate,id)
  },
  
  //底部操作
  taploading: function (operate,id){
    wx.showLoading({
      title: '加载中...',
    })
    var host = common.config.host
    var that=this
    wx.request({
      url: host+'/minashop/order/shoporderoperate',
      data: { 'id': id, "operate": operate},
      header:{'content-type':'application/json'},
      success(res){
       // console.log(that.data.orderstatus)
        that.loadingdata(that.data.orderstatus)
       wx.showToast({
         title: res.data.msg,
       })
      }
    })
  },

  //上拉加载数据
  lower: function () {
    if (!this.data.nomore)
      this.loadajax();
  },
  loadajax:function(){
    wx.showLoading({
      title: '加载中...',
    })
    var that = this
    var field = that.data.orderstatus
    var start = that.data.start + 1
    var host = common.config.host
    wx.request({
      url: host + "/minashop/order/shopmineorderloading",
      data: { "request": 2, "uid": app.globalData.uid, "field": field ? field : 0, "start": start },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var orderList = that.data.orderList
        if (res.data.orderList.length < 3) {
          that.setData({ nomore: true })
        }
        orderList = orderList.concat(res.data.orderList)
        that.setData({
          start: start,
          orderList: orderList
        })
        wx.hideLoading()
      }
    })
  },


  //付款----  //生成订单
  pay: function (e) {
  
    wx.showToast({
      icon: 'loading',
    })
    
    this.setData({
      payment:e.currentTarget.dataset.money,
      payid: e.currentTarget.dataset.id,
      showPayWay: true,
    });
    wx.hideToast()
},
  //取消支付   去到订单页   可以查看所有订单
  hidePayWay: function () {
    this.setData({
      showPayWay: false,
    });

  },
  selectPayWay: function (e) {

    this.setData({
      pwseleted: e.detail.value,
    });
    console.log(e.detail.value)
    console.log(this.data.payWayList[e.detail.value - 1].name)
  },
  paysubmit: function (e) {
    if (!this.data.pwseleted) {
      wx.showToast({
        title: '请选择付款方式',
        image: '../../imgs/warn.png',
      })
      return false
    }
    var id =this.data.payid
    var operate = "pay"
    this.taploading(operate, id)
    wx.navigateTo({
      url: '../shoppaycomplete/shoppaycomplete',
    })
  },

  //页面上拉触底事件的处理函数
  onReachBottom:function(){
    this.lower()
  }
})