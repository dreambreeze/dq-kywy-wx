var app = getApp()
Page({

  data: {
    content: "",
    contentLists: [],
    showHistory: true,
    hotLists: ["足浴盆", "毛巾2#", "安化黑茶", "中药护肤", "中华精油", "护肤品", "精油", "员工服", "中药",],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({
      contentLists: wx.getStorageSync("contentLists")
    })
  },
  bindinput: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  bindblur: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  toSearch: function () {
    var content = this.data.content;
    if (content != '') {
      var contentLists = wx.getStorageSync('contentLists') || []
      contentLists.unshift(content)
      contentLists = app.unique(contentLists)
      wx.setStorageSync('contentLists', contentLists)
      wx.redirectTo({
        url: "../shoptype/shoptype?wd=" + content,
      })
    } else {
      wx.showToast({
        title: '请输入商品关键字',
      })
    }
  },

  clearHistory: function (e) {
    var that = this
    wx.showModal({
      // title: '在线商城',
      content: '是否清空搜索记录',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.removeStorageSync('contentLists')
            that.setData({
              showHistory: false,
            })
          } catch (e) {
            wx.showToast({
              title: '清除出错',
            })
          }
        } else if (res.cancel) {}
      },
    })
  },

  itemToSearch: function (e) {
    //console.log(e.target.dataset.value)
    wx.redirectTo({
      url: "../shoptype/shoptype?wd=" + e.target.dataset.value,
    })
  }
})