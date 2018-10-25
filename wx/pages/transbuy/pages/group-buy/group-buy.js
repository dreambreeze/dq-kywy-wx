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
    //项目搜索
    search = !options.search ? '' : options.search;
    this.setData({
      search: search
    });

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    common.getProject(app.globalData.authorizerId, '', '', search).then(function (data) {
      let storeProjectArr = data.info;
      wx.hideLoading();
      if (storeProjectArr.length > 0) {
        //定位最近的排在上面
        if (storeProjectArr.length > 1) {
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
   * 跳转至门店详情页
   */
  goProjectStore: function (e) {
    //如果存在搜索项目，不允许进入项目门店页
    if (search) {
      return false;
    }

    let nodeid = e.currentTarget.dataset.nodeid;

    if (!nodeid) {
      wx.showModal({
        title: '提示',
        content: '门店标识不存在',
        showCancel: false
      });
      return false;
    }

    wx.navigateTo({
      url: '../project-store/project-store?nodeid=' + nodeid,
    })
  }

})