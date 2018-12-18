//项目的主键ID
let pid = '';
//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();
//当前预约的项目
var reserveProject;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: [
      common.config.projectImg
    ],
    maskDisplay: 'none',
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无项目图片的默认项目图
    projectImg: common.config.projectImg
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    var pid = options.id;
    var index = options.index ? options.index:0
    var proData = wx.getStorageSync("proData")
    proData[index].choose = true
    that.setData({
      proData: proData,
      index: index
    })
    wx.setNavigationBarTitle({
      title: proData[index].serviceitemname,
    })
    // var locationStore = wx.getStorageSync('currentReserveStore');
    // var _this = this;
    // //获取所有项目信息
    // common.getProjectInfo(app.globalData.authorizerId, locationStore[0].nodeid, 0, 0, pid).then(function (data) {
    //   wx.hideLoading();
    //   reserveProject = data;
    //   _this.setData({
    //     reserveProject: reserveProject
    //   });
    // }).catch(function (data) {
    //   wx.hideLoading();
    //   wx.showModal({
    //     title: '提示',
    //     content: data,
    //     showCancel: false
    //   });
    // });
    wx.hideLoading()
  },

  //切换项目查看
  bindchange: function (e) {
    var index = e.detail.currentItemId
    var that =this

    var proData = that.data.proData
    for (let i in proData){
      if(i==index){
        proData[i].choose =true 
      }else{
        proData[i].choose = false 
      }
    }
   
    wx.setNavigationBarTitle({
      title: proData[index].serviceitemname,
    })
    that.setData({proData: proData,index:index})
  },
  /**
   * 点击预约按钮
   */
  reserveBtn: function () {
    //wx.setStorageSync('projectStorage', pid);
    wx.navigateBack();
  },
  
  //清除项目详情缓存 es6
  onUnload(){
   // wx.removeStorageSync("proData")
  }
});