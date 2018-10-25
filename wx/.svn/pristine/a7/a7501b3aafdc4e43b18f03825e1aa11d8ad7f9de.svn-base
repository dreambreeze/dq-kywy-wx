var app = getApp()
var common = require('../../common.js');
import WxValidate from '../../utils/WxValidate.js'
var Validate = ""
Page({

  data: {
    addr:{},
    region: ['请选择地区'],
    addrdetail:"",
  },
  onLoad:function(options){
    var addr = app.addr
    var addrarr = addr.addr.split(",")
    var region = addrarr.slice(0,3)//下标0，1，2  不包括3
    addrarr.splice(0, 3)//返回被删除的之后的数组 就是前面3个
    var addrdetail = addrarr.toString()
    this.setData({
      addr:addr,
      region: region,
      addrdetail: addrdetail
    })

    // 验证字段的规则
    const rules = {
      aname: {
        required: true,
      },
      aphone: {
        required: true,
        tel: true,
      },
      firstaddr: {
        required: true,
      },
      secaddr: {
        required: true,
      },
    }
    var messages = {
      aname: {
        required: "请填写收货人",
      },
      aphone: {
        required: '请输入手机号',
        tel: '请输入正确的手机号',
      }, firstaddr: {
        required: "请选择所在地区",
      },
      secaddr: {
        required: "请填写详细地址",
      },
    }
    Validate = new WxValidate(rules, messages) 
   
  },
 
  bindRegionChange: function (e) {
    
    this.setData({
      region: e.detail.value
    })
  },

  //数据提交
  formSubmit: function (e) {
    const params = e.detail.value
    console.log(params)
    // 传入表单数据，调用验证方法  
    if (!Validate.checkForm(e)) {
      const error = Validate.errorList[0]
      console.log(error)
      //提示信息  
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
      return false
    } else {//数据验证通过
      var that = this
      //提交
      // data = []
      // data['aname'] = params.data
      var host = common.config.host
      wx.request({
        url: host + "/minashop/mina/shopaddr?type=3",
        data: {
          "params": params, "uid": app.globalData.uid
        },
        method: 'POST',
        success: function (res) {
          console.log(res)
          wx.redirectTo({
            url: '../shopaddr/shopaddr',
          })
        },
        fail: function () {
        },
        complete: function () {
        }
      })
    }
  },
})