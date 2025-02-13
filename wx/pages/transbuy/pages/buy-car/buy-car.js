let app = getApp();
let common = require('../../../../common.js');

var buyNum = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nums: buyNum,
    showImgUrl: common.config.showImgUrl,
    editBtn: true,
    arrow: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    //检查是否有权限使用
    common.isExpiredTime(app.globalData.authorizerId).catch(function () {
      wx.reLaunch({
        url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=小程序使用权限已过期&notJump=1',
      });
    });

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(function (data) {
        openid = data;
        //获取用户购物车项目
        getCartProject(app.globalData.authorizerId, openid).then(function (data) {
          wx.hideLoading();
          let storeProjectArr = data.info;

          if (storeProjectArr.length > 0) {
            _this.setData({
              storeProject: storeProjectArr,
              pay_price: data.pay_price
            });
          } else {
            // wx.showModal({
            //   title: '提示',
            //   content: '无项目内容',
            //   showCancel: false
            // });
          }

        }).catch(function (data) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: data,
            showCancel: false
          });
        });
      }).catch(function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    } else {
      //获取用户购物车项目
      getCartProject(app.globalData.authorizerId, openid).then(function (data) {
        wx.hideLoading();
        let storeProjectArr = data.info;

        if (storeProjectArr.length > 0) {
          _this.setData({
            storeProject: storeProjectArr,
            pay_price: data.pay_price
          });
        } else {
          // wx.showModal({
          //   title: '提示',
          //   content: '无项目内容',
          //   showCancel: false
          // });
        }

      }).catch(function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    }
  },

  /**
   * 购买数量加加
   */
  addNum: function (e) {
    let _this = this;
    let pid = e.currentTarget.dataset.pid;
    let nodeid = e.currentTarget.dataset.nodeid;
    let num = e.currentTarget.dataset.num;
    let type = e.currentTarget.dataset.type;

    if (type == 1) {
      if (num <= 1) {
        num = 1;
        return false;
      }

      num--;
    } else if (type == 2) {
      num++;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    let openid = wx.getStorageSync('openid');
    //用户openid不存在
    if (!openid || !pid || !nodeid) {
      wx.showModal({
        title: '提示',
        content: '参数不存在',
        showCancel: false
      });
      return false;
    }

    //加入购物车请求参数
    let shopCartArr = {
      'pid': pid,
      'nodeid': nodeid,
      'openid': openid,
      'num': num
    };

    common.pushShopCart(app.globalData.authorizerId, shopCartArr).then(function (data) {
      //获取用户购物车项目
      getCartProject(app.globalData.authorizerId, openid).then(function (data) {
        wx.hideLoading();
        let storeProjectArr = data.info;

        if (storeProjectArr.length > 0) {
          _this.setData({
            storeProject: storeProjectArr,
            pay_price: data.pay_price
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
    }).catch(function (data) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });
    });

  },

  /**
   * 点击修改项目
   */
  editCartProject: function (e) {
    let idx = e.currentTarget.dataset.idx;

    this.setData({
      itemIdx: idx,
      editBtn: false,
      arrow: 0
    });
  },

  /**
   * 完成项目修改
   */
  editFinishProject: function (e) {
    let idx = e.currentTarget.dataset.idx;

    this.setData({
      itemIdx: idx,
      editBtn: true,
      arrow: 1,
      editid:0,
    });
  },

  /**
   * 删除项目
   */

  delProject: function (e) {
    let _this = this;
    let pid = e.currentTarget.dataset.pid;
    let nodeid = e.currentTarget.dataset.nodeid;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    let openid = wx.getStorageSync('openid');
    //用户openid不存在
    if (!openid || !pid || !nodeid) {
      wx.showModal({
        title: '提示',
        content: '参数不存在',
        showCancel: false
      });
      return false;
    }

    //删除请求
    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/delProject',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'pid': pid,
        'nodeid': nodeid,
        'openid': openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            //删除成功后台重新加载购物车项目
            getCartProject(app.globalData.authorizerId, openid).then(function (data) {
              wx.hideLoading();
              let storeProjectArr = data.info;

              if (storeProjectArr.length > 0) {
                _this.setData({
                  storeProject: storeProjectArr,
                  pay_price: data.pay_price
                });
              } else {
                _this.setData({
                  storeProject: '',
                  pay_price: 0
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
          } else {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: res.data.info,
              showCancel: false
            });
          }
        } else {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '请求失败',
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
            content: '请求失败',
            showCancel: false
          });
        }
      }
    });
  },

  /**
   * 点击结算
   */

  settBtn: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid = wx.getStorageSync('openid');

    if (!openid) {
      wx.showModal({
        title: '提示',
        content: '参数错误',
        showCancel: false
      });
      return false;
    }

    //支付请求
    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/projectPay',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'openid': openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            var info = res.data.info;
            wx.requestPayment({
              timeStamp: info.timeStamp,
              nonceStr: info.nonceStr,
              package: info.package,
              signType: info.signType,
              paySign: info.paySign,
              success: function (res) {
                if (res.errMsg == 'requestPayment:ok') {
                  //保存prepay_id用于发送小程序模版信息
                  common.savePrepayId(app.globalData.authorizerId, openid, info.package);
                  wx.showToast({
                    title: '支付成功，跳转中...',
                    icon: 'success',
                    mask: true,
                    duration: 2000,
                    success: function (res) {
                      wx.navigateTo({
                        url: '/pages/ucentermodel/pages/orders/orders',
                      });
                    }
                  });
                }
              },
              fail: function (res) {
                if (res.errMsg == 'requestPayment:fail cancel') {
                  wx.showToast({
                    title: '支付已取消',
                    mask: true
                  });
                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.errMsg,
                    showCancel: false
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
  },

  touchmove: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;

      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;

      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，回原
        console.log(disX)

      } else if(disX > 0){//展示删除
        if (disX >= 30) {
          //控制手指移动距离最大值为删除按钮的宽度
          this.setData({
            //设置触摸起始点水平方向位置
            editid: e.currentTarget.dataset.id,
            itemIdx:e.currentTarget.dataset.index,

          });
        }
      }
    }

  },
  //触发移动开始
  touchstart(e){
    console.log(e)
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      });
    }
  },
  //触发移动开始
  touchend(e) {
    var id = e.currentTarget.dataset.id
    var editid = this.data.editid
    if (e.changedTouches.length == 1 && editid==id) {
      var endX = e.changedTouches[0].clientX;
      var disX = endX-this.data.startX;
      if (disX>0){
        this.setData({
          //设置触摸起始点水平方向位置
          editid: 0,
          arrow:1
        });
      }

    }
  },
})


/**
   * 获取购物车项目
   */
function getCartProject(authorizerId, openid) {
  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: common.config.host + '/index.php/Api/Requestdata/getCartProject',
      data: {
        'authorizerId': authorizerId,
        'openid': openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
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
}
