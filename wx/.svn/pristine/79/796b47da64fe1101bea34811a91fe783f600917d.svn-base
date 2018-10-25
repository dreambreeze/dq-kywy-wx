var app =getApp()
var common = require('../../common.js');
Page({

  data: {
    showCart:true,
    showImgUrl:null,
    cart: {
      count: 0,
      total: 0,
      list: {}
    },
    selectAllStatus:false,
 
    selected:'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/selected.png',
    noselected:"https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/noselected.png",
    selectedList:[1,2],

    payWayList: [
      { id: 1, name: '会员卡支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/mmcard.png' },
      { id: 2, name: '微信支付', pic: 'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/wechat.png' },
    ],
    pwseleted: 0,
    showPayWay: false,
    isLogin:null
  },

  //
  onLoad:function(){
    this.setData({
      showImgUrl1: "",
      navTabBar: wx.getStorageSync("shopNav")
    })
  },
  
//加载购物车数据
  onShow:function(){
    var isLogin= app.globalData.isLogin
    isLogin=true
    this.setData({ isLogin: isLogin})
    if (isLogin){
      var that = this
      var host = common.config.host
      wx.request({
        url: host + "/minashop/mina/shopcart",
        data: { "request": 1, "uid": app.globalData.uid },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          // console.log(res)
          that.dealdata(res, that)
        }
      })
    }else{
       wx.showModal({
            title: '用户未登录',
            content: '如需体验小程序更多权益，请点击确定，前往登录页面授权登录。',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../shoplogin/shoplogin',
                })
              }
            }
          })
    }
   
  },

  //加载数据后的  业务数据计算
  dealdata:function(res,that){
    var selectnum = 0; //已经选择的  为全选做参考
    var selectAllStatus=true
    var cart = that.data.cart
    cart.list = res.data.cartlist
    cart.count =0
    cart.total=0
    if (cart.list.length > 0) {
      for (var j in cart.list) {
        if (cart.list[j].selected) {
          selectnum+=1
          cart.count += cart.list[j].num
          cart.total += cart.list[j].price * cart.list[j].num
        }
      }
      //全选
      selectAllStatus = selectnum == cart.list.length?true:false

      //保留2位小数    微信小程序报错 cart.total.toFixed(2)  cart.total可能是string而不是number  改成下面的就ok了
      cart.total = ((cart.total) * 1.00).toFixed(2)
      that.setData({
        cart: cart,
        showImgUrl: common.config.showImgUrl,
        showCart: true,
        selectAllStatus: selectAllStatus
      })
      //console.log(that.data.cart)
    }
    else {
      that.setData({
        showCart: false,
      })
    }
  },

  //   添加 数量
  tapAddCart: function (e) {
    var index = e.currentTarget.dataset.index;
    var cartitem = this.data.cart.list[index];
    var id=cartitem.id
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopcart",
      data: { "request": 2, "uid": app.globalData.uid,"id":id },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        // console.log(res)
        that.dealdata(res, that)
      }
    })


  },
  //从购物车减去
  tapReduceCart: function (e) {
    // this.reduceCart(e.currentTarget.dataset.id);
    var index = e.currentTarget.dataset.index;
    var cartitem = this.data.cart.list[index];
    var id = cartitem.id
    var num = cartitem.num
    if (num <= 1) {
      wx.showToast({
        icon:"none",
        title: '不能再减了~',
      })
      return false
    }
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopcart",
      data: { "request": 3, "uid": app.globalData.uid, "id": id },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        // console.log(res)
        that.dealdata(res, that)
      }
    })
  },

  deleteItem:function(e){
  var that = this
   wx.showModal({
     content: '确定删除吗？',
     success:function(res){
       if(res.confirm){
        //  console.log(e.currentTarget.dataset.id)
        //  delete that.data.cart.list[e.currentTarget.dataset.id];
        //  console.log(that.data.cart.list)
        //  if (JSON.stringify(that.data.cart.list) == "{}") {
        //    that.setData({
        //      showCart: !that.data.showCart
        //    })
        //  }
        //  that.countCart()
         wx.showToast({
           icon: 'loading',
         })
         var index = e.currentTarget.dataset.index;
         var cartitem = that.data.cart.list[index];
         var id = cartitem.id
         var value = cartitem.selected
         var host = common.config.host
         wx.request({
           url: host + "/minashop/mina/shopcart",
           data: { "request": 4, "uid": app.globalData.uid, "id": id, "field": "status"},
           header: {
             'content-type': 'application/json'
           },
           success: function (res) {
             that.dealdata(res, that)
             wx.hideToast()
           }
         })
       }
     }
   })
  },

  //选择事件
  selectList(e) {
    wx.showToast({
      icon: 'loading',
    })
    var index = e.currentTarget.dataset.index;
    var cartitem = this.data.cart.list[index];
    var id = cartitem.id
    var value = cartitem.selected
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopcart",
      data: { "request": 4, "uid": app.globalData.uid, "id": id, "field": "selected", "value": value },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealdata(res, that)
        wx.hideToast()
      }
    })

  },
  //全选
  selectAll() {
    wx.showToast({
      icon: 'loading',
    })
    var that = this
    var value = that.data.selectAllStatus?0:1
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopcart",
      data: { "request": 5, "uid": app.globalData.uid ,"value":value},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.dealdata(res, that)
        wx.hideToast()
      }
    })
  },

  //去到结算界面
  toshopCommit:function(){
    var list = this.data.cart.list
    var buylist = [];
    for(var j in list){
      if(list[j].selected){
        buylist.push(list[j])
      }
    }
    if (buylist.length>0){
      wx.setStorageSync("buylist", buylist)
      wx.navigateTo({
        url: '../shopcommit/shopcommit',
      })
    }else{
      wx.showToast({
        icon:'none',
        title: '未选择商品~',
      })
    }
  },


  //拉起付款界面----
  showPayWay: function () {
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
  paysubmit: function () {
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
  onPullDownRefresh:function(){

  },
  //空购物车  先去逛逛
  goshoping:function(){
    wx.redirectTo({
      url: '../shopindex/shopindex',
    })
  },

  /**
     * 点击底部导航
     */
  shopNav: function (e) {
    //点击跳转URL
    var url = e.currentTarget.dataset.url;
    //是否允许点击
    let isTo = e.currentTarget.dataset.isto;
    if (!isTo) {
      wx.showModal({
        title: '提示',
        content: '功能开发中，敬请期待',
        showCancel: false
      });
      return false;
    }
    wx.redirectTo({
      url: url,
    });
  },



})