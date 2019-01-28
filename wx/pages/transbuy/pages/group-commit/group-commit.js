let app = getApp();
let common = require('../../../../common.js');
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据 paystatus:true允许提交
   */
  data: {
    paystatus:true,
    phoneinfo:{}
   },

  onLoad:function(options){
    var that = this
    //var multiinfo = wx.getStorageSync("grproject")
    let  groupno= options.groupno
    let  pid = options.pid
    let  buytype=options.buytype
    let  num = options.num  //剩余人数，，如果剩余人数==1 那么跳转到满团界面
    let  nodeid = options.nodeid   //门店节点
    
    that.setData({
      buytype: options.buytype,
      groupno: options.groupno,
      num: num,
      nodeid: nodeid,
      pid:pid
    })

    var openid = wx.getStorageSync("openid")
    if (!openid) {
      //调用获取openid
      common.getLogin(app.globalData.authorizerId).then(function (data) {
        //获取手机号码
         openid = data
          wx.showLoading({
            title: '加载中...',
          })

          wx.request({
            url: common.config.host + '/index.php/Api/Base/getUserInfo',
            data: {
              'openid': openid,
              'field': 'names,phone,avatarUrl',
              'authorizerId': app.globalData.authorizerId
            },
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.hideLoading();
              if (res.statusCode == 200 && res.data.status == 1) {
                 wx.setStorageSync("phoneinfo", res.data.info)
                that.setData({
                  phoneinfo: res.data.info
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.data.info,
                  showCancel: false
                });
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
                  content: '网络连接失败，请检查您的网络',
                  showCancel: false
                });
              }
            }
          })
      })
    } else {
        wx.showLoading({
          title: '加载中...',
        })
        wx.request({
          url: common.config.host + '/index.php/Api/Base/getUserInfo',
          data: {
            'openid': openid,
            'field': 'names,phone,avatarUrl',
            'authorizerId': app.globalData.authorizerId
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            wx.hideLoading();
            if (res.statusCode == 200 && res.data.status == 1) {
              wx.setStorageSync("phoneinfo", res.data.info)
              that.setData({
                phoneinfo: res.data.info
              });
            } else {
              wx.showModal({
                title: '提示',
                content: res.data.info,
                showCancel: false
              });
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
                content: '网络连接失败，请检查您的网络',
                showCancel: false
              });
            }
          }
        })
    }

      common.getGroupShopping(app.globalData.authorizerId, nodeid, pid, openid, "", groupno,'').then(function (res) {
        var multiinfo = res.info[0]
        that.setData({
          store: multiinfo,
          project: multiinfo.project[0],
        })
      }).catch()



  },

  submit: function () {
    let that = this
    let paystatus = that.data.paystatus

    if (paystatus){
      // wx.redirectTo({
      //   url: '../group-paycomplete/group-paycomplete?orderno=201807281143296246&groupno=20180728492821&pid=1'
      // })
      this.wechatPay()
      that.setData({ paystatus:false})
    }else{
      wx.showToast({
        icon:"none",
        title: '已有订单提交~，请稍候',
        mask:true
      })
    }

  },

  /* 微信支付
    团购号
  */
  wechatPay: function () {
    wx.showLoading({
      title: '加载中...',
    })
    var that = this
    let openid = wx.getStorageSync("openid")
    let store = that.data.store
    let project = that.data.project
    let buytype = that.data.buytype
    var total_fee = buytype == 1 ? project.singleprice : project.groupprice
    let is_creator = buytype == 3 ? 0 : 1//buytype 1-单独购买  2-开团 3-参团
    let groupno = that.data.groupno
    var phoneinfo = that.data.phoneinfo
    if (phoneinfo['phone']==''){
      wx.showModal({
        title: '提示',
        content: '未获取到手机号',
        showCancel: false
      });
      that.setData({ paystatus: true })
      wx.hideLoading();
      return false;
    }

    if (buytype == 3 && groupno==''){
      wx.showModal({
        title: '提示',
        content: '拼团号不存在，请开新团',
        showCancel: false
      });
      that.setData({ paystatus: true })
      wx.hideLoading();
      return false;
    }

    var date = new Date()
    let timstamp = Date.parse(date) / 1000
    let otime = util.formatTime(date)



    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;


    //订单号
    var orderNO = y + '' + m + '' + d + '' + h + '' + minute + '' + second + '' + Math.ceil(Math.random() * (9999 - 1000) + 1000)
    //团购类别 grouptype  1拼团  2秒杀
    wx.request({
      url: common.config.host + '/index.php/Api/AutoMina/groupUniformOrders',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'openid': openid,
        'total_fee': total_fee,
        "ono": orderNO,
        "nodeid": store.nodeid,
        "project_name":project.project,
        "grouptype":1,
        "pid": project.id,
        "createtime": timstamp,
        'buytype':buytype,
        'groupno':groupno
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (rs) {
        wx.hideLoading()
        var info = rs.data.info
        if (rs.statusCode == 200) {
          if (rs.data.status == 1) {
            //保存prepay_id用于发送小程序模版信息
            common.savePrepayId(app.globalData.authorizerId, openid, info.package)
            wx.requestPayment({
              timeStamp: info.timeStamp,
              nonceStr: info.nonceStr,
              package: info.package,
              signType: info.signType,
              paySign: info.paySign,
              success: function (subres) {
                //拼团订单补充参数
                var groupno = that.data.groupno
               
                let project = that.data.project
                let num = that.data.num
                if (groupno) {//参团
                  var nownum = num
                } else {
                  var nownum = project.nums
                }

                if (subres.errMsg == 'requestPayment:ok') {
                  wx.request({
                    url: common.config.host + '/index.php/Api/AutoMina/getTransactionID',
                    data: {
                      'authorizerId': app.globalData.authorizerId,
                      'openid': openid,
                      "ono": orderNO,
                      'tablename':"daqi_group_pay",
                      'ordertable': "daqi_group_order",
                      'projectid': project.id,
                      "groupno": groupno,
                      "buytype":buytype,
                      "is_creator": is_creator,
                      "pname": phoneinfo.names,
                      "pphone": phoneinfo.phone,
                      "pavatar": phoneinfo.avatarurl,
                      "limittime": project.limittime,
                      "pshopno": store.nodeid,
                      "shopno": project.shopno,
                      "nums": project.nums,
                      "nownum": nownum//当前还差多少人，不算本次拼团
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/json'
                    },
                    success: function (trres) {//付款成功后才提交订单
                      wx.request({
                        url: common.config.host + '/index.php/Api/AutoMina/sendMsg',
                        data: {
                          'authorizerId': app.globalData.authorizerId,
                          'openid': openid,
                          'ono': orderNO,
                          'otime': otime,
                          'ostorename': store.store_name,
                          'opayway': "微信支付",
                          'omoney': total_fee,
                          'ogoodsinfo': project.project,
                          'pid': project.id
                        },
                        method: 'POST',
                        header: {
                          'content-type': 'application/json'
                        },
                        success: function (res) {
                          wx.hideLoading();
                          that.setData({ paystatus: true })
                          let nums = that.data.project.nums
                        
                          if (trres.data.isfull==1 && buytype!=1){//满团
                            wx.redirectTo({
                              url: '../group-full/group-full?orderno=' + orderNO + '&groupno=' + trres.data.groupno + '&pid=' + project.id + '&nodeid=' + store.nodeid
                            })
                          } else{//不满图需要分享的 与 单独购买的
                            wx.redirectTo({
                              url: '../group-paycomplete/group-paycomplete?orderno=' + orderNO + '&groupno=' + trres.data.groupno + '&pid=' + project.id + '&nodeid=' + store.nodeid + '&buytype=' + buytype
                            })
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
                              content: '网络连接失败，请检查您的网络',
                              showCancel: false
                            });
                          }
                        }
                      })
                    },

                  });
                }

              },
              fail: function (subres) {
                wx.hideLoading()
                //更改可支付状态

                that.setData({ paystatus: true })

                if (subres.errMsg == 'requestPayment:fail cancel') {
                  wx.showToast({
                    title: '支付已取消',
                    mask: true
                  });

                } else {
                  wx.showModal({
                    title: '提示',
                    content: subres.errMsg,
                    showCancel: false
                  });
                }
              },

            });
          } else {
            that.setData({ paystatus: true })
            wx.showModal({
              title: '提示',
              content: info,
              showCancel: false
            });
          }
        } else {
          that.setData({ paystatus: true })
          wx.showModal({
            title: '提示',
            content: info,
            showCancel: false
          });
        }
      }
    });
  },

  onUnload(){
    // wx.removeStorageSync("existorder")
    // wx.removeStorageSync("grproject")
  }

})
