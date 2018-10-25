let app = getApp();
let common = require('../../../../common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    buyNavType: 'order',
    qrDisplay: 'none',
    otype:'1'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //用户openid
    let openid    = wx.getStorageSync('openid');
    let phoneinfo = wx.getStorageSync('phoneinfo');
    let phone = phoneinfo.phone ? phoneinfo.phone : '' 
    let otype = ''
    //查询拼团订单
   
    common.getSinGroupOrders(app.globalData.authorizerId, openid, phone, otype).then(function (data) {
      wx.hideLoading();
      console.log(data)
        if (data.order) {
        _this.setData({
          order: data.order
        });
      }
    }).catch(function (data) {
      console.log(data)
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });
    });
  },
  /**
   * 显示二维码
   */
  showConsume: function (e) {
    let qrcode = e.currentTarget.dataset.qrcode;
    let pname = e.currentTarget.dataset.pname;
    let price = e.currentTarget.dataset.price;
    let orderno = e.currentTarget.dataset.orderno;

    this.setData({
      qrDisplay: 'block',
      showQrcode: {
        qrcode: qrcode,
        pname: pname,
        price: price,
        orderno: orderno
      }
    });
  },
  /**
   * 关闭二维码
   */
  closeQrcode: function () {
    this.setData({
      qrDisplay: 'none'
    });
  },
  /**
   * 跳转至订单详情
   */
  orderDilTo: function (e) {
    var id = e.currentTarget.dataset.id;
    var orderno = e.currentTarget.dataset.orderno;
    var nodeid = e.currentTarget.dataset.nodeid+"#china";
    wx.navigateTo({
      url: '../group-orderdetail/group-orderdetail?orderno=' + orderno+'&pid='+id+'&nodeid='+nodeid,
    });
  },
  /**
   * 评价页
   */
  assess: function (e) {
    let pid = e.currentTarget.dataset.pid;
    let nodeid = e.currentTarget.dataset.nodeid+"#china";
    let id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '../group-assess/group-assess?pid=' + pid + '&nodeid=' + nodeid + '&id=' + id,
    });
  },

  /**
   * 跳转至购买页
   */
  againBuy: function (e) {
    let pid = e.currentTarget.dataset.pid;
    let nodeid = e.currentTarget.dataset.nodeid;
    nodeid +="#china"
    wx.navigateTo({
      url: '../group-detail/group-detail?pid=' + pid + '&nodeid=' + nodeid,
    });
  },


  //切换订单状态
  activeorder(e){
    wx.showLoading({
      mask:true,
      title: '加载中...',
    })
    var that  = this
    var showotype = e.currentTarget.dataset.id
    //用户openid
    let openid = wx.getStorageSync('openid');
    let phoneinfo = wx.getStorageSync('phoneinfo');
    let phone = phoneinfo.phone ? phoneinfo.phone : ''
   
    //查询拼团订单
    var otype = showotype == 1 ? '' : showotype //等于1即为查询全部
   
    common.getSinGroupOrders(app.globalData.authorizerId, openid, phone, otype).then(function (data) {
      wx.hideLoading();
      console.log(otype)
     
      if (data.order) {
        that.setData({
          order: data.order,
          otype: showotype
        });
      }
      wx.pageScrollTo({
        scrollTop: 0
      })
    }).catch(function (data) {
      console.log(data)
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: data,
        showCancel: false
      });
    });
  },
  /**
   * 删除项目
   */
  delOrderItem: function (e) {
    let id = e.currentTarget.dataset.id;
    let _this = this;

    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });

          //用户openid
          let openid = wx.getStorageSync('openid');

          common.delEBuyItem(app.globalData.authorizerId, id).then(function (data) {
            wx.hideLoading();
            //查询E团购订单
            common.getEBuyOrder(app.globalData.authorizerId, openid, 1).then(function (data) {
              if (data.info) {
                _this.setData({
                  orderData: data.info
                });
              }
            }).catch(function (data) {
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
        }
      }
    })
  },

  //未满团  去分享
  toshare(e){
    let pid = e.currentTarget.dataset.pid
    let orderno = e.currentTarget.dataset.orderno
    let groupno = e.currentTarget.dataset.groupno
    let nodeid = e.currentTarget.dataset.nodeid+"#china"
    wx.navigateTo({
      url: '../group-paycomplete/group-paycomplete?orderno=' + orderno + '&groupno=' + groupno + '&pid=' + pid + '&nodeid=' + nodeid
    })
  }

})