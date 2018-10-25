let app = getApp();
let common = require('../../../../common.js');

//项目ID
let pid = '';
//项目所属门店节点标识
let nodeid = '';

let grproject=""
//区分是否加入购物车还是立即购买，1为加入购物车，2为立即购买
let buyType;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicator:false,
    banner: [],
    mutiple:5,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    //项目ID与门店标识
    pid = options.pid
    let nodeid = options.nodeid
    _this.setData({ pid: pid,nodeid:nodeid})
    console.log(nodeid)
    console.log(options)
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    common.getGroupShopping(app.globalData.authorizerId, nodeid, pid,'','','','').then(function (data) {
     
      wx.hideLoading();
      let storeProjectArr = data.info;
      
      if (storeProjectArr) {
        //项目banner图
        let banner = storeProjectArr[0].project[0].picurl.map(function (item) {
          return  item
        });

        wx.setNavigationBarTitle({
          title: storeProjectArr[0].project[0].project,
        });

        _this.setData({
          storeProject: storeProjectArr,
          banner: banner
        });

      } else {
        wx.showModal({
          title: '提示',
          content: '无项目内容',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack();
            }
          }
        });
      }

    }).catch(function (data) {
      console.log(data)
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    });

    //用户openid是否存在
    let openid = wx.getStorageSync('openid');

    

    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function (data) {
        openid = data;

        common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function (data) {
          wx.hideLoading();
         
          if (data.info.phone) {}
          else {
            wx.showModal({
              title: '提示',
              content: '您未绑定手机号，请前往绑定',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                 
                  wx.redirectTo({
                    url: '../../../../pages/ucentermodel/pages/infobind/infobind?returnway=5',
                  })
                }
              }
            })
          }
          
        }).catch(function (data) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: data,
            showCancel: false
          })
        })
      })
    } else {
      common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function (data) {
        wx.hideLoading();

        if (data.info.phone) { }
        else {
          wx.showModal({
            title: '提示',
            content: '您未绑定手机号，请前往绑定',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
              
                wx.redirectTo({
                  url: '../../../../pages/ucentermodel/pages/infobind/infobind?returnway=5',
                })
              }
            }
          })
        }

      }).catch(function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        })
      })
    }

    //获取评价内容
    common.getgroupAssess(app.globalData.authorizerId, nodeid, pid, '', 0,'daqi_group_assess').then(function (data) {
      if (data.info) {
        _this.setData({
          assesData: data.info
        });
      }
    }).catch(function (data) {
    });
    //项目订单
    common.getGroupOrders(app.globalData.authorizerId, nodeid, pid, "", "", "",'').then(function (data) {
      if (data.status==1) {
       
        _this.setData({
          mutiple: data.mutiple,
          num: data.length,
          ordersData: data.info,
        })
        _this.countDown()
       
      }
    }).catch(function (data) {
    });
  },

  onShow:function(){
    var _this=this
    //用户openid是否存在
    let openid = wx.getStorageSync('openid')
    let nodeid = _this.data.nodeid
    let pid = _this.data.pid
    common.getGroupOrders(app.globalData.authorizerId, nodeid, pid, "","","").then(function (data) {
      if (data.status == 1) {

        _this.setData({
          mutiple: data.mutiple,
          num: data.length,
          ordersData: data.info,
        })
        _this.countDown()

      }
    }).catch(function (data) {
    });
  },
  /**
   * 查看全部评论
   */
  lookAllAssess: function () {
    let nodeid = this.data.nodeid
    wx.navigateTo({
      url: '../all-assess/all-assess?nodeid=' + nodeid + '&pid=' + pid +'&afrom=group',
    });
  },
 
  /**
   * 点击 购买 1-单独购买  2-立即开团  3 -参团
   */
  buys: function (e) {
    let that = this
    let buytype= e.currentTarget.dataset.buytype
    let openid = wx.getStorageSync("openid")

    let num = e.currentTarget.dataset.num ? e.currentTarget.dataset.num : that.data.storeProject[0].project[0].nums-1//剩余人数
    let pid = that.data.pid
    let nodeid = that.data.storeProject[0].nodeid

    var grproject = that.data.storeProject[0]
    let groupno = e.currentTarget.dataset.groupno ? e.currentTarget.dataset.groupno:""
    if (groupno){
      let existorder = that.data.ordersData[groupno]
      wx.setStorageSync("existorder", existorder)

      ///根据openid  判断是否是同一人
      var isorders = grproject.project[0].orders
      for (var i in isorders){
        if (isorders[i].openid == openid){
            wx.showModal({
              title: '提示',
              content: '不可参与自己的拼团',
              showCancel:false
            })
            return false
        }
      }

    }
    
   // var grproject = that.data.storeProject[0].project[0]
   
   
    if (buytype == 1 && grproject.project[0].issingle==0){
      wx.showModal({
        title: '提示',
        content: '当前项目未开启单独购买~',
        showCancel:false
      })
      return false
    }

    wx.setStorageSync("grproject", grproject)
    wx.navigateTo({
      url: '../group-commit/group-commit?groupno=' + groupno + '&buytype=' + buytype + '&pid=' + pid + '&num=' + num + '&nodeid=' + nodeid,
    })
  },

  goindex:function(){
    wx.reLaunch({
      url: '../../../../pages/index/index',
    })
  },

  /**
   * 图片预览
   */
  previewImg: function (e) {
    wx.previewImage({
      urls: e.currentTarget.dataset.urlarr,
      current: e.currentTarget.dataset.currentimg,
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


  onShow:function(){
    
  },
  /**
 * 倒计时
 */
 countDown(){
    let that = this;
    let ordersData = that.data.ordersData
 
    function nowTime() {//时间函数
      // console.log(a)
      for (var i in ordersData) {
        var intDiff = ordersData[i].limittime;//获取数据中的时间戳
        // console.log(intDiff)
        var day = 0, hour = 0, minute = 0, second = 0;
        if (intDiff > 0) {//转换时间
          day = Math.floor(intDiff / (60 * 60 * 24));
          hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
          minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
          second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
          if (hour <= 9) hour = '0' + hour;
          if (minute <= 9) minute = '0' + minute;
          if (second <= 9) second = '0' + second;
          ordersData[i].limittime--;
          var str =  hour + ':' + minute + ':' + second
          // console.log(str)    
         
        } else {
          var str = "已结束！";
          //delete ordersData[i]
          //clearInterval(timer);
        }
        // console.log(str);
        ordersData[i].difftime = str;//在数据中添加difftime参数名，把时间放进去
        ordersData = ordersData
      }
      that.setData({
        ordersData: ordersData
      })
    }
    nowTime();
    var timer = setInterval(nowTime, 1000);
  },
  
});
