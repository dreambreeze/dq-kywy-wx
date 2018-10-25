var common = require('../../common.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buylist:[{}],
    takeway:0,
    showImgUrl:null,
    showChooseStore:false,
    payWayList: [
      { id: 1, name: '会员卡支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/mmcard.png' },
      { id: 2, name: '微信支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/wechat.png' },
    ],
    pwseleted: 0,
    showPayWay: false,
    storeList: [{ id: 0, name: "(一店)演示体育新城店", addr: "湖南省长沙市芙蓉区东沌渡街道体育新城演示大厦8F" }, { id: 1, name: "(二店)演示万家丽店", addr: "湖南省长沙市芙蓉区万家丽演示7F" },
      { id: 2, name: "(三店)演示三店", addr: "湖南省长沙市芙蓉区万家丽演示6F" },
      { id: 3, name: "(四店)演示四店", addr: "湖南省长沙市芙蓉区万家丽演示5F" },
      { id: 4, name: "(五店)演示五店", addr: "湖南省长沙市芙蓉区万家丽演示11F" },
    ],
    takeStore: { id: 4, name: "(五店)演示五店", addr: "湖南省长沙市芙蓉区万家丽演示22F" },
    checkedaddr:[],
    total:0.00,
    count: 0,
    buyer_note:null,
    storename: app.globalData.storename,
  },
  
  //加载购买项
  onLoad:function(){
    wx.showLoading({
      title: '加载中...',
    })
    var buylist=wx.getStorageSync("buylist")
    var total =0.00
    var count = 0.00
    for (var i in buylist){
      // console.log(buylist[i])
      // console.log(buylist[i])
      count += buylist[i].num
      total += (buylist[i].num * buylist[i].price)
    }
    total = total.toFixed(2)
    this.setData({
      buylist: buylist,
      showImgUrl: common.config.showImgUrl,
      total: total,
      count:count
    })
   //加载默认收货地址  request 1
      var that = this
      var host = common.config.host
      var checkedaddr = wx.getStorageSync("checkedaddr")
      if (checkedaddr) {
        that.setData({
          checkedaddr: checkedaddr
        })
      } else {
      wx.request({
        url: host + "/minashop/mina/shopcommit",
        data: { "request": 1, "uid": app.globalData.uid },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
            that.setData({
              checkedaddr: res.data.checkedaddr
            })
            wx.hideLoading()
        }
      })
      }
   
  },
  onShow:function(){
    var checkedaddr = wx.getStorageSync("checkedaddr")
    if (checkedaddr) {//加载选择收货地址
      this.setData({ checkedaddr: checkedaddr })
    }
  },
  //切换配送方式
  takeway: function (e) {
    var takeway = this.data.takeway
    var newtakeway = e.currentTarget.dataset.id
    if (takeway != newtakeway) {
      this.setData({
        takeway: newtakeway
      })
    }
  },
  showChooseStore: function () {
    this.setData({
      showChooseStore: true
    })
  },
  hideChooseStore:function(){
    this.setData({
      showChooseStore:false
    })
  },
  // 选择门店
  chooseStore:function(e){
    var takeStore=this.data.storeList[e.currentTarget.dataset.id]
    this.setData({
      takeStore: takeStore,
      showChooseStore: false
    })
  },
  buyer_note:function(e){
   // console.log(e)
    this.setData({ buyer_note:e.detail.value})
  },
  //付款----  //生成订单
  submit: function () {
    wx.showToast({
      icon: 'loading',
    })
    var that = this
    var host = common.config.host
    var buylist =that.data.buylist
    var total = that.data.total
    var count = that.data.count
    var params = {}
    params.buylist = buylist
    params.count = count
    params.payment = total
  
    params.addr_id = that.data.checkedaddr["id"]
    params.user_id = that.data.checkedaddr.uid
  //  params.user_id = that.data.checkedaddr.uid
    params.buyer_note = that.data.buyer_note ? that.data.buyer_note:''
    params.buyer_nick= app.globalData.userInfo.nickName
    wx.request({
      url: host + "/minashop/order/shoporder",
      data: { "request": 1, "uid": app.globalData.uid, "params": params},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res){
          wx.hideToast()
          that.setData({
            showPayWay: true,
          });
        }
        
      }
    })   
  },
  //取消支付   去到订单页   可以查看所有订单
  hidePayWay: function () {
    wx.showModal({
      title: '提示',
      content: '确定取消支付吗？',
      success: function (res) {
        if (res.confirm) {
          wx.redirectTo({
            url: '../shopmineorder/shopmineorder',
          })
         
        } else if (res.cancel) {
          return false
        }
      }
    })
    
  },
  selectPayWay: function (e) {

    this.setData({
      pwseleted: e.detail.value,
    });
    console.log(e.detail.value)
    console.log(this.data.payWayList[e.detail.value - 1].name)
  },
  paysubmit:function(){
    if (!this.data.pwseleted) {
      wx.showToast({
        title: '请选择付款方式',
        image: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/warn.png',
      })
      return false
    }
    wx.navigateTo({
      url: '../shoppaycomplete/shoppaycomplete',
    })
  },

  viewNext:function(e){
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../goodsdetail/goodsdetail?id='+id,
    })
  }

})