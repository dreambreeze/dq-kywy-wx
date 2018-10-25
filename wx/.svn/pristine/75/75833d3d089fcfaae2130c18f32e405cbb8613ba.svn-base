var app = getApp();
var common = require('../../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/type.png", 
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/type.png", 
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/type.png", 
      "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/type.png",],
 
   
    hotProducts: [{}],
    sortimg:"https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/sort.png",
    sortascimg: "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/sortasc.png",
    sortdescimg: "https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/sortdesc.png",
    sortstatus:0,
    typeDefault:"weigh",
    inputvalue:"",
    showImgUrl:null,
    conditions:[],
    field:"",
    valueid:0,
    start: 1,
    height: 0,
    nomore: false
  },

  onLoad:function(options){
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          height: res.windowHeight
        })
      }
    })
    
    var that = this
    var host = common.config.host
   
    that.setData({showImgUrl:common.config.showImgUrl})
    if (options.name){
      wx.setNavigationBarTitle({
        title: options.name,
      })
    }
    if(options.wd){
      that.setData({
        inputvalue: options.wd
      })
      that.loadingdata(2)
      
    }else{
      that.setData({
         field: options.type ? options.type : 'column_id',
         valueid: options.id
         })
      that.loadingdata(1)
    }
  },

  //加载数据
  loadingdata: function (request){
    wx.showLoading({})
    this.setData({nomore:false})
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shoptype",
      data: { "request": request, "field": that.data.field, 'valueid': that.data.valueid, 'keywords': that.data.inputvalue,'order': that.data.typeDefault, "sortstatus": that.data.sortstatus,},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealdata(res, that)
      }
    })
  },
  //加载完成后的数据 预装 处理
  dealdata:function(res,that){
    that.setData({
      hotProducts: res.data.goodsdata
    })
    wx.hideLoading()
  },

  //页面上拉触底事件的处理函数
  OnPullDownRefresh: function () {
    this.lower()
  },
  lower: function () {
    if (!this.data.nomore)
    this.loadingDataFor()
  },
  //上拉刷新  加载
  loadingDataFor: function () {
    wx.showLoading({})
    var that = this
    var start = that.data.start+1
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shoptypeloading",
      data: {"field": that.data.field, 'valueid': that.data.valueid, 'keywords': that.data.inputvalue, 'order': that.data.typeDefault, "sortstatus": that.data.sortstatus, "start":start},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealDataFor(res, that)
      }
    })
  },
  //加载完成后的数据 预装 处理
  dealDataFor: function (res, that) {
    var hotProducts = that.data.hotProducts
    if (res.data.goodsdata.length<2){
      that.setData({nomore: true })
    }
    hotProducts = hotProducts.concat(res.data.goodsdata)
    that.setData({
      hotProducts: hotProducts
    })
    wx.hideLoading()
  },


  bindfocus:function(){
    wx.navigateTo({
      url: '../shopsearch/shopsearch',
    })
  },
  typeSelect: function (e) {
    var tid = e.currentTarget.dataset.id
    var typeDefault = this.data.typeDefault
    var sortstatus = this.data.sortstatus
    if (tid != typeDefault) {
      //加载数据
      var request = this.data.inputvalue ? 2 : 1
      this.setData({
        typeDefault: tid
      })
      this.loadingdata(request)
    }
    if (tid == "price") {
      //加载数据
      var request = this.data.inputvalue ? 2 : 1
     
      var newstatus = sortstatus == 0 ? 1 : (sortstatus == 1?2:1)
        this.setData({
          sortstatus: newstatus
        })
      this.loadingdata(request)
    }else{
      this.setData({
        sortstatus: 0
      })
    }





  },
})