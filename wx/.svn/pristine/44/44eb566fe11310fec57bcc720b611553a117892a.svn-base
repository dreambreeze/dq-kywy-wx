var common = require('../../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifySeleted: 1,
    goods: {},
    goodsList: [{}],
    showImgUrl1:"",

  },

  onLoad:function(){
    wx.showLoading({
      title: '',
    })
    var that = this
    var host = common.config.host
    wx.request({
      url: host + "/minashop/mina/shopcategory",
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        that.setData({
          goods: res.data.category,
          goodsList: res.data.column,
          showImgUrl: common.config.showImgUrl,
          navTabBar:wx.getStorageSync("shopNav")
        })
        wx.hideLoading()
      }
     
    })
  },
  //滚动

  tapClassify: function (e) {
    var id = e.currentTarget.dataset.id;
  
    //console.log(id);
    // this.setData({
    //   classifyViewed: id
    // });
   // console.log(id);
    var self = this;
    setTimeout(function () {
      self.setData({
        classifySeleted: id
      });
    }, 10);
  },

  //查看所有分类产品
  toall:function(e){
    console.log(e)
    wx.navigateTo({
      url: '../shoptype/shoptype?name=' + e.currentTarget.dataset.name + '&id=' + e.currentTarget.dataset.id,
    })
  },
  //二级分类 
  typedetail:function(e){
    var id = e.currentTarget.dataset.id
    var typeList = this.data.goods
    console.log(typeList[id])
    wx.navigateTo({
      url: '../shoptype/shoptype?name=' + typeList[id].name + '&id=' + typeList[id].id + '&type=cate_id' ,
    })
  },
  //进入搜索界面
  bindfocus:function(){
    wx.navigateTo({
      url: '../shopsearch/shopsearch',
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