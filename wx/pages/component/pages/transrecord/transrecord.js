let app = getApp();
let common = require('../../../../common.js');
let loadMsg = '加载中...'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardPicUrl: common.config.cardPicUrl,
    loadMsg: loadMsg,
    showImgUrl: common.config.showImgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    let _this = this;

    let openid = wx.getStorageSync('openid');

    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(data => {
        openid = data;
        _this.getTransrecord(app.globalData.authorizerId, openid).then(data => {
          wx.hideLoading();
          if (data.info.length > 0) {
            _this.setData({
              transcard: data.info
            });
          } else {
            _this.setData({
              loadMsg: '无转赠卡记录',
              transcard: false
            });
          }
        }).catch(data => {
          wx.hideLoading();
          _this.setData({
            loadMsg: data,
            transcard: false
          });
        });
      }).catch(data => {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        })
      });
    } else {
      _this.getTransrecord(app.globalData.authorizerId, openid).then(data => {
        wx.hideLoading();
        if (data.info.length > 0) {
          _this.setData({
            transcard: data.info
          });
        } else {
          _this.setData({
            loadMsg: '无转赠卡记录',
            transcard: false
          });
        }

      }).catch(data => {
        wx.hideLoading();
        _this.setData({
          loadMsg: data,
          transcard: false
        });
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      loadMsg: '加载中...'
    });

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    let _this = this;

    let openid = wx.getStorageSync('openid');

    if (!openid) {
      common.getLogin(app.globalData.authorizerId).then(data => {
        openid = data;
        _this.getTransrecord(app.globalData.authorizerId, openid).then(data => {
          wx.hideLoading();
          if (data.info.length > 0) {
            _this.setData({
              transcard: data.info
            });
          } else {
            _this.setData({
              loadMsg: '无转赠卡记录',
              transcard: false
            });
          }
        }).catch(data => {
          wx.hideLoading();
          _this.setData({
            loadMsg: data,
            transcard: false
          });
        });
      }).catch(data => {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: data,
          showCancel: false
        });
      });
    } else {
      _this.getTransrecord(app.globalData.authorizerId, openid).then(data => {
        wx.hideLoading();
        if (data.info.length > 0) {
          _this.setData({
            transcard: data.info
          });
        } else {
          _this.setData({
            loadMsg: '无转赠卡记录',
            transcard: false
          });
        }

      }).catch(data => {
        wx.hideLoading();
        _this.setData({
          loadMsg: data,
          transcard: false
        });
      });
    }

    wx.stopPullDownRefresh();
  },

  /**
   * 获取转赠卡记录
   */
  getTransrecord: function(...options) {
    let p = new Promise(function(resolve, reject) {
      wx.request({
        url: common.config.host + '/index.php/Api/Requestdata/getTransrecord',
        data: {
          'authorizerId': options[0],
          'openid': options[1]
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
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
        fail: function(res) {
          if (res.errMsg == 'request:fail timeout') {
            reject('请求超时');
          } else {
            reject('请求失败');
          }
        }
      });
    });

    return p;
  },

  /**
   * 删除订单
   */
  delOrder: function(e) {
    let guid = e.currentTarget.dataset.guid;
    let _this = this;
    let openid = wx.getStorageSync('openid');
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });

          common.delOrder(app.globalData.authorizerId, guid).then(function(data) {
            _this.getTransrecord(app.globalData.authorizerId, openid).then(data => {
              wx.hideLoading();
              if (data.info.length > 0) {
                _this.setData({
                  transcard: data.info
                });
              } else {
                _this.setData({
                  loadMsg: '无转赠卡记录',
                  transcard: false
                });
              }

            }).catch(data => {
              wx.hideLoading();
              _this.setData({
                loadMsg: data,
                transcard: false
              });
            });
          }).catch(function(data) {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: data.message ? data.message : data,
              showCancel: false
            });
          });
        }
      }
    });
  },

  /**
   * 撤销转赠卡
   */
  transrecord: function(e) {
    let guid = e.detail.target.dataset.guid;
    let _this = this;
    let formId = e.detail.formId;

    let openid = wx.getStorageSync('openid');

    wx.showModal({
      title: '提示',
      content: '确定要撤销吗？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });

          wx.request({
            url: common.config.host + '/index.php/Api/Requestdata/transrecord',
            data: {
              'authorizerId': app.globalData.authorizerId,
              'rguid': guid,
              'formId': formId
            },
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            success: function(res) {
              wx.hideLoading();
              //返回成功
              if (res.statusCode == 200) {
                if (res.data.status == 1) {
                  _this.getTransrecord(app.globalData.authorizerId, openid).then(data => {
                    if (data.info.length > 0) {
                      _this.setData({
                        transcard: data.info
                      });
                    } else {
                      _this.setData({
                        loadMsg: '无转赠卡记录',
                        transcard: false
                      });
                    }

                  }).catch(data => {
                    wx.showModal({
                      title: '提示',
                      content: '加载出错，请下拉刷新',
                      showCancel: false
                    })
                  });
                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.data.info,
                    showCancel: false
                  });
                }
              } else {
                wx.showToast({
                  title: '请求失败',
                  icon: 'none'
                });
              }
            },
            fail: function(res) {
              wx.hideLoading();
              if (res.errMsg == 'request:fail timeout') {
                wx.showToast({
                  title: '请求超时',
                  icon: 'none'
                });
              } else {
                wx.showToast({
                  title: '请求失败',
                  icon: 'none'
                });
              }
            }
          });
        }
      }
    });

  },

  /**
   * 打电话
   */
  callphone: function (e) {
    if (!e.currentTarget.dataset.tel){
      return false;
    }
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel
    });
  }
})