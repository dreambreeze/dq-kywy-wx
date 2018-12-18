var app = getApp();
Page({

  data: {
    content:"",
    contentLists:[],
    showHistory:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({
      contentLists: wx.getStorageSync("contentLists")
    })
  },
  bindinput:function(e){
    this.setData({
      content: e.detail.value
    })
  },
  bindblur: function (e) {
    this.setData({
      content:e.detail.value
    })
  },
  toSearch:function(){
    var content = this.data.content;
    if (content!=''){
    var contentLists = wx.getStorageSync('contentLists') || []
    contentLists.unshift(content)
    contentLists = app.unique(contentLists)
    wx.setStorageSync('contentLists', contentLists)
    wx.redirectTo({
      url: "../techindex/techindex?wd=" + content,
    })
    }else{
      wx.showToast({
        title: '请输入技师号',
      })
    }
  },

  clearHistory:function(){
    try {
      wx.removeStorageSync('contentLists')
     this.setData({
       showHistory:false,
     })
    } catch (e) {
       wx.showToast({
         title: '清除出错',
       })
    }
  },

  itemToSearch:function(e){
    wx.redirectTo({
      url: "../techindex/techindex?wd=" + e.target.dataset.value,
    })
  }
})
