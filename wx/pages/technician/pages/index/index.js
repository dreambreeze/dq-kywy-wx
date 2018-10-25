//index.js
//获取应用实例
const app = getApp()
var page = 0;
var page_size =6;
Page({
  data: {
    motto: 'Hello World',
    userInfo: [{}],
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    datainfo:[],
    hidden:true,
    more:"下拉加载更多"
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  
  onPullDownRefresh: function () {
    wx.request({
      url: "https://www.slovty.cn/index.php/Home/Test/minaresponse",
      data: { "word": 78 },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
      }
    })
  },

  //数据库交互  加载
  loadMore:function(that){
    that.setData({
      hidden:false
    })
    var dataobj = that.data.datainfo||{}
      wx.request({
        url: "https://www.slovty.cn/index.php/Home/Test/minaresponse",
        data: { "page": page, "page_size": page_size },
        header: {
          'content-type': 'application/json;charset=UTF-8'
        },
        success: function (res) {
          //dataobj.push(res.data)
          if (res.data){
          for (var i = 0; i < res.data.length; i++) {
            dataobj.push(res.data[i]);
          }
          console.log(dataobj)
          console.log(res.data)
          console.log(typeof (res.data))
          that.setData({ datainfo: dataobj })
          page++;
          }else{
            that.setData({more:"没有更多了"})
          }
          that.setData({hidden:true})
        },

      })
   
    console.log(that.data.datainfo)
  },

  onLoad: function () {
    wx.addPhoneContact(function (res){
      nickname:"shichuny"
    })
    wx.onNetworkStatusChange(function (res) {
      console.log(res.isConnected)
      console.log(res.networkType)
    })

    // wx.getLocation({
    //   type: 'gcj02', //返回可以用于wx.openLocation的经纬度
    //   success: function (res) {
    //     var latitude = res.latitude
    //     var longitude = res.longitude
    //     wx.openLocation({
    //       latitude: latitude,
    //       longitude: longitude,
    //       scale: 28,
    //       name:"忘记了",
    //       address:"详细的地址说明"
    //     })
    //   }
    // })


    console.log(page)
    var wd = 78;
    var that = this
      wx.getSystemInfo({
           success:function(res){
               that.setData({
                scrollHeight:res.windowHeight
              });
           }
      });
      that.loadMore(that);
   



    wx.checkIsSupportSoterAuthentication({
      success(res) {
        // res.supportMode = [] 不具备任何被SOTER支持的生物识别方式
        // res.supportMode = ['fingerPrint'] 只支持指纹识别
         res.supportMode = ['fingerPrint', 'facial'] //支持指纹识别和人脸识别
         console.log(res)
      }
    })

    wx.onUserCaptureScreen(function (res) {
      console.log(res)
      console.log('用户截屏了')
    })


    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },


  bindscrolltolower:function(){
    var that = this
    that.loadMore(that);
  }
})
