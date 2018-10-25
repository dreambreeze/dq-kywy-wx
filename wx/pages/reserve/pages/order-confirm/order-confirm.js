var buyNum = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputLimit: '0/50',
    nums: buyNum
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 监听页面加载输入备注事件
   */
  remarks: function (e) {
    var val = e.detail.value;

    this.setData({
      inputLimit: val.length + '/50'
    });
  },
  /**
   * 购买数量减减
   */
  lessNum: function () {
    buyNum--;
    if (buyNum <= 1) {
      buyNum = 1;
    }
    this.setData({
      nums: buyNum
    });
  },
  /**
   * 购买数量加加
   */
  addNum: function () {
    buyNum++;
    this.setData({
      nums: buyNum
    });
  },
  /**
   * 点击选择技师
   */
  toSelectTech: function () {
    wx.navigateTo({
      url: '../select-tech/select-tech',
    });
  },
  /**
   * 点击选择优惠券
   */
  toSelectCoupon: function () {
    wx.navigateTo({
      url: '../select-coupon/select-coupon',
    });
  },
  /**
   * 购买成功
   */
  toSuccess: function () {
    wx.redirectTo({
      url: '../pay-success/pay-success',
    });
  }
})