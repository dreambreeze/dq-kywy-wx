// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../../pages/common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();
var downX = 0;
var oUlLeft = 0;
var roomPeopleNumW = 0;
var roomPeopleTouchW = 0;
var leftval = 0;

//需要计算的距离纬度经度
var latLng = [];
//所有门店信息
let stores;
//定时执行时间
var timer = null;
//所有项目
var proData;
//当前第几页
var currPage = 1;
//多少条
var totalPage = 8;
//加载状态
var loadState = true;

//需要定位的门店
var locationStore = [];
//项目分类ID
var ptypeIdx = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    maskDisplay: 'none',
    //项目数据
    proData: proData,
    //项目分类拖拽初始left值
    roomPLeft: 0,
    //项目分类初始选中全部
    ptypeIdx: ptypeIdx,
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无项目图片的默认项目图
    projectImg: common.config.projectImg,
    //上拉加载更多的文本提示
    loadMtext: '',
    //所有项目分类
    serCategory: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: common.config.QQMapWXKey
    });

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //定位缓存大于1小时就删除缓存
    var currStoreCache = wx.getStorageSync('currentReserveStore');

    if (currStoreCache) {
      var currTime = new Date().getTime() - 3600000;
      if (currStoreCache[0].cache < currTime) {
        wx.removeStorageSync('currentReserveStore');
      }
    }

    proData = [];

    //分页从1开始
    currPage = 1;
    //项目分类默认查询所有
    ptypeIdx = 0;
    //重新开启上拉加载
    loadState = true;

    this.setData({
      ptypeIdx: ptypeIdx
    });
    
    locationStore = wx.getStorageSync('currentReserveStore');
    new Promise(function (resolve, reject) {
      
      if (locationStore) {
        _this.setData({
          locationStore: locationStore,
          nodeid: locationStore[0].nodeid
        });
        resolve(1);
      } else {
        _this.getStores().then(
          function (data) {
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            //获取定位
            new Promise(function (resolve, reject) {
              locationStore = [];
              for (let i = 0; i < stores.length; i++) {
                var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;
                var lalo = new Object
                common.geocoder(address).then(function (loca) {
                  var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;
                  lalo = [];
                  lalo.push(loca)
                  common.calculateDistance(lalo).then(function (distance) {
                    locationStore.push({
                      'store_name': stores[i].store_name,
                      'address': address == '' ? '未设置地址' : address,
                      'tel': stores[i].tel,
                      'distance': (distance / 1000).toFixed(2) + 'km',
                      'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                      'nodeid': stores[i].request_id
                    });
                    resolve(locationStore);
                  }).catch(function (res) {
                    locationStore.push({
                      'store_name': stores[i].store_name,
                      'address': address == '' ? '未设置地址' : address,
                      'tel': stores[i].tel,
                      'distance': '未知',
                      'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                      'nodeid': stores[i].request_id
                    });
                    resolve(locationStore);
                  })
                }).catch(function (res) {
                  locationStore.push({
                    'store_name': stores[i].store_name,
                    'address': address == '' ? '未设置地址' : address,
                    'tel': stores[i].tel,
                    'distance': '未知',
                    'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                    'nodeid': stores[i].request_id
                  });
                  resolve(locationStore);
                })
              }
            }).then(function (data) {
              clearTimeout(timer);
              timer = setTimeout(function () {
                locationStore.sort(function (obj1, obj2) {
                  var val1 = obj1.distance == '未知' ? '9999999' : obj1.distance
                  var val2 = obj2.distance == '未知' ? '9999999' : obj2.distance
                  if (val1 < val2) {
                    return -1;
                  } else if (val1 > val2) {
                    return 1;
                  } else {
                    return 0;
                  }
                });

                //赠加缓存时间
                for (let i = 0; i < locationStore.length; i++) {
                  locationStore[i]['cache'] = new Date().getTime();
                }

                wx.setStorageSync('currentReserveStore', locationStore);
                _this.setData({
                  locationStore: locationStore,
                  nodeid: locationStore[0].nodeid
                });
                resolve(1);
              }, 1000);
            });
            wx.hideLoading()
          }
        ).catch(function (reason) {
          wx.showModal({
            title: '提示',
            content: '获取门店信息失败',
            showCancel: false
          });
          reject(0);
        });
      }
    }).then(function () {
      //获取所有项目信息
      common.getProjectInfo(app.globalData.authorizerId, locationStore[0].nodeid, currPage, totalPage, 0, ptypeIdx).then(function (data) {
        wx.hideLoading();
        proData = data;
        //重新开启上拉加载
        if (data.length < totalPage) {
          loadState = false;
          _this.setData({
            proData: data,
            loadMtext: '无更多项目'
          });
        } else {
          loadState = true;
           _this.setData({
            proData: data,
            loadMtext: '上拉加载更多'
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
          proData: [],
          loadMtext: data
        });
      });

      //获取项目分类
      new Promise(function (resolve, reject) {
        wx.request({
          url: common.config.host + '/index.php/Api/Requestdata/getSerCategory',
          data: {
            'authorizerId': app.globalData.authorizerId,
            'ShopNo': locationStore[0].nodeid
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            //返回成功
            if (res.statusCode == 200) {
              if (res.data.status == 1) {
                resolve(res.data.info);
              } else {
                reject(1);
              }
            } else {
              reject(1);
            }
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
                content: '请求失败',
                showCancel: false
              });
            }
          }
        });
      }).then(function (data) {
        _this.setData({
          serCategory: data
        });

        var query = wx.createSelectorQuery();
        query.select('.category-project').boundingClientRect(function (rect) {
          if (rect) {
            roomPeopleNumW = rect.width;
          }
        }).exec();

        query.select('.room-people-touch').boundingClientRect(function (rect) {
          if (rect) {
            roomPeopleTouchW = rect.width;
          }
        }).exec();
      });

    });
    wx.hideLoading()
  },

  /**
   * 跳转至项目详情页
   */

  navigatordetail: function (ev) {
    var that = this
    var id = ev.currentTarget.dataset.idx;
    var index = ev.currentTarget.dataset.index;
    var proData = that.data.proData
    wx.setStorageSync("proData", proData)
    wx.navigateTo({
      url: '../project-detail/project-detail?id=' + id+'&index='+index,
    })
  },

  /**
   * 点击跳转项目搜索页
   */
  toSearchProject: function () {
    wx.navigateTo({
      url: '../search-project/search-project',
    });
  },
  /**
   * 点击立即预约显示选择时间
   */
  reserveBtnTime: function () {
    this.setData({
      showSelectTime: 'showIn',
      maskDisplay: 'block'
    });
  },
  /**
   * 点击跳转至选择门店
   */
  changeStoreBtn: function () {
    wx.redirectTo({
      url: '../select-store/select-store?type=3',
    });
  },
  /**
   * 预约table选项卡导航跳转
   */
  onlineReserevTabJump: function (ev) {
    wx.redirectTo({
      url: ev.currentTarget.dataset.url,
    });
  },

  /**
   * 监听页面显示事件
   */
  onShow: function () {
    var projectStorage = wx.getStorageSync('projectStorage');
    if (projectStorage !== '') {
      this.setData({
        iconHide: 'display:block',
        reserveBtnHide: 'display:none',
        hideIdx: projectStorage
      });
    }
  },

  /**
   * 上位加载更多项目
   */
  onReachBottom: function () {
    var _this = this;
    if (loadState) {
      loadState = false;
      _this.setData({
        loadMtext: '加载中...'
      });

      wx.showLoading({
        title: '加载中...',
        mask: true
      });

      currPage++;
      //获取所有项目信息
      common.getProjectInfo(app.globalData.authorizerId, locationStore[0].nodeid, currPage, totalPage, ptypeIdx).then(function (data) {
        wx.hideLoading();
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            proData.push(data[i]);
          }
          if (data.length < totalPage){
            loadState = false;
            _this.setData({
              proData: proData,
              loadMtext: '无更多项目'
            });
          }else{
            loadState = true;
            _this.setData({
              proData: proData,
              loadMtext: '上拉加载更多'
            });
          }
          
        } else {
          loadState = false;
          _this.setData({
            proData: proData,
            loadMtext: '无更多项目'
          });
        }

      }).catch(function (data) {
        loadState = false;
        if (data && typeof data == 'String') {
          wx.showModal({
            title: '提示',
            content: data,
            showCancel: false
          });
        }
        wx.hideLoading();
        _this.setData({
          proData: proData,
          loadMtext: '无更多项目'
        });
      });
    }
  },
  /**
   * 点击切换项目分类
   */
  changePType: function (ev) {
    var _this = this;
    ptypeIdx = ev.currentTarget.dataset.idx;
    
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //获取项目
    currPage = 1;
    proData = [];

    //获取所有项目信息
    common.getProjectInfo(app.globalData.authorizerId, locationStore[0].nodeid, currPage, totalPage,0, ptypeIdx).then(function (data) {
      wx.hideLoading();
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          proData.push(data[i]);
        }

        //重新开启上拉加载
        if (data.length < totalPage) {
          loadState = false;
          _this.setData({
            proData: proData,
            loadMtext: '无更多项目'
          });
        } else {
          loadState = true;
          _this.setData({
            proData: proData,
            loadMtext: '上拉加载更多'
          });
        }
      } else {
        _this.setData({
          proData: proData,
          loadMtext: '无更多项目'
        });
      }

    }).catch(function (data) {
      
      if (data && typeof data == 'string') {
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      }
      
      wx.hideLoading();
      _this.setData({
        proData: proData,
        loadMtext: data
      });
    });

    this.setData({
      ptypeIdx: ptypeIdx
    });
  },

  /**
   * 拨打电话
   */
  phoneCall: function (ev) {
    var phone = ev.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone,
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '未设置电话号码',
        showCancel: false
      });
    }
  },

  /**
   * 地理位置
   */
  location: function () {
    wx.getSetting({
      success(res) {
        wx.showLoading({
          title: '加载中',
          mask: true
        });
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              // 用户已经同意
              qqmapsdk.geocoder({
                address: locationStore[0].address,
                success: function (res) {
                  wx.hideLoading();
                  if (res.status == 0) {
                    wx.openLocation({
                      latitude: res.result.location.lat,
                      longitude: res.result.location.lng,
                      name: locationStore[0].store_name,
                      address: locationStore[0].address
                    });
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '地址解码失败',
                      showCancel: false
                    });
                  }
                },
                fail: function (res) {
                  wx.hideLoading();
                  wx.showModal({
                    title: '提示',
                    content: '地址解码失败',
                    showCancel: false
                  });
                }
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
                          qqmapsdk.geocoder({
                            address: locationStore[0].address,
                            success: function (res) {
                              wx.hideLoading();
                              if (res.status == 0) {
                                wx.openLocation({
                                  latitude: res.result.location.lat,
                                  longitude: res.result.location.lng,
                                  name: locationStore[0].store_name,
                                  address: locationStore[0].address
                                });
                              } else {
                                wx.showModal({
                                  title: '提示',
                                  content: '地址解码失败',
                                  showCancel: false
                                });
                              }
                            },
                            fail: function (res) {
                              wx.hideLoading();
                              wx.showModal({
                                title: '提示',
                                content: '地址解码失败',
                                showCancel: false
                              });
                            }
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
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          qqmapsdk.geocoder({
            address: locationStore[0].address,
            success: function (res) {
              wx.hideLoading();
              if (res.status == 0) {
                wx.openLocation({
                  latitude: res.result.location.lat,
                  longitude: res.result.location.lng,
                  name: locationStore[0].store_name,
                  address: locationStore[0].address
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: '地址解码失败',
                  showCancel: false
                });
              }
            },
            fail: function (res) {
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '地址解码失败',
                showCancel: false
              });
            }
          });
        }
      }
    });
  },

  /**
   * 获取所有门店信息
   */
  getStores: function () {
    var p = new Promise(function (resolve, reject) {
      //获取所有门店信息
      wx.request({
        url: common.config.host + '/index.php/Api/Base/getStores',
        data: {
          'authorizerId': app.globalData.authorizerId,
          'geocoder': 1
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          //返回成功
          if (res.statusCode == 200) {
            if (res.data.status == 1) {
              stores = res.data.info;
              resolve(stores);
            } else {
              reject(res.data.info);
            }

          } else {
            reject('请求失败');
          }
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
              content: '请求失败',
              showCancel: false
            });
          }
        }
      });
    });
    return p;
  },
  


/**
 * 上位加载更多项目
 */
onReachBottom: function () {
    let _this = this;
  let ptypeIdx = _this.data.ptypeIdx
  let nodeid = _this.data.nodeid
  let proData = _this.data.proData
    //获取项目
    if (loadState) {
      currPage++;
      loadState = false;
      _this.setData({
        loadMtext: '加载中...'
      });

        common.getProjectInfo(app.globalData.authorizerId,nodeid, currPage, totalPage, 0, ptypeIdx).then(function (data) {
          wx.hideLoading();
          if (data) {
            for (let i = 0; i < data.length; i++) {
              proData.push(data[i]);
            }
            loadState = true;
            _this.setData({
              proData: proData,
              loadMtext: '上拉加载更多'
            });
          } else {
            loadState = false;
            _this.setData({
              proData: proData,
              loadMtext: '无更多项目'
            });
          }
        }).catch(function (data) {
          wx.hideLoading();
          loadState = false;
          _this.setData({
           
            loadMtext: '无更多项目'
          });
        });
    }
  }
})