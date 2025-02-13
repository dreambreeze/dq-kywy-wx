var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
  showTime:false,
  dayLists:[],
 // dayDefault: 0,
  daySelected:0,
  timeDefault: 0,//0 白天 1 晚上
  timeSelected:"",//选中的时间
  dayTimeStart:"10:00",
  dayTimeEnd: "17:30",
  nightTimeStart: "18:00",
  nightTimeEnd: "23:30",
  dayTimeLists:[],
  nightTimeLists:[{}],
  techimg:"https://iservice.daqisoft.cn/Public/Home/images/techimgs/tech.png",
  gotoimg: "https://iservice.daqisoft.cn/Public/Home/images/techimgs/goto.png",
  authimg:"https://iservice.daqisoft.cn/Public/Home/images/techimgs/auth.png",
  dayimg:"https://iservice.daqisoft.cn/Public/Home/images/techimgs/day.png",
  nodayimg: "https://iservice.daqisoft.cn/Public/Home/images/techimgs/noday.png",
  nightimg: "https://iservice.daqisoft.cn/Public/Home/images/techimgs/night.png",
  nonightimg: "https://iservice.daqisoft.cn/Public/Home/images/techimgs/nonight.png",
  starfullimg:"https://iservice.daqisoft.cn/Public/Home/images/techimgs/starfull.png",
  stargrayimg:"https://iservice.daqisoft.cn/Public/Home/images/techimgs/stargray.png",
  cancelimg: "https://iservice.daqisoft.cn/Public/Home/images/techimgs/cancel.png",
  },
  

  onLoad:function(options){
   wx.setNavigationBarTitle({
     title: '102号技师',
   })
    this.setData({
      dayLists: [
        { value: this.GetDateStr(0), name: '今天' }, 
        { value: this.GetDateStr(1), name: '明天' },
        { value: this.GetDateStr(2), name: '后天' },],
    })
    
  },

  onShow:function(){
    this.setData({
      dayTimeLists: this.getDayTime(this.data.dayTimeStart, this.data.dayTimeEnd),
      nightTimeLists: this.getDayTime(this.data.nightTimeStart, this.data.nightTimeEnd),
    })
    //根据当前时间自动切换 白天、黑夜默认展示项
    var date = util.formatTime(new Date())
    var dayend = date.substr(0, 11) + this.data.dayTimeEnd
    if (date > dayend){
      this.setData({
        timeDefault: 1
       })
    }

  },

  toTechdetail:function(){
    wx.navigateTo({
      url: '../techdetail/techdetail',
    })
  },
  toPJdetail:function(){
    wx.navigateTo({
      url: '../techpjdetail/techpjdetail',
    })
  },
  daySelect:function(e){
    this.setData({
      daySelected:e.currentTarget.dataset.id
    })
  },
  goToShowTime:function(e){
    this.setData({
      showTime: true
    })
  },
  hideTPTime:function(){
    this.setData({
      showTime:false
    })
  },

  //切换白天黑夜
  toSelectPtime:function(e){
    this.setData({
      timeDefault:e.currentTarget.dataset.id
    })
  },
  //选择预约的具体时间 
  toSelectTime:function(e){
    var daySelected = this.data.daySelected;
    var pTimeSeleted = this.data.timeDefault == 0 ? this.data.dayTimeLists : this.data.nightTimeLists
    var timeSelected = pTimeSeleted[e.target.dataset.id].time
    if (daySelected == 0 && pTimeSeleted[e.target.dataset.id].status==0){
      wx.showToast({
        title: '该时间不可预约',
      })
    }else{
      this.setData({
        timeSelected: timeSelected
      })
      var orderTime = this.data.dayLists[daySelected].name + " " + this.data.dayLists[daySelected].value + " " + timeSelected
      wx.setStorageSync("orderTime", orderTime)
    }

  },

  toPayorder:function(){
    wx.navigateTo({
      url: '../techpayorder/techpayorder',
    })
  },

 GetDateStr(AddDayCount) { 
    var dd = new Date(); 
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期 
    var y = dd.getFullYear(); 
    var m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1); //获取当前月份的日期 
    var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate() ; 
    return  m + "-" + d; 
  },

  getDayTime(startTime,endTime){
    const year = new Date().getFullYear();//年
    var timestamp1 = Date.parse(year +"-" + this.GetDateStr(0) +" "+ startTime);
    var starttimestamp = timestamp1 / 1000;
    var timestamp2 = Date.parse(year +"-" + this.GetDateStr(0) + " " +  endTime);
    var endtimestamp = (timestamp2 / 1000);
    var nowstamp = Date.parse(new Date())/1000;

    var newtimeLists = new Array();//以数组 装 对象
    for (var i = starttimestamp; i <= endtimestamp; i+=30*60){
      var timeObj = {};//在外面声明表示同一个对象，在里面声明表示不同的对象
      timeObj.time=util.formatHours(i);  
      if (i < nowstamp) {
        timeObj.status = 0;
      } else {
        timeObj.status = 1;
      }
      newtimeLists.push(timeObj);
    }
    return newtimeLists;
  },

  onShareAppMessage: function () {
    return {
      title: '客源无忧微信营销平台'
    }
  }
})