var app = getApp();
var common = require('../../../../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pic: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/pic.png',
    cartimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/cart.png',
    toright: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/toright.png',
    egraySrc: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/stargray.png',
    esfullSrc: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/starfull.png',
    startgray:'',
    addimg: '',
    reduceimg: '',
    good:{},
    goods:{},
    cart:{},
    showCartDetail: false,
    evaluation:[],
    length:0,
    showImgUrl:""
  },
  onShow(options){
    var good = wx.getStorageSync("good")
    var nodeid = wx.getStorageSync("store").request_id
    this.setData({
      good: good,
      goods: wx.getStorageSync("goods"),
      cart: app.cart,
      addimg: app.globalData.addimg,
      reduceimg: app.globalData.reduceimg,
      showImgUrl: common.config.showImgUrl,
      fooddefpic: wx.getStorageSync("fooddefpic")
    })
    //提交评价数据
    this.loaddata('/index.php/Api/AutoMina/getevaluation',
      {
        "authorizerId": app.globalData.authorizerId,
        "tablename": "evaluation",
        "shopno": nodeid.split("#")[0],
        "serviceitemno": good.serviceitemno
      }, 1)
  },
 
  // 加购物车操作
  //   添加购物车
  tapAddCart: function (e) {
    var id = e.target.dataset.id;
    var goods = this.data.goods[id];
    var num = this.data.cart.list[id] || 0;
    if (num > 8 && goods.onlycash == 0) {
      wx.showToast({
        title: '达到限定数量了',
        image: '../../imgs/warn.png',
        duration: 2000
      })
      return false;

    } else {
      this.addCart(id);
    }


  },
  //从购物车减去
  tapReduceCart: function (e) {
    this.reduceCart(e.target.dataset.id);
  },

  // 内部函数 购物车操作 获取原始信息 
  addCart: function (id) {
    var num = this.data.cart.list[id] || 0;
    this.data.cart.list[id] = num + 1;
    this.countCart();

  },
  //内部函数  ，减去商品
  reduceCart: function (id) {
    var num = this.data.cart.list[id] || 0;
    if (num <= 1) {
      delete this.data.cart.list[id];
    } else {
      this.data.cart.list[id] = num - 1;
      //console.log(this.data.cart.list[id]);
    }

    this.countCart();
  },
  //内部函数 计算购物车数据
  countCart: function () {
    var count = 0,
      total = 0;
    for (var id in this.data.cart.list) {
      var goods = this.data.goods[id];
      count += this.data.cart.list[id];
      total += goods.itembaseprice * this.data.cart.list[id];
     
    }
    total = parseFloat((total).toFixed(2)) 
    this.data.cart.count = count;
    this.data.cart.total = total;
    //防止将购物车的商品减空之后，再次加入时出现 购物车详情
    if (count < 1) {
      this.setData({
        showCartDetail: false,
       
      });
    }
    this.setData({
      cart: this.data.cart,

    });
  },
  //清空购物车
  clear: function () {
    var shopcart = this;
    wx.showModal({
      title: '清空购物车？',
      content: '',
      confirmText: '清空',
      success: function (res) {
        if (res.confirm) {
          shopcart.setData({
            cart: {
              count: 0,
              total: 0,
              list: {}
            },
            showCartDetail: false,
          });
        } else if (res.cancel) {
          return false;

        }
      }
    })
  },
  showCartDetail: function () {
    //改进展示购物车的方法
    var num = this.data.cart.count;
    if (num > 0) {
      this.setData({
        showCartDetail: !this.data.showCartDetail
      });
    }
  },
  hideCartDetail: function () {
    this.setData({
      showCartDetail: false
    });
  },

  submit: function (e) {
    app.goodsList = this.data.goodsList;
    app.goods = this.data.goods;
    app.cart = this.data.cart;
    var addr = this.data.addr;
    this.hideCartDetail()
    wx.navigateTo({
      url: '../commit/commit?addr=' + addr,
    })

  },
  onUnload:function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    // prevPage.setData({
    //   cart: this.data.cart,
    // })
    app.cart= this.data.cart
  },

  //加载用户商品评价
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
       res   成功的数据   operate     1-
  */
  dealdata: function (res, operate) {
    switch (operate) {
      case 1:
        console.log(res)
        if (res.data.status == 0) {
        
          this.setData({
            evaluation: res.data.data,
            length: res.data.length
          })
        } else {
          this.setData({
            evaluation: [],
            length: 0
          })
        }
        break


    }
    wx.hideLoading()
  },
 

  //预览图片   
  previewImage: function (e) {
    var current = e.target.dataset.src
    var  showImgUrl=this.data.showImgUrl
    var ptype = e.target.dataset.ptype
    var urls = []
  
    if(ptype=="show"){//顶部图片
      var good = this.data.good
      for (var i in good.picurl) { 
        urls.push(showImgUrl+good.picurl[i])
      }
    }else{//评论图片
      
    }
   
    //console.log(urls)
    wx.previewImage({
      current: showImgUrl+current,
      urls: urls
    })
  },
  

})