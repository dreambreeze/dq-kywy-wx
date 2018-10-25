var app = getApp()
var common = require('../../../../common.js');
Page({
  data: {
    startgray:'https://iservice.daqisoft.cn/Public/Home/images/amimgs/startgray.png',
    startfull: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/startfull.png',
    pic: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/pic.png',
    camera:'https://iservice.daqisoft.cn/Public/Home/images/amimgs/camera.png',
    imageList: [],
    estar:[
      {
        id:0,
        name: "差",
      },
      {
        id: 1,
        name: "一般",
      },
      {
        id: 2,
        name: "还不错",
      },
      {
        id: 3,
        name: "很满意",
      },
      {
        id: 4,
        name: "强烈推荐",
      },
    ],
    egraySrc: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/stargray.png',
    esfullSrc: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/starfull.png',
    ekey: 5,//评分
    evaluation:'强烈推荐',

    evoinfo :{},
    goods:{},
    upload_picture_list:[],
  },

  //加载数据
  onLoad:function(){
    var evoinfo = wx.getStorageSync("evoinfo")
    var arr = evoinfo.taskjson.arr
    for (var i in arr) {
        arr[i].ekey = 5
        arr[i].evaluation = '强烈推荐'
    }
    this.setData({
      evoinfo: evoinfo,
      goods:wx.getStorageSync("goods"),
      showImgUrl: app.globalData.showImgUrl,
      fooddefpic:wx.getStorageSync("fooddefpic")
    })
  },

  takePhoto() {
    wx.chooseImage({
      count: 4, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
      }
    })
  },


  //终极,整颗星
  selected: function (e) {
    console.log(e);
    var key = e.currentTarget.dataset.id
    var eva = this.data.estar[key - 1].name;
  //  console.log("得" + key + "分" + eva)

    var evoinfo = this.data.evoinfo
    var arr = evoinfo.taskjson.arr
    var serviceitemno = e.currentTarget.dataset.gid
  //  console.log(arr)
    for(var i in arr){
      if (arr[i].ServiceItemNo == serviceitemno){
        arr[i].ekey = key
        arr[i].evaluation = eva
      }
        
    }
    this.setData({
      ekey: key,
      evaluation: eva,
      evoinfo: evoinfo
    })
  },

  //提交评价
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e)
    var evoinfo= this.data.evoinfo
    var imageList = this.data.imageList
    var arr = evoinfo.taskjson.arr
    var econtent = e.detail.value
    //  插入content
    for (var i in arr) {
      var eco = "econtent" + arr[i].ServiceItemNo
      var sno = arr[i].ServiceItemNo
      arr[i].content = econtent[eco]
      //将图片地址传 服务器
      var picarr = []
      for (var j in imageList){
       
        if (imageList[j].serviceitemno == sno){
          picarr.push(imageList[j].dbname)
        }
      }
      arr[i].picurl = picarr
    }
    
    //提交评价数据
    this.loaddata('/index.php/Api/AutoMina/evaluation',
      {
        "authorizerId": app.globalData.authorizerId,
        "tablename": "evaluation",
        "data": evoinfo,
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
          if(res.data.status==0){
            wx.showToast({
              title: '评价成功',
            })
            var kvinfos = {
              "TaskState": "3", "TaskResult": "已完成"
            }
            var evoinfo = this.data.evoinfo
            //修改订单状态  为 3 - 已完成
            this.loaddata('/index.php/Api/OnLineTasks/operate',
              [{
                "authorizerId": app.globalData.authorizerId,
                "taskid": 2,
                "tablename": "onlinetasks",
                "conditions": "RGUID = '" +evoinfo.rguid+"'",
                "kvinfos": kvinfos,
              }], 2)

            wx.redirectTo({
              url: '../order/order',
            })
            

          }else{
            wx.showToast({
              icon:"none",
              title: res.data.info,
            })
          }
        break
        case 2: break
    }
    wx.hideLoading()
  },





  chooseImage: function (e) {
    console.log(e)
    var that = this
    var serviceitemno = e.currentTarget.dataset.gid
    var imageList = that.data.imageList

    wx.chooseImage({
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      count: 3,
      success: function (res) {
        console.log(res)
        var temp = new Array

        var tempFiles = res.tempFiles
       
        
        //批量上传图片
        for (var i in tempFiles) {
          tempFiles[i].serviceitemno = serviceitemno
          tempFiles[i].key = imageList.length
          imageList.push(tempFiles[i])
          if (tempFiles[i].serviceitemno == serviceitemno){
            that.uploadser(res, that, serviceitemno, tempFiles[i].path, tempFiles[i].key)
          }

        }
       
        that.setData({ imageList: imageList })
        //console.log(imageList)
       
       
      }
    })
  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src
    console.log(current)
    var urls = []
    var imageList = this.data.imageList
    var sno = e.target.dataset.sno
    for (var i in imageList){
      if (sno == imageList[i].serviceitemno){
        urls.push(imageList[i].path)
      }
    }
    wx.previewImage({
      current: current,
      urls: urls
    })
  },
  //上传图片到服务器
  uploadser: function (res, that, serviceitemno,src,j){
     var imageList = that.data.imageList
     //console.log(src)
     //console.log(imageList)
    //上传到服务器
    wx.uploadFile({
      url: common.config.host + "/index.php/Api/AutoMina/evpicupload", //
      filePath: src,
      name: 'file',
      formData: {},
      success: function (res) {
        var data = JSON.parse(res.data) //字符串转化为JSON
        console.log(data)
        if (data.Success == true) {
          var filename = common.config.host + data.SaveName
          var dbname = data.SaveName
          //将回传过来的图片地址回写
          imageList[j].filename = filename
          imageList[j].dbname = dbname

        }
      
        that.setData({imageList: imageList})
      }
    })
  },


})