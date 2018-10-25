
Page({

  data: {
    imgUrls: [
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/project.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/project.png',
      'https://iservice.daqisoft.cn/Public/Home/images/techimgs/project.png',
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 800,
  },

  backToProject:function(){
    wx.navigateBack({delta:1})
  }
})