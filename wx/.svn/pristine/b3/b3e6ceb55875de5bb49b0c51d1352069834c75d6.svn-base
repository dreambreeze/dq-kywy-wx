var app = getApp();
var common = require('../../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected:0,
    addrList: []
  },

  onLoad:function(){
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopaddr",
      data: { "type": 1, "uid": app.globalData.uid},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          addrList:res.data.addrs
        })
       
      }
    })
  },
  //设置默认收到货地址
  choose:function(e){
    wx.showToast({
      title: '',
      icon:"loading"
    })
   var id = e.currentTarget.dataset.id
   var that = this
   var host = common.config.host
   
   wx.request({
     url: host + "/minashop/mina/shopaddr",
     data: { "type": 4, "id": id, "uid": app.globalData.uid, "field": "checked" },
     header: {
       'content-type': 'application/json'
     },
     success: function (res) {
       console.log(res)
       that.setData({
         addrList: res.data.addrs
       })
      // wx
       //console.log(res.data.addrs[id])
       for (var i in res.data.addrs){
         if (id == res.data.addrs[i].id)
           var checkedaddr = res.data.addrs[i]
       }
       console.log(checkedaddr)
       wx.setStorageSync("checkedaddr", checkedaddr)
       wx.hideToast()
      //  wx.navigateBack({
      //    delta: 1
      //  })
      wx.redirectTo({
        url: '../shopcommit/shopcommit',
      })
     }
   })
   
  },
  //删除收货地址
  delete:function(e){
    wx.showToast({
      title: '',
      icon: "loading"
    })
    
    var id = e.currentTarget.dataset.id
    var that = this
    var host = common.config.host

    wx.request({
      url: host + "/minashop/mina/shopaddr",
      data: { "type": 4, "id": id, "uid": app.globalData.uid, "field": "status" },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        that.setData({
          addrList: res.data.addrs
        })
     
        wx.hideToast()
        
      }
    })
  },
  radioChange:function(e){
    var id= e.detail.value
    var that = this
    var host = common.config.host
    //app.globalData.uid = 3;
    wx.request({
      url: host + "/minashop/mina/shopaddr",
      data: { "type": 4,"id":id, "uid": app.globalData.uid, "field":"is_default" },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        that.setData({
          addrList: res.data.addrs
        })
      }
    })
  },

  addaddr:function(){
    wx.navigateTo({
      url: '../shopaddradd/shopaddradd',
    })
  },
  updateaddr: function (e) {
   var addr = this.data.addrList[e.currentTarget.dataset.id]
   app.addr = addr
    wx.navigateTo({
      url: '../shopaddredit/shopaddredit',
    })
  },


  onUnload:function(){
    wx.showLoading({
      title: '加载中..',
    })
    wx.removeStorageSync("checkedaddr")
    wx.navigateTo({
      url: '../shopcommit/shopcommit',
    })
  }
  
})