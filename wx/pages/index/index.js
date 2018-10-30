var common = require('../../common.js');
var app = getApp();
var navArr = '';
var homeArr = '';
//首页顶部门店banner图
var banner = [];
//门店节点标识
let ShopNo = '';
//房号
let RoomNo = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: banner,
    maskDisplay: 'none',
    couponmaskDisplay: 'hidden',
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //导航tabBar
    navTabBar: common.config.navTabBar,
    //功能模块加载中
    info: '加载中...',
    indicatorDots: false,
    autoplay: true,
    interval: 2500,
    duration: 500,
    selected: 1,
    bannerList:[
      {
        "staffworkno": "1",
            "picurl": '../../images/index_banner@2x.png',
      },
      {
        "staffworkno": "2",
          "picurl": '../../images/index_banner@2x.png',
      },
      {
        "staffworkno": "3",
          "picurl": '../../images/index_banner@2x.png',
      }
    ],
    data:{}
  },
  bindchange: function (e) {
    this.setData({
      selected: e.detail.currentItemId
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //加载小程序标题
    common.getAppletInfo(app.globalData.authorizerId).then(function(data) {
      wx.setNavigationBarTitle({
        title: data.info.nick_name,
      });

    }).catch(function(data) {
      wx.setNavigationBarTitle({
        title: '',
      });
    });

    //开启 sharetickets
    wx.showShareMenu({
      withShareTicket: true
    });

    let _this = this;

    //扫描门店房间二维码记录门店标识与房号

    let sceneStr = decodeURIComponent(options.scene);

    if (sceneStr != 'undefined') {
      let sceneArr = sceneStr.split('@');
      ShopNo = sceneArr[0].split('=')[1];
      RoomNo = sceneArr[1].split('=')[1];
      //门店房号数据存储在本地
      wx.setStorageSync('ShopNoRoomNo', sceneStr);
    }

    //获取本地storage保存的openid
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function(data) {
        openid = data
        //检查是否有可发的券
        common.haveCoupons(app.globalData.authorizerId, openid).then(function(data) {
          console.log(data)
          if (data.status == 1) {
            _this.setData({
              has: data.has,
              couponmaskDisplay: 'visiable',
            })
          } else {
            _this.setData({
              couponmaskDisplay: 'hidden',
            });
          }
        }).catch(function(data) {
          console.log(data)
          _this.setData({
            couponmaskDisplay: 'hidden',
          })
        })
        common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function(data) {
          wx.hideLoading();
          wx.setStorageSync("phoneinfo", data.info)
        }).catch(function(data) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: data,
            showCancel: false
          });
        });
      }).catch(function(data) {
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    } else {
      common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function(data) {
        wx.hideLoading();

        wx.setStorageSync("phoneinfo", data.info)

        //检查是否有可发的券
        common.haveCoupons(app.globalData.authorizerId, openid).then(function(data) {
          console.log(data)
          if (data.status == 1) {
            _this.setData({
              has: data.has,
              couponmaskDisplay: 'visiable',
            })
          } else {
            _this.setData({
              couponmaskDisplay: 'hidden',
            });
          }
        }).catch(function(data) {
          console.log(data)
          _this.setData({
            couponmaskDisplay: 'hidden',
          })
        })
      }).catch(function(data) {

        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data.message ? data.message : data,
          showCancel: false
        });
      });
    }





    //自动屏幕高
    var query = wx.createSelectorQuery();
    var minHeight = 0;

    query.selectViewport().boundingClientRect(function(rect) {
      minHeight = rect.height;
    }).exec(function() {
      _this.setData({
        minHeight: minHeight + 'px'
      });
    });

    //获取门店banner图
    banner = [];
    wx.request({
      url: common.config.host + '/index.php/Api/Base/getStores',
      data: {
        'authorizerId': app.globalData.authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1) {
          for (let i = 0; i < res.data.info.length; i++) {
            if (res.data.info[i].store_img != '') {
              var store_img = res.data.info[i].store_img.split(',');
              for (let j = 0; j < store_img.length; j++) {
                banner.push(common.config.showImgUrl + store_img[j]);
              }
            }
          }

          if (banner.length == 0) {
            banner.push(common.config.bannerImg);
          }

          _this.setData({
            banner: banner
          });
        } else {
          _this.setData({
            banner: [common.config.bannerImg]
          });
        }
      },
      fail: function(res) {
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

    //加载呼叫服务内容
    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/getCallservice',
      data: {
        'authorizerId': app.globalData.authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            _this.setData({
              callService: res.data.info
            });
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.info,
              showCancel: false
            });
          }

        } else {
          wx.showModal({
            title: '提示',
            content: '请求错误',
            showCancel: false
          });
        }
      },
      fail: function(res) {
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

    //检查是否有权限使用
    common.isExpiredTime(app.globalData.authorizerId).catch(function() {
      wx.reLaunch({
        url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=小程序使用权限已过期&notJump=1',
      });
    });




    //检查是否已发券 
    // common.sendCoupons(app.globalData.authorizerId,openid).catch(){
    // }
  },

  /**
   * 监听页面分享  单聊不可获取shareTickets   群聊可以
   */
  onShareAppMessage: function(options) {
    let that = this;
    var sharefrom = options.from
    let title = that.data.title ? that.data.title : ""
    if (sharefrom == "menu") { //button：页面内转发按钮；menu：右上角转发菜单
      sharefrom = "menu"
    } else {
      sharefrom = "button"
    }
    var shareObj = new Object

    shareObj = {
      title: title,
      url: "pages/index/index",
      success: function(res) {

        if (res.shareTickets) { //群聊
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success: function(res) {
              console.log(res)
            },
            fail: function(res) {
              console.log(res)
            },
            complete: function(res) {}
          })
        } else { //单聊
          //
        }

        wx.showLoading({
          title: '加载中',
          mask: true
        });

        //用户openid
        let openid = wx.getStorageSync('openid');

        common.getShareCoupon(app.globalData.authorizerId, openid).then(function(data) {
          wx.hideLoading();

          wx.showModal({
            title: '提示',
            content: "恭喜您分享获得优惠券，可去我的券包查看",
            showCancel: false
          });
        }).catch(function(data) {
          wx.hideLoading();
          // wx.showModal({
          //   title: '提示',
          //   content: data,
          //   showCancel: false
          // });
        });
      },
      fail: function() {
        wx.showToast({
          icon: 'none',
          title: '您取消了分享',
        })

      },
    }

    return shareObj
  },
  /**
   * 点击显示呼叫服务
   */
  showService: function() {
    this.setData({
      maskDisplay: 'block',
      donaldshowIn: 'donaldshowIn',
      donaldconshowIn: 'donaldconshowIn'
    });
  },
  /**
   * 点击隐藏呼叫服务
   */
  hideService: function() {
    this.setData({
      maskDisplay: 'none',
      donaldshowIn: 'donaldshowOut',
      donaldconshowIn: 'donaldconshowOut'
    });
  },
  /**
   * 点击底部导航
   */
  enginNav: function(e) {
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
  /**
   * 技术支持跳转
   */
  jishuzhichi: function() {
    common.jishuzhichi();
  },

  /**
   * 受理呼叫服务
   */
  serveracceptance: function(e) {
    let _this = this;
    //门店与房间号是否存在
    let sceneStr = wx.getStorageSync('ShopNoRoomNo');
    if (!sceneStr) {
      wx.showModal({
        title: '提示',
        content: '门店标识与房号不存在，请扫描桌面二维码',
        showCancel: true,
        success: function(re) {
          if (re.confirm) {
            wx.scanCode({
              onlyFromCamera: true,
              success: function(res) {

                if (res.path) {
                  try {
                    wx.reLaunch({
                      url: '/' + res.path,
                    });
                  } catch (e) {
                    wx.showModal({
                      title: '提示',
                      content: '获取地址失败，无法跳转',
                      showCancel: false
                    });
                  }
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '获取地址失败，无法跳转',
                    showCancel: false
                  });
                }
              },
              fail: function(res) {
                wx.showModal({
                  title: '提示',
                  content: '调起客户端扫码界面失败',
                  showCancel: false
                })
              }
            });
          }
        }
      });
      return false;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    let sceneArr = sceneStr.split('@');
    ShopNo = sceneArr[0].split('=')[1];
    RoomNo = sceneArr[1].split('=')[1];

    //服务名称
    let voiceName = e.currentTarget.dataset.voice;

    //获取手机设备信息
    let systemInfo = '';
    try {
      let res = wx.getSystemInfoSync();
      systemInfo = res.model;
    } catch (e) {
      systemInfo = '未知（获取失败）'
    }

    //获取openid
    let openid = wx.getStorageSync('openid');

    //下服务
    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/serveracceptance',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'ShopNo': ShopNo,
        'RoomNo': RoomNo,
        'voiceName': voiceName,
        'systemInfo': systemInfo,
        'openid': openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode == 200) {
          wx.hideLoading();
          if (res.data.status == 1) {
            wx.showModal({
              title: '提示',
              content: '您呼叫的服务已受理成功，请稍等',
              showCancel: false,
              success: function(r) {
                if (r.confirm) {
                  _this.setData({
                    maskDisplay: 'none',
                    donaldshowIn: 'donaldshowOut',
                    donaldconshowIn: 'donaldconshowOut'
                  });
                }
              }
            });
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.info,
              showCancel: false
            });
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败',
            showCancel: false
          });
        }
      },
      fail: function(res) {
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

  },

  /**
   * 监听页面显示
   */
  onShow: function() {
    let _this = this;
    //加载首页后台分配的功能模块
    let fid = common.config.navTabBar[0].id;
    let homeNav = wx.getStorageSync('homeNav');
    if (homeNav) {
      _this.setData({
        fmodule: homeNav,
        info: ''
      });
    } else {
      common.getFunction(fid, app.globalData.authorizerId, 1).then(function(data) {
        wx.setStorageSync('homeNav', data.info);
        _this.setData({
          fmodule: data.info,
          info: ''
        });
      }).catch(function(data) {
        _this.setData({
          fmodule: false,
          info: data
        });
      });
    }

    var test = wx.getStorageSync('test');
    if (test) {
      wx.navigateTo({
        url: '/pages/reserve/pages/reserve-project/reserve-project',
        success: function() {
          wx.removeStorageSync('test');
        }
      });
    }



  },

  /**
   * 页面跳转
   */
  jumpPage: function(e) {
    let url = e.currentTarget.dataset.url;
    let opened = e.currentTarget.dataset.opened;
    let funname = e.currentTarget.dataset.funname;
    //是否开通
    if (opened == 0) {
      wx.showModal({
        title: '提示',
        content: '功能暂未开通',
        showCancel: false
      });
      return false;
    }


    //是否呼叫服务
    if (funname == '呼叫服务') {
      let ShopNoRoomNo = wx.getStorageSync('ShopNoRoomNo');
      if (!ShopNoRoomNo) {
        wx.showModal({
          title: '提示',
          content: '门店标识与房号不存在，请扫描桌面二维码',
          showCancel: true,
          success: function(re) {
            if (re.confirm) {
              wx.scanCode({
                onlyFromCamera: true,
                success: function(res) {
                  if (res.path) {
                    try {
                      wx.reLaunch({
                        url: '/' + res.path,
                      });
                    } catch (e) {
                      wx.showModal({
                        title: '提示',
                        content: '获取地址失败，无法跳转',
                        showCancel: false
                      });
                    }
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '获取地址失败，无法跳转',
                      showCancel: false
                    });
                  }
                },
                fail: function(res) {
                  wx.showModal({
                    title: '提示',
                    content: '调起客户端扫码界面失败',
                    showCancel: false
                  })
                }
              });
            }
          }
        });

      } else {
        this.setData({
          maskDisplay: 'block',
          donaldshowIn: 'donaldshowIn',
          donaldconshowIn: 'donaldconshowIn'
        });
      }
    } else if (funname == '预约理疗师' || funname == '预约房间') {

      var appid = app.globalData.authorizerId
      //华天富足人生特殊需求，wx03d70af5b6faa4ac 后台设置 是否开启判别会员服务（在门店有会员卡）

      var phone = wx.getStorageSync('phoneinfo').phone
      if (appid && phone) {
        common.isVip(appid, phone).then(function(data) {
          if (data.status == 0) {
            if (!url) {
              return false;
            }

            wx.navigateTo({
              url: url,
            });
          } else {

            wx.showModal({
              title: '提示',
              content: '未查询到您的会员卡，请前往会员中心办理会员卡',
              showCancel: false
            })
            return false;
          }
        }).catch(function(data) {
          console.log(data)

        });
      } else {
        wx.showToast({
          icon: 'none',
          title: '未获取到手机号码，请稍候重试~',
        })
        return false;
      }
    } else {
      if (!url) {
        return false;
      }
      wx.navigateTo({
        url: url,
      });
    }
  },

  /**
   * 点击隐藏领券
   */
  hidecouponmask: function() {
    this.setData({
      couponmaskDisplay: 'hidden',
    });
  },
  //点击领券
  sendcoupon() {
    var that = this
    var openid = wx.getStorageSync('openid')
    var has = that.data.has
    common.sendCoupon(app.globalData.authorizerId, openid, has).then(function(data) {
      console.log(data)
      if (data.status == 1) {
        wx.showModal({
          title: '提示',
          content: '恭喜您获得了优惠券，可去我的券包查看',
          showCancel: false
        })
      }
      that.setData({
        couponmaskDisplay: 'hidden',
      });
    }).catch(function(data) {
      console.log(data)
      that.setData({
        couponmaskDisplay: 'hidden',
      });
    });
  }

})