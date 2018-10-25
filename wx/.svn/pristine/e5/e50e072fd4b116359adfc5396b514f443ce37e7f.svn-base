//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();
Page({
  data: {
    imgUrls: [
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/tech.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/tech.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/tech.png',
    ],
    defaulttechpic: 'https://iservice.daqisoft.cn/Public/Home/images/techimgs/tech.png',
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 800,
    selected:0,
    imgCerts: [
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/cert.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/cert.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/cert.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/cert.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/cert.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/cert.png',
    ],
    showImgUrl: "",
    data: {},
  },
  bindchange:function(e){

    this.setData({
      selected: e.detail.currentItemId
    })
    console.log(e.detail.currentItemId)
    wx.setNavigationBarTitle({
      title: e.detail.currentItemId+"号理疗师",
    })
  },

  //加载
  onLoad:function(options){
    if(options.selected){
      var selected = options.selected
      this.setData({ selected: selected})
    }else{
      var selected = this.data.selected
    }
    var typeDefault = ""
    if (options.typeDefault) {
       typeDefault = options.typeDefault
    }
    console.log(selected)
    console.log(typeDefault)
    wx.setNavigationBarTitle({
      title: selected + "号理疗师",
      
    })
    var currentReserveStore = wx.getStorageSync("currentReserveStore")
    var noedid = currentReserveStore[0].nodeid
    var shopno = noedid.split("#")[0]
    //加载技师及技师类别信息  "typeDefault": typeDefault
    this.loaddata('/index.php/Api/TechNician/getTechnician',
      {
        "authorizerId": app.globalData.authorizerId,
        "shopno": shopno,
        "openid": wx.getStorageSync("openid"),
        "techniciantypeno": typeDefault
      }, 1)
  },


 


  /**
   * 加载技师数据
   */
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
       res   成功的数据   operate   加载  1-
  */
  dealdata: function (res, operate) {
    switch (operate) {
      case 1:
        var typeLists = res.data.typeLists ? res.data.typeLists:""
        this.setData({
          typeLists: typeLists,
          data: res.data.data,
          showImgUrl: common.config.showImgUrl
        })
        break
      case 2:

        break


    }
    wx.hideLoading()
  },

  toorder:function(){
    var that = this
    var data = that.data.data
    var selected = that.data.selected
    var techdata =[]
    techdata.push(data[selected])
    console.log(techdata)
    wx.setStorageSync("techdata", techdata)
    wx.navigateTo({
      url: '../techorder/techorder',
    })
  }

})