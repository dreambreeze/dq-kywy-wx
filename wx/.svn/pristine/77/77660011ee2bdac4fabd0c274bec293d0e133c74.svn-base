// pages/techpayorder/techpayorder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    talength:0,
    payWayList: [
      { id: 1, name: '会员卡支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/techimgs/mmcard.png' },
      { id: 2, name: '微信支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/techimgs/wechat.png' },
    ],
    pwseleted: 0,
    showPayWay: false,
    orderTime:0,
    techdata:[],
    store:[],
  },

  onLoad:function(options){
    this.setData({
      techdata: wx.getStorageSync("techdata"),
      store:wx.getStorageSync("currentReserveStore"),
    })
  },

  bindinput: function (e) {
    this.setData({
      talength: e.detail.cursor,
    })
  },

  submit: function () {
    this.setData({
      showPayWay: true,
    });
  },

  hidePayWay: function () {
    this.setData({
      showPayWay: false
    });

  },
  selectPayWay: function (e) {
    this.setData({
      pwseleted: e.detail.value,
    });
    console.log(e.detail.value)
    console.log(this.data.payWayList[e.detail.value - 1].name)
  },
  paySubmit:function(){
    if (this.data.pwseleted<1){
      wx.showToast({
        title: '请选择支付方式',
      })
      return false
    }
    wx.navigateTo({
      url: '../techpaycomplete/techpaycomplete',
    })
  },
})