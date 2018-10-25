// pages/shopminecoupon/shopminecoupon.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList:[
      {id:1, name: "抵扣券", facevalue: "20", date: "2018-12-31", desc: "1.适用于在线商城", desc1: "2.满100元可以使用", desc2: "3.不可与会员优惠同享", deschidden: false},
      {id: 2, name: "新人专享券", facevalue: "30", date: "2018-12-31", desc: "1.适用于在线商城", desc1: "2.满100元可以使用", desc2: "3.不可与会员优惠同享", deschidden:true}
    ],
  },
  deschidden:function(e){
    var couponList = this.data.couponList
    var id = e.currentTarget.dataset.id-1
    couponList[id].deschidden = !couponList[id].deschidden
    //console.log(couponList)
    this.setData({
      couponList: couponList
    })
  },
  // 去使用
  touse:function(e){
    console.log(e)
  },
  
  //查看失效券
  failurecoupon:function(){
    wx.navigateTo({
      url: '../shopfailcoupon/shopfailcoupon',
    })
  },
})