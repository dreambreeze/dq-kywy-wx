Page({
  data: {
      compeleteimg:'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/complete.png',
      adimg:'https://iservice.daqisoft.cn/Public/Home/images/shopmina/imgs/ad.png',
      arrivetime:5,
  },
  toorder:function(){
    wx.navigateTo({
      url: '../shopmineorder/shopmineorder',
    })
  },

})