let app = getApp();

let common = require('../../../../common.js');

//门店节点标识
let nodeid = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: [],
    showImgUrl: common.config.showImgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    nodeid = options.nodeid;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //获取项目
    common.getProject(app.globalData.authorizerId, nodeid, '').then(function (data) {
      wx.hideLoading();
      let storeProjectArr = data.info;
      if (storeProjectArr) {

        //项目banner图
        let banner = !storeProjectArr[0]['store_img'] ? [common.config.roomDefaultImg] : storeProjectArr[0]['store_img'].split(',');
        if (storeProjectArr[0]['store_img']) {
          banner = banner.map(function (item) {
            return common.config.showImgUrl + item;
          });
        }

        wx.setNavigationBarTitle({
          title: storeProjectArr[0].store_name,
        });

        _this.setData({
          storeProject: storeProjectArr,
          banner: banner
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '无项目内容',
          showCancel: false
        });
      }

    }).catch(function (data) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });
    });

    //获取评价内容
    common.getAssess(app.globalData.authorizerId, nodeid, '', '',0).then(function (data) {
      if (data.info) {
        _this.setData({
          assesData: data.info
        });
      }
    }).catch(function (data) {
    });
  },
  /**
   * 查看全部评论
   */
  lookAllAssess: function () {
    wx.navigateTo({
      url: '../all-assess/all-assess?nodeid=' + nodeid,
    });
  },

  /**
   * 打电话
   */
  callphone: function (e) {
    let tel = e.currentTarget.dataset.tel;
    if (!tel) {
      wx.showModal({
        title: '提示',
        content: '未设置电话',
        showCancel: false
      });
      return false;
    }

    wx.makePhoneCall({
      phoneNumber: tel
    });
  },

  /**
  * 打开小程序地图组件展示地址
  */
  location: function (e) {
    let address = e.currentTarget.dataset.address;
    let sname = e.currentTarget.dataset.sname;

    if (address) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success(res) {
                // 用户已经同意
                common.geocoder(address).then(function (data) {
                  wx.hideLoading();
                  wx.openLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    name: sname,
                    address: address
                  });
                }).catch(function (data) {
                  wx.hideLoading();
                  wx.showModal({
                    title: '提示',
                    content: data,
                    showCancel: false
                  });
                });
              },
              fail: function () {
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '已拒绝使用地理位置，现在去设置允许使用地理位置',
                  success: function (res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success: (res) => {
                          if (res.authSetting['scope.userLocation']) {
                            wx.showLoading({
                              title: '加载中',
                              mask: true
                            });

                            common.geocoder(address).then(function (data) {
                              wx.hideLoading();
                              wx.openLocation({
                                latitude: data.latitude,
                                longitude: data.longitude,
                                name: sname,
                                address: address
                              });
                            }).catch(function (data) {
                              wx.hideLoading();
                              wx.showModal({
                                title: '提示',
                                content: data,
                                showCancel: false
                              });
                            });
                          }
                        }
                      })
                    }
                  }
                });
              }
            });
          } else {
            common.geocoder(address).then(function (data) {
              wx.hideLoading();
              wx.openLocation({
                latitude: data.latitude,
                longitude: data.longitude,
                name: sname,
                address: address
              });
            }).catch(function (data) {
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: data,
                showCancel: false
              });
            });
          }
        }
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '未设置地址',
        showCancel: false
      });
    }
  },

  /**
   * 图片预览
   */
  previewImg: function (e) {
    wx.previewImage({
      urls: e.currentTarget.dataset.urlarr,
      current: e.currentTarget.dataset.currentimg,
    });
  }
})