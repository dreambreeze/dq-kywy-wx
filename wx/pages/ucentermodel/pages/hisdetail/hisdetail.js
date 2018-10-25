var app = getApp();
//获取全局配置
var common = require('../../../../common.js');

Page({

  /**
   * 
   */
  data: {
    bill:{},
    detail:{},
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无会员卡图片的默认会员卡图
    datePicurl: 'https://iservice.daqisoft.cn/Public/Home/images/date.png',
    hisPicurl: 'https://iservice.daqisoft.cn/Public/Home/images/hisdefpic.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中...',
    })
  
    var bill = wx.getStorageSync("hdbill")
    var choosecard = wx.getStorageSync("choosecard")
    let func = (bill.PayNo || bill.OPType == '跨店消费' || bill.OPType.indexOf('转账')!==-1) ?'Link_GetMMCardConsumeHisInfoPayDetail':'Link_GetMMCardConsumeHisInfoNewChgDetail'
    let astinfo = bill.AstInfo
    let OpenShopNo = choosecard.ShopNo
    let BShopNo = bill.BShopNo ? bill.BShopNo : ''
    let PPayNo = bill.PayNo
    wx.request({
      url: common.config.host + '/index.php/Api/AutoBase/getHistoryDataDetail',
      data: {
        "authorizerId": app.globalData.authorizerId,
        "openid": "omd4W0XTr5yopeRwrUn88kUdRuxQ",
        'func': func,
        "OpenShopNo": OpenShopNo,
        "BShopNo": BShopNo,
        "PPayNo": PPayNo,
        "cardno": bill.RecNo,
        'astinfo': astinfo,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        if(res.data.status==1){
          that.setData({ detail: res.data.info, autoinfo: res.data.autoinfo, })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.info,
            showCancel:false,
            success:function(res){
              wx.navigateBack()
            }
          })
         
        }
        
      },
      fail: function (res) {
        
      }
    })

    this.setData({
      bill:bill,
      choosecard: choosecard
    })
    wx.hideLoading()
  },

  onUnload:function(){
    wx.removeStorageSync("hdbill")
    wx.removeStorageSync("hddetail")
  },

 
  
})