var app =getApp();
var common = require('../../../../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toright: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/toright.png',
    storeimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/store.png',
    cart:{},
    orderstatus:1,
    noorder:'https://iservice.daqisoft.cn/Public/Home/images/amimgs/noorder.png',
    order:[],
    store:"",
    orderlength:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      store:wx.getStorageSync("store"),
      
    })
    var phoneinfo = wx.getStorageSync("phoneinfo")
    var phone = phoneinfo.phone
    
    //加载历史订单信息
    this.loaddata('/index.php/Api/OnLineTasks/lists',
      {
        "authorizerId": app.globalData.authorizerId,
        "tablename": "onlinetasks",
        "conditions": "taskid=7 and taskstate>0 and PhoneNo = '" + phone + "' order by tasktime desc",
      }, 1)



  },

  /* 加载数据 */
  loaddata: function (url, data, operate) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    var that = this

    wx.request({
      url: common.config.host + url,
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealdata(res, operate)
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
            content: '网络连接失败，请检查您的网络',
            showCancel: false
          });
        }
      }
    });
  },

  /* 处理加载过来的数据 
       res   成功的数据   operate   加载  1-加载会员卡信息   2-加载会员卡项目优惠信息
  */
  dealdata: function (res, operate) {
    switch (operate) {
      case 1:
        if (res.data.status==0) {
          //var order = this.data.order
          var order = res.data.data
          var orderlength = Object.keys(order).length
          for(var i in order){
            order[i].taskjson = JSON.parse(order[i].taskjson)
          }
          this.setData({
            order: order,
            orderlength:orderlength
          })
        }else{
          this.setData({
            order: [],
            orderlength: 0
          })
        }
        break
      case 2:
        
        var phoneinfo = wx.getStorageSync("phoneinfo")
        var phone = phoneinfo.phone
        var orderstatus = this.data.orderstatus
        if (orderstatus == 1) {
          var conditions = "taskid=7 and taskstate>0 and  PhoneNo = '" + phone + "' order by tasktime desc"
        } else {
          var conditions = "taskid=7 and PhoneNo = '" + phone + "' and taskstate = " + orderstatus + " order by tasktime desc"
        }
        //加载历史订单信息
        this.loaddata('/index.php/Api/OnLineTasks/lists',
          {
            "authorizerId": app.globalData.authorizerId,
            "tablename": "onlinetasks",
            "conditions": conditions,
          }, 1)
          if(res=="Refresh"){
            wx.hideNavigationBarLoading() //完成停止加载
            wx.stopPullDownRefresh() //停止下拉刷新
          }
        break
      case 3://提交订单
 var phoneinfo = wx.getStorageSync("phoneinfo")
        var phone = phoneinfo.phone
        var orderstatus = this.data.orderstatus
        if (orderstatus == 1) {
          var conditions = "taskid=7 and taskstate>0 and  PhoneNo = '" + phone + "' order by tasktime desc"
        } else {
          var conditions = "taskid=7 and PhoneNo = '" + phone + "' and taskstate = " + orderstatus + " order by tasktime desc"
        }
        //加载历史订单信息
        this.loaddata('/index.php/Api/OnLineTasks/lists',
          {
            "authorizerId": app.globalData.authorizerId,
            "tablename": "onlinetasks",
            "conditions": conditions,
          }, 1)
        break

    }
    wx.hideLoading()
  },




  toorderdetail:function(e){
    var rguid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderdetail/orderdetail?rguid=' + rguid,
    })
  },

  activeorder:function(e){
    var orderstatus = e.target.dataset.id
    if (orderstatus != this.data.orderstatus){
      this.setData({
        orderstatus: e.target.dataset.id
      })
      var phoneinfo = wx.getStorageSync("phoneinfo")
      var phone = phoneinfo.phone
      if (orderstatus == 1) {
        var conditions = "taskid=7 and taskstate>0 and  PhoneNo = '" + phone +"' order by tasktime desc"
      }else{
        var conditions = "taskid=7 and PhoneNo = '" + phone + "' and taskstate = " + orderstatus + " order by tasktime desc"
      }
       
        //加载历史订单信息
        this.loaddata('/index.php/Api/OnLineTasks/lists',
          {
            "authorizerId": app.globalData.authorizerId,
            "tablename": "onlinetasks",
            "conditions": conditions,
          }, 1)
    }
    
    
  },

  goshop:function(){
    wx.redirectTo({
      url: '../detail/detail',
    })
  },

  /**
   * 单个订单的操作  onemore-再来一单 evaluation-评价  del-删除
    */

  operate:function(e){
    var operation = e.currentTarget.dataset.operate
    var that = this
    switch(operation){
      case "evaluation":
          var index = e.currentTarget.dataset.index
          var evoinfo = this.data.order[index] //  点击去评价的订单
          wx.setStorageSync("evoinfo", evoinfo)
          wx.navigateTo({
            url: '../evaluation/evaluation',
          })
          break
      case "del":
       
        wx.showModal({
          title: '提示',
          content: '确认删除吗？',
          success:function(res){
            if(res.confirm){//确认删除
              var kvinfos = {}
              var index = e.currentTarget.dataset.index
              var evoinfo = that.data.order[index] //  点击去评价的订单
              console.log(evoinfo)
              //修改订单状态  为 0 - 删除 
              that.loaddata('/index.php/Api/OnLineTasks/operate',
                [{
                  "authorizerId": app.globalData.authorizerId,
                  "taskid": 3,
                  "tablename": "onlinetasks",
                  "conditions": "RGUID = '" + evoinfo.rguid + "'",
                  "kvinfos": kvinfos,
                }], 2)
            }
          },
        })
       
          break
      case "onemore":
       
          
         var cart = {
          count:0,
          total:0,
          list: { }
        }
          var index = e.currentTarget.dataset.index
          var evoinfo = that.data.order[index] //  点击去评价的订单
          console.log(evoinfo)
          var shopno = evoinfo.shopno
          var ShopNoRoomNo = wx.getStorageSync("ShopNoRoomNo")
          var nowshopno=""
          if (ShopNoRoomNo){
            let sceneArr = ShopNoRoomNo.split('@');
            var nowshopno = sceneArr[0].split('=')[1];
          }
          console.log(shopno)
          console.log(nowshopno)
          if (shopno != nowshopno){
            wx.showModal({
              title: '提示',
              content: '不是同一门店，无法再来一单！',
              showCancel:false,
             
            })
              return false
          }

          var evoarr = evoinfo.taskjson.arr
          var count = 0
          var total = 0
          for (var j in evoarr){
            cart.list[evoarr[j].ServiceItemNo] = evoarr[j].ServiceNum
            count += evoarr[j].ServiceNum
            total += evoarr[j].ServiceNum * evoarr[j].OPrice
          } 
          cart.count =count
          cart.total = total
          app.cart = cart
          wx.navigateTo({
            url: '../detail/detail',
          })
         // console.log(cart)
          console.log("再来一单")
          break
    }
  },

   onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var conditions = this.data.conditions
    
    this.dealdata('Refresh',  2)
  }
})