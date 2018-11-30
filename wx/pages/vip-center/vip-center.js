var common = require('../../common.js');
//获取应用实例
const app = getApp();
//会员卡数据
var cmArr = [];

var CardSwiperItem = 0;
//当前卡的上一张卡
let prevCardSwiperItem = 0;
//当前卡的下一张卡
let nextCardSwiperItem = 1;

Page({
  data: {
    //顶部会员卡数据
    cardUrls: {
      info: []
    },
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 200,
    balance: 0,
    cardIdx: 0,
    funClassName: '',
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //主机域名
    host: common.config.host,
    //无会员卡图片的默认会员卡图
    cardPicUrl: common.config.cardPicUrl,
    //导航tabBar
    navTabBar: common.config.navTabBar,
    //功能模块加载中
    info: '加载中...',
    nextCardSwiperItem: nextCardSwiperItem,
    //会员操作
    handList: [{
      url: "../component/pages/recharge/recharge",
      name: "会员充值",
      src: '../../images/vip-recharge_icon@2x.png',
      title: "会员充值"
    }, {
      url: "../component/pages/cardtrans/cardtrans",
      name: "会员卡转赠",
      src: '../../images/vip-transfer_icon@2x.png',
      title: "会员转赠"
    }, {
      url: "../component/pages/transrecord/transrecord",
      name: "转赠记录",
      src: '../../images/vip-record_icon@2x.png',
      title: "转赠记录"
    }, {
      url: "../component/pages/lqgiftcard/lqgiftcard",
      name: "领取转赠卡",
      src: '../../images/receive_icon@2x.png',
      title: "领取转赠"
    }],
    discountList: [{
      url: "../component/pages/now-docard/now-docard",
      name: "会员充值",
      discount: "7.5折",
      money: '送3200元',
      free: "送3200元",
    }, {
      url: "../component/pages/recharge/recharge",
      name: "会员充值",
      discount: "7.7折",
      money: '充值5000元',
      free: "送1500元",
    }, {
      url: "../component/pages/recharge/recharge",
      name: "会员充值",
      discount: "7.9折",
      money: '充值3000元',
      free: "送800元",
    }],


    bannerList: [{
        "staffworkno": "1",
        "picurl": '../../images/vip-banner-card@2x.png',
        "typeName": '电疗卡',
      },
      {
        "staffworkno": "2",
        "picurl": '../../images/vip-banner-card@2x.png',
        "typeName": '贵宾卡',
      },
      {
        "staffworkno": "3",
        "picurl": '../../images/vip-banner-card@2x.png',
        "typeName": '会员卡',
      },
      {
        "staffworkno": "4",
        "picurl": '../../images/vip-banner-card@2x.png',
        "typeName": '储值卡',
      },
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 2500,
    duration: 500,
    selected: 1,
  },

  //监听下拉刷新
  onPullDownRefresh: function() {
    var _this = this;
    _this.getVipCard();

    let openid = wx.getStorageSync('openid');
    //查询当前用户是否有转赠卡未领取
    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/statisReceived',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'openid': openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode == 200) {
          _this.setData({
            isReceived: res.data.info
          });
        } else {
          _this.setData({
            isReceived: false
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

    wx.stopPullDownRefresh();
  },


  /**
   * 页面加载事件
   */
  onLoad: function() {
    CardSwiperItem = 0;
    prevCardSwiperItem = 0;
    nextCardSwiperItem = 1;
    //开启 sharetickets
    wx.showShareMenu({
      withShareTicket: true
    })

    var _this = this;

    var openid = wx.getStorageSync('openid');

    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function(data) {
        openid = data;
        //获取当前用户会员卡信息
        _this.getVipCard();
        //查询当前用户是否有转赠卡未领取
        wx.request({
          url: common.config.host + '/index.php/Api/Requestdata/statisReceived',
          data: {
            'authorizerId': app.globalData.authorizerId,
            'openid': openid
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            if (res.statusCode == 200) {
              _this.setData({
                isReceived: res.data.info
              });
            } else {
              _this.setData({
                isReceived: false
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
      }).catch(function(data) {
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    } else {
      //获取当前用户会员卡信息
      _this.getVipCard();
      //查询当前用户是否有转赠卡未领取
      wx.request({
        url: common.config.host + '/index.php/Api/Requestdata/statisReceived',
        data: {
          'authorizerId': app.globalData.authorizerId,
          'openid': openid
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          if (res.statusCode == 200) {
            _this.setData({
              isReceived: res.data.info
            });
          } else {
            _this.setData({
              isReceived: false
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
    }

    //检查是否有权限使用
    common.isExpiredTime(app.globalData.authorizerId).catch(function() {
      wx.reLaunch({
        url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=小程序使用权限已过期&notJump=1',
      });
    });
  },

  /**
   * 页面显示事件
   */
  onShow: function() {
    let _this = this;
    //加载会员中心后台分配的功能模块
    let fid = common.config.navTabBar[1].id;
    let vipNav = wx.getStorageSync('vipNav');
    if (vipNav) {
      _this.setData({
        fmodule: vipNav,
        info: ''
      });
    } else {
      common.getFunction(fid, app.globalData.authorizerId, 1).then(function(data) {
        wx.setStorageSync('vipNav', data.info);
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
   * 获取当前用户所有会员卡和绑定的手机号
   */

  getVipCard: function() {
    var openid = wx.getStorageSync('openid'),
      _this = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function(data) {
        openid = data;
        //请求会员卡和绑定的手机号
        wx.request({
          url: common.config.host + '/index.php/Api/Base/getVipCard',
          data: {
            'authorizerId': app.globalData.authorizerId,
            'openid': openid,
            'type': 2
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            wx.hideLoading();
            if (res.statusCode == 200) {
              if (res.data.status == 1) {
                cmArr = res.data.info;
                if (cmArr.length > 0) {
                  _this.setData({
                    cardUrls: res.data,
                    balance: cmArr ? (parseFloat(cmArr[CardSwiperItem].CardNum) + parseFloat(cmArr[CardSwiperItem].SendNum)).toFixed(0) : 0
                  });
                }
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
                content: '请求失败，服务器错误',
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
      }).catch(function(data) {
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    } else {
      //请求会员卡和绑定的手机号
      wx.request({
        url: common.config.host + '/index.php/Api/Base/getVipCard',
        data: {
          'authorizerId': app.globalData.authorizerId,
          'openid': openid,
          'type': 2
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          wx.hideLoading();
          if (res.statusCode == 200) {
            if (res.data.status == 1) {
              cmArr = res.data.info;
              if (cmArr.length > 0) {
                _this.setData({
                  cardUrls: res.data,
                  balance: cmArr ? (parseFloat(cmArr[CardSwiperItem].CardNum) + parseFloat(cmArr[CardSwiperItem].SendNum)).toFixed(0) : 0
                });
              }
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
              content: '请求失败，服务器错误',
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
    }
  },

  //监听滑动顶部会员卡事件
  topCardChange: function(e) {
    CardSwiperItem = e.detail.current;
    nextCardSwiperItem = (CardSwiperItem + 1);
    prevCardSwiperItem = (CardSwiperItem - 1);
    this.setData({
      balance: (parseFloat(cmArr[e.detail.current].CardNum) + parseFloat(cmArr[e.detail.current].SendNum)).toFixed(0),
      cardIdx: CardSwiperItem,
      nextCardSwiperItem: nextCardSwiperItem,
      prevCardSwiperItem: prevCardSwiperItem
    });
  },

  //页面跳转
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

    if (funname && funname == '会员结账') {
      wx.scanCode({
        onlyFromCamera: true,
        success: function(res) {
          if (res.path) {
            try {
              wx.navigateTo({
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
        }
      });
    } else if (url) {
      wx.navigateTo({
        url: url,
      });
    }

  },
  bindchange: function(e) {
    this.setData({
      selected: e.detail.currentItemId
    })
  },
  /**
   * 监听页面分享  单聊不可获取shareTickets   群聊可以
   */
  onShareAppMessage: function(options) {
    let that = this;
    var sharefrom = options.from
    if (sharefrom == "menu") { //button：页面内转发按钮；menu：右上角转发菜单
      sharefrom = "menu"
    } else {
      sharefrom = "button"
    }
    var shareObj = new Object

    shareObj = {
      title: '客源无忧微信营销平台',
      url: "pages/index/index",
      success: function(res) {
        console.log(res)
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
          wx.showModal({
            title: '提示',
            content: data,
            showCancel: false
          });
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

});