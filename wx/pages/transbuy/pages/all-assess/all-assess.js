let app = getApp();
let common = require('../../../../common.js');
//页数
let pageIndex = 0;
//评价类型
let types = '';
//门店节点标识
let nodeid = '';
//项目ID
let pid = 0;
//加载状态
let loadState = true;
//评价数据
let assessData = [];
//进入评价的来源
let afrom = '';

Page({

  /**
  * 页面的初始数据
  */
  data: {
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    console.log(options)
    let _this = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    types = options.type;
    nodeid = options.nodeid;
    pid = options.pid;
    afrom = options.afrom ? options.afrom : '';
    //分页
    pageIndex = 0;
    //重新开启上拉加载
    loadState = true;
    //评价数据
    assessData = [];

    //获取评价内容
    if (afrom == 'group') {
      common.getgroupAssess(app.globalData.authorizerId, nodeid, pid, types, pageIndex, 'daqi_group_assess').then(function (data) {
        wx.hideLoading();
        if (data.info) {
          assessData = data.info;
          _this.setData({
            assesData: assessData
          });

          if (assessData.length == 5) {
            loadState = true;
            _this.setData({
              loadMtext: '上拉加载更多'
            });
          } else {
            loadState = false;
            _this.setData({
              loadMtext: '无更多内容'
            });
          }
        } else {
          loadState = false;
          _this.setData({
            loadMtext: '无更多内容'
          });
        }
      }).catch(function (data) {
        wx.hideLoading();
        loadState = false;
        _this.setData({
          loadMtext: '无更多内容'
        });
      });
    } else {
      common.getAssess(app.globalData.authorizerId, nodeid, pid, types, pageIndex).then(function (data) {
        wx.hideLoading();
        console.log(data)
        if (data.info) {
          assessData = data.info;
          _this.setData({
            assesData: assessData
          });

          if (assessData.length == 10) {
            loadState = true;
            _this.setData({
              loadMtext: '上拉加载更多'
            });
          } else {
            loadState = false;
            _this.setData({
              loadMtext: '无更多内容'
            });
          }
        } else {
          loadState = false;
          _this.setData({
            loadMtext: '无更多内容'
          });
        }
      }).catch(function (data) {
        wx.hideLoading();
        loadState = false;
        _this.setData({
          loadMtext: '无更多内容'
        });
      });
    }

    _this.setData({
      navType: types,
      nodeid: nodeid,
      pid: pid,
      afrom: afrom
    });
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
  * 上位加载更多评价
  */

  onReachBottom: function () {
    let _this = this;
    console.log(loadState)
    //获取评价内容
    if (loadState) {
      pageIndex++;
      loadState = false;
      _this.setData({
        loadMtext: '加载中...'
      });

      wx.showLoading({
        title: '加载中...',
        mask: true
      });
     
      if (afrom == 'group') {
        common.getgroupAssess(app.globalData.authorizerId, nodeid, pid, types, pageIndex, 'daqi_group_assess').then(function (data) {
          console.log(data)
          wx.hideLoading();
          if (data.info) {
            for (let i = 0; i < data.info.length; i++) {
              assessData.push(data.info[i]);
            }

            loadState = true;
            _this.setData({
              assesData: assessData,
              loadMtext: '上拉加载更多'
            });
          } else {
            loadState = false;
            _this.setData({
              assesData: assessData,
              loadMtext: '无更多内容'
            });
          }
        }).catch(function (data) {
          wx.hideLoading();
          loadState = false;
          _this.setData({
            assesData: assessData,
            loadMtext: '无更多内容'
          });
        });
      } else {
        common.getAssess(app.globalData.authorizerId, nodeid, pid, types, pageIndex).then(function (data) {
          wx.hideLoading();
          if (data.info) {
            for (let i = 0; i < data.info.length; i++) {
              assessData.push(data.info[i]);
            }

            loadState = true;
            _this.setData({
              assesData: assessData,
              loadMtext: '上拉加载更多'
            });
          } else {
            loadState = false;
            _this.setData({
              assesData: assessData,
              loadMtext: '无更多内容'
            });
          }
        }).catch(function (data) {
          wx.hideLoading();
          loadState = false;
          _this.setData({
            assesData: assessData,
            loadMtext: '无更多内容'
          });
        });
      }
    }
  }
})
