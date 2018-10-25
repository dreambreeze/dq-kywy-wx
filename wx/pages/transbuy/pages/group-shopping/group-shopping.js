let app = getApp();
let common = require('../../../../common.js');

let storesortTime = null;
//项目搜索内容
let search = '';
Page({

  /** 
   * 页面的初始数据
   */
  data: {
    showImgUrl: common.config.showImgUrl,
    projectState: '加载中...'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //检查功能是否开启
    let promotions = wx.getStorageSync('promotions');
    if (promotions) {
      common.checkFunOpened(promotions, 6);
    }

    let _this = this;
   

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    common.getGroupShopping(app.globalData.authorizerId, '', '','','','','').then(function (data) {
      let storeProjectArr = data.info;
      console.log(storeProjectArr)
      wx.hideLoading();
      if (storeProjectArr.length > 0) {
        //定位最近的排在上面
        if (storeProjectArr.length > 0) {
          var k = [];
          //计算门店距离
          for (let i = 0; i < storeProjectArr.length; i++) {
            common.geocoder(storeProjectArr[i].address).then(function (data) {
              common.calculateDistance([data]).then(function (data) {
                storeProjectArr[i]['distance'] = data;
                k.push(1);
              }).catch(function (data) {
                storeProjectArr[i]['distance'] = '未知';
                k.push(2);
              });
            }).catch(function (data) {
              storeProjectArr[i]['distance'] = '未知';
              k.push(3);
            });
          }

          //定时检查定位计算距离是否有返回，已返回清除定时器
          clearInterval(storesortTime);
          storesortTime = setInterval(function () {
            if (k.length == storeProjectArr.length) {
              clearInterval(storesortTime);
              wx.hideLoading();
              //以距离最近的门店排序
              let projectArr = storeProjectArr.sort(common.compare('distance'));

              _this.setData({
                storeProject: storeProjectArr
              });
            }
          }, 1200);
        } else {
          _this.setData({
            storeProject: storeProjectArr
          });
        }
      } else {
        _this.setData({
          projectState: '无项目内容'
        });
      }

    }).catch(function (data) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });

      _this.setData({
        projectState: '无项目内容'
      });
    });
  },

  /**
   * 跳转至详情页
   */
  todetail: function (e) {
    let pid = e.currentTarget.dataset.pid
    let nodeid = e.currentTarget.dataset.nodeid
    wx.navigateTo({
      url: '../group-detail/group-detail?pid=' + pid + '&nodeid=' + nodeid,
    })
  },

  //我的订单
  tomyorder(){
    wx.navigateTo({
      url: '../group-order/group-order',
    })
  },

  onPullDownRefresh() {
    var _this = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    common.getGroupShopping(app.globalData.authorizerId, '', '', '', '', '', '').then(function (data) {
      let storeProjectArr = data.info;
      console.log(storeProjectArr)
      wx.hideLoading();
      if (storeProjectArr.length > 0) {
        //定位最近的排在上面
        if (storeProjectArr.length > 0) {
          var k = [];
          //计算门店距离
          for (let i = 0; i < storeProjectArr.length; i++) {
            common.geocoder(storeProjectArr[i].address).then(function (data) {
              common.calculateDistance([data]).then(function (data) {
                storeProjectArr[i]['distance'] = data;
                k.push(1);
              }).catch(function (data) {
                storeProjectArr[i]['distance'] = '未知';
                k.push(2);
              });
            }).catch(function (data) {
              storeProjectArr[i]['distance'] = '未知';
              k.push(3);
            });
          }

          //定时检查定位计算距离是否有返回，已返回清除定时器
          clearInterval(storesortTime);
          storesortTime = setInterval(function () {
            if (k.length == storeProjectArr.length) {
              clearInterval(storesortTime);
              wx.hideLoading();
              //以距离最近的门店排序
              let projectArr = storeProjectArr.sort(common.compare('distance'));

              _this.setData({
                storeProject: storeProjectArr
              });
            }
          }, 1200);
        } else {
          _this.setData({
            storeProject: storeProjectArr
          });
        }
      } else {
        _this.setData({
          projectState: '无项目内容'
        });
      }
      wx.hideNavigationBarLoading() //停止导航栏下拉刷新
    }).catch(function (data) {
      wx.hideNavigationBarLoading() //停止导航栏下拉刷新
     
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });

      _this.setData({
        projectState: '无项目内容'
      });
    });
  
    wx.stopPullDownRefresh() //停止下拉刷新
  　},

})