var app = getApp();
var common = require('../../../../common.js');
var height = 0,
  dcH = 0,
  dcStoreList = [],
  cardType = [],
  cardTypeData = [];
//门店电话和地址
var shopInfo = {};
//用户姓名/手机号
var names, phone;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dcStore: dcStoreList,
    storeIdx: 0,
    showMask: false,
    //图片地址前缀
    showImgUrl: common.config.showImgUrl,
    //无会员卡图片的默认会员卡图
    cardPicUrl: common.config.cardPicUrl,
    //所有卡类型
    cardType: cardType,
    //门店电话和地址
    shopInfo: shopInfo
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    if (wx.canIUse('createSelectorQuery')) {
      var query = wx.createSelectorQuery();
      query.select('.dc-title').boundingClientRect(function (res) {
          if(res){
            dcH = res.height;
          }
      }).exec();

      setTimeout(function () {
        wx.getSystemInfo({
          success: function (res) {
            height = res.windowHeight - dcH;
            _this.setData({
              height: height
            });
          }
        });
      }, 1000);
    }

    this.getOpenCardType();
  },
  /**
   * 点击切换门店会员卡
   */
  changeStore: function (e) {
    //获取门店电话和地址
    shopInfo = {
      shoptel: cardTypeData[dcStoreList[e.target.dataset.index]][0].shoptel,
      address: cardTypeData[dcStoreList[e.target.dataset.index]][0].address,
      storename: dcStoreList[e.target.dataset.index]
    }

    for (var i = 0; i < cardTypeData[dcStoreList[e.target.dataset.index]].length; i++) {
      cardTypeData[dcStoreList[e.target.dataset.index]][i]['Balance'] = (parseFloat(cardTypeData[dcStoreList[e.target.dataset.index]][i].CardNum) + parseFloat(cardTypeData[dcStoreList[e.target.dataset.index]][i].SendNum));
    }

    this.setData({
      storeIdx: e.target.dataset.index,
      cardType: cardTypeData[dcStoreList[e.target.dataset.index]],
      //获取门店电话和地址
      shopInfo: shopInfo
    });
  },

  /**
   * 获取当前用户所有卡类型
   */
  getOpenCardType: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    
    var openid = wx.getStorageSync('openid')
      , _this = this;

    wx.request({
      url: common.config.host + '/index.php/Api/Base/getVipCard',
      data: {
        'authorizerId': app.globalData.authorizerId,
        'openid': openid,
        'type': 2,
        'isstoresort': 1
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            if (res.data.info == '') {
              wx.showModal({
                title: '提示',
                content: '您还没有会员卡，现在去办卡',
                success: function (e) {
                  if (e.confirm) {
                    wx.redirectTo({
                      url: '../docard/docard?id=3',
                    });
                  } else if (e.cancel) {
                    wx.navigateBack();
                  }
                }
              });
            } else {
              dcStoreList = [];
              //获取门店列表
              for (var item in res.data.info) {
                dcStoreList.push(item);
              }
              //获取会员卡数据以切换门店使用
              cardTypeData = res.data.info;

              //获取门店电话和地址
              shopInfo = {
                shoptel: cardTypeData[dcStoreList[0]][0].shoptel,
                address: cardTypeData[dcStoreList[0]][0].address,
                storename: dcStoreList[0]
              }
              //充值金额与赠送金额合计成余额
              for (var i = 0; i < cardTypeData[dcStoreList[0]].length; i++) {
                cardTypeData[dcStoreList[0]][i]['Balance'] = (parseFloat(cardTypeData[dcStoreList[0]][i].CardNum) + parseFloat(cardTypeData[dcStoreList[0]][i].SendNum));
              }
              //用户姓名与手机号
              names = res.data.names;
              phone = res.data.phone;

              _this.setData({
                dcStore: dcStoreList,
                cardType: cardTypeData[dcStoreList[0]],
                shopInfo: shopInfo
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
      fail: function (res) {
        wx.hideLoading();
        if (res.errMsg == 'request:fail timeout') {
          wx.showModal({
            title: '提示',
            content: '请求超时',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          });
        }
      }
    });
  },

  /**
   * 点击跳转至充值
   */
  jumpurl: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  }
})