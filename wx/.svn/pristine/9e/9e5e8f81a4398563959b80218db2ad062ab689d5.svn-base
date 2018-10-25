Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 点击返回首页
   */
  backHome: function () {
    wx.reLaunch({
      url: '/pages/vip-center/vip-center',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sTitle = '',
      barTitle = '';
    switch (options.type) {
      case 'docard':
        sTitle = '会员卡办理成功！';
        barTitle = '办理成功';
        break;
      case 'recharge':
        sTitle = '会员卡充值成功！';
        barTitle = '充值成功';
        break;
      default :
        sTitle = '会员卡办理成功！';
        barTitle = '办理成功';
        break;
    }
    this.setData({
      sTitle: sTitle
    });
    wx.setNavigationBarTitle({
      title: barTitle
    });
  }
})