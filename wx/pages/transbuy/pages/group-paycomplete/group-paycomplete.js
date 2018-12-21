var common = require('../../../../common.js');
var app = getApp()

var issameone = false //是否同一人
var intype = 1; //默认进入方式是本人进入，2为分享后 参团者进入
Page({
  data: {
    compeleteimg: '/images/order1.jpg',
    isshow: "true",
    whypng: "https://iservice.daqisoft.cn/Public/Home/images/why.png",
  },
  onLoad: function(options) {
    var that = this
    var orderno = options.orderno ? options.orderno : ''
    var groupno = options.groupno
    let nodeid = options.nodeid
    let intype = options.intype ? options.intype : 1
    var buytype = options.buytype ? options.buytype : 3

    // if (nodeid.indexOf("#china") == -1){
    //   nodeid+='#china'
    // }
    let pid = options.pid
    this.setData({
      groupno: groupno,
      orderno: orderno,
      nodeid: nodeid,
      pid: pid,
      intype: intype,
      buytype: buytype
    })

    var openid = wx.getStorageSync('openid')

    common.getGroupShopping(app.globalData.authorizerId, nodeid, pid, '', '', groupno, '').then(function(res) {
      var multiinfo = res.info[0]
      var orders = multiinfo.project[0].orders
      if (!openid) {
        //调用获取openid   判断是否同一人
        common.getLogin(app.globalData.authorizerId).then(function(data) {
          openid = data
          wx.setStorageSync("openid", data)
          for (var j in orders) {
            if (orders[j].openid == openid) {

              issameone = true
              break

            }
          }
          that.setData({
            issameone: issameone
          })

        })
      } else {

        for (var j in orders) {
          if (orders[j].openid == openid) {
            issameone = true
            break;
          }
        }
        that.setData({
          issameone: issameone
        })
      }

      that.setData({
        store: multiinfo,
        project: multiinfo.project[0],

      })

      //项目订单
      let pstatus = buytype == 1 ? 2 : 1
      common.getGroupOrders(app.globalData.authorizerId, '', '', "", "", groupno, pstatus).then(function(data) {
        if (data.status == 1) {
          var ordersData = data.info
          let lux = new Array
          for (var i = 0; i < ordersData[groupno].nums; i++) {
            lux.push(i)
          }
          that.setData({
            mutiple: data.mutiple,
            num: ordersData[groupno].nums,
            ordersData: data.info,
            lux: lux
          })
          that.countDown()
        }
      }).catch(function(data) {
        //处理过期拼团  或满团情况
        if (data === '未查询到拼团订单') {
          wx.showModal({
            title: '提示',
            content: '当前拼团已满团或已过期，点击确定前往开团',
            showCancel: false,
            complete: function(res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '../group-shopping/group-shopping',
                })
              }
            }
          })
        }

      })
    }).catch(function(data) {


    })

    //获取小程序广告
    common.getAppletAd().then(function(data) {
      that.setData({
        ad: data.info
      });
    }).catch(function(data) {
      that.setData({
        ad: false
      });
    });
  },

  toorder: function() {
    var that = this
    var pid = that.data.pid
    var nodeid = that.data.nodeid
    var orderno = that.data.orderno
    wx.navigateTo({
      url: '../group-orderdetail/group-orderdetail?orderno=' + orderno + '&pid=' + pid + '&nodeid=' + nodeid,
    })
  },

  gobuy: function(e) {
    var pid = e.currentTarget.dataset.id
    var nodeid = e.currentTarget.dataset.nodeid
    var groupno = e.currentTarget.dataset.groupno
    var num = this.data.num
    wx.navigateTo({
      url: '../group-commit/group-commit?groupno=' + groupno + '&pid=' + pid + '&buytype=3' + '&num=' + num + '&nodeid=' + nodeid,
    })
  },
  /**
   * 点击广告跳转链接
   */
  jumpAd: function(e) {
    let adurl = e.currentTarget.dataset.adurl;
    if (adurl) {
      common.jishuzhichi(adurl);
    }
  },


  /**
   * 监听页面分享  单聊不可获取shareTickets   群聊可以
   */
  onShareAppMessage: function(options) {
    let that = this;
    that.setData({
      isshow: false
    })
    let groupno = that.data.groupno
    let orderno = that.data.orderno
    let pid = that.data.pid
    let nodeid = that.data.nodeid
    let project = that.data.project
    return {
      title: '邀您￥' + project.groupprice + '来拼' + project.project,
      path: 'pages/transbuy/pages/group-paycomplete/group-paycomplete?groupno=' + groupno + '&pid=' + pid + '&intype=2&nodeid=' + nodeid,
      success: function(res) {
        that.setData({
          isshow: true
        })

      },
      fail: function(res) {
        that.setData({
          isshow: true
        })
      }
    }


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
        that.setData({
          chakan: "查看订单1"
        })
        if (res.shareTickets) { //群聊
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success: function(res) {
            },
            fail: function(res) {
            },
            complete: function(res) {}
          })
        } else { //单聊
          //
        }



      },
      fail: function() {
        that.setData({
          chakan: "查看订单",
          isshow: true
        })
        wx.showToast({
          icon: 'none',
          title: '您取消了分享',
        })
      },
    }

    // return shareObj

  },


  /**
   * 倒计时
   */
  countDown() {
    let that = this;
    let ordersData = that.data.ordersData

    function nowTime() { //时间函数
      for (var i in ordersData) {

        var intDiff = ordersData[i].limittime; //获取数据中的时间戳
        var day = 0,
          hour = 0,
          minute = 0,
          second = 0;
        if (intDiff > 0) { //转换时间
          day = Math.floor(intDiff / (60 * 60 * 24));
          hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
          minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
          second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
          if (hour <= 9) hour = '0' + hour;
          if (minute <= 9) minute = '0' + minute;
          if (second <= 9) second = '0' + second;
          ordersData[i].limittime--;
          var str = hour + ':' + minute + ':' + second

        } else {
          var str = "已结束！";
          //delete ordersData[i]
          //clearInterval(timer);
        }
        ordersData[i].difftime = str; //在数据中添加difftime参数名，把时间放进去
        ordersData = ordersData
      }

      if (ordersData[i].limittime > 0) {
        that.setData({
          ordersData: ordersData
        })
      }

    }

    nowTime();
    var timer = setInterval(nowTime, 1000);

  },

  //去拼团介绍也
  gogroup(e) {
    let nodeid = e.currentTarget.dataset.nodeid
    let pid = e.currentTarget.dataset.id
    wx.redirectTo({
      url: '../group-detail/group-detail?nodeid=' + nodeid + '&pid=' + pid,
    })
  },

  onUnload() {
    wx.removeStorageSync('grproject')
  }
})
