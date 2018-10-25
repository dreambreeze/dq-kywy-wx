var pushImg = [];
var starState = ['非常不满意', '不满意', '一般', '比较满意', '非常满意'];
var star = [
  'https://iservice.daqisoft.cn/Public/Home/images/star.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star.png'
];

var star_check = [
  'https://iservice.daqisoft.cn/Public/Home/images/star_check.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star_check.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star_check.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star_check.png',
  'https://iservice.daqisoft.cn/Public/Home/images/star_check.png'
];

var textareaVal = '';

//评论星星数量
let star_num = 0;
//项目ID
let pid = 0;
//门店节点标识
let nodeid = '';
let app = getApp();
let common = require('../../../../common.js');

//E团购券表ID
let id = 0;
//已上传的图片数量
let alrUpload = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pushImg: [],
    star: star,
    starStatus: '请评价',
    showImgUrl: common.config.showImgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    pushImg = [];
    star_num = 0;
    textareaVal = '';

    let _this = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    id = options.id;
    pid = options.pid;
    nodeid = options.nodeid;
    var openid= wx.getStorageSync("openid")

    //查询E团购订单详情
    common.getGroupShopping(app.globalData.authorizerId, nodeid, pid, openid, '', '', '').then(function (data) {
      wx.hideLoading();
      if (!data.info) {
        wx.showModal({
          title: '提示',
          content: '项目不存在',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '../group-order/group-order',
              });
            }
          }
        });
      } else {
        if (data.info.is_assess == 1) {
          wx.showModal({
            title: '提示',
            content: '项目已评价，不能重复评价',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          });
          return false;
        }
        _this.setData({
          orderData: data.info[0],
          project: data.info[0].project[0]
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

    //获取本地已上传的图片
    alrUpload = wx.getStorageSync('assessImg');
    this.setData({
      pushImg: alrUpload
    });

  },


  /**
   * 评价上传图片
   */

  pushImg: function () {
    if (alrUpload.length >= 5) {
      wx.showModal({
        title: '提示',
        content: '最多上传5张图片',
        showCancel: false
      });
      return false;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var _this = this;

    wx.chooseImage({
      count: (5 - alrUpload.length),
      success: function (res) {
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          pushImg.push(res.tempFilePaths[i]);
        }

        if (pushImg.length > 5) {
          pushImg.splice(5);
        }

        //上传图片至服务器
        for (let i = 0; i < pushImg.length; i++) {
          wx.uploadFile({
            url: common.config.host + '/index.php/Api/Requestdata/upload',
            filePath: pushImg[i],
            name: 'file',
            formData: {
              'user': 'test'
            },
            success: function (res) {
              wx.hideLoading();
              pushImg = [];
              let data = JSON.parse(res.data);

              if (data.status == 1) {
                //已上传图片链接保存至本地
                alrUpload = wx.getStorageSync('assessImg');

                if (alrUpload) {
                  alrUpload.push(data.filename);
                  wx.setStorageSync('assessImg', alrUpload);
                } else {
                  wx.setStorageSync('assessImg', [
                    data.filename
                  ]);
                }

                _this.setData({
                  pushImg: wx.getStorageSync('assessImg')
                });

              } else {
                wx.showModal({
                  title: '提示',
                  content: data.info,
                  showCancel: false
                });
              }
            }
          })
        }
      },
      fail: function () {
        wx.hideLoading();
      }
    })

  },

  /**
   * 删除显示的图片
   */
  closeImg: function (e) {
    let idx = e.currentTarget.dataset.idx;
    let filename = e.currentTarget.dataset.filename;
    let _this = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    alrUpload = wx.getStorageSync('assessImg');

    //删除图片
    common.delImg(filename).then(function (data) {
      wx.hideLoading();
      alrUpload.splice(idx, 1);
      wx.setStorageSync('assessImg', alrUpload);
      _this.setData({
        pushImg: alrUpload
      });
    }).catch(function (data) {
      wx.hideLoading();
      alrUpload.splice(idx, 1);
      wx.setStorageSync('assessImg', alrUpload);
      _this.setData({
        pushImg: alrUpload
      });
    });
  },

  /**
   * 点击评论星星
   */
  star: function (e) {
    var _star = [];
    var idx = e.currentTarget.dataset.idx;

    star_num = idx + 1;

    for (var i = 0; i <= idx; i++) {
      _star.push(star_check[i]);
    }
    for (var i = idx; i < star.length - 1; i++) {
      _star.push(star[i]);
    }
    this.setData({
      star: _star,
      starStatus: starState[idx]
    });
  },

  /**
   * 点击提交
   */
  assessBtn: function () {
    if (star_num == 0) {
      wx.showToast({
        title: '请评价',
        mask: true,
        icon: 'none'
      });
      return false;
    }

    if (!textareaVal) {
      wx.showToast({
        title: '请输入评价内容',
        mask: true,
        icon: 'none'
      });
      return false;
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    alrUpload = wx.getStorageSync('assessImg');

    //用户openid
    let openid = wx.getStorageSync('openid');

    //评价请求
    wx.request({
      url: common.config.host + '/index.php/Api/AutoMina/groupAssess',
      data: {
        'alrUpload': alrUpload,
        'starnum': star_num,
        'textareaVal': textareaVal,
        'openid': openid,
        'authorizerId': app.globalData.authorizerId,
        'nodeid': nodeid,
        'pid': pid,
        'id': id
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
            wx.removeStorageSync('assessImg');
            wx.showToast({
              title: '评价成功',
              mask: true,
              success: function () {
                wx.redirectTo({
                  url: '../group-order/group-order',
                });
              }
            })
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

  /**
   * 监听输入评论内容
   */
  textareaValInput: function (e) {
    textareaVal = e.detail.value;
  }

})