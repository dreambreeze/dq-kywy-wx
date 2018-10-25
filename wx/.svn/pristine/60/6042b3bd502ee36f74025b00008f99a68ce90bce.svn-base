// pages/note/note.js
Page({

  data: {
      talength:0,
      choosegoods:[],
      autoList:[
        {
          id:1,
          name:"免辣",
        },
        {
          id: 2,
          name: "少辣",
        },
        {
          id: 3,
          name: "不要葱蒜",
        },
        {
          id: 4,
          name: "不要香菜",
        },
        {
          id: 5,
          name: "多辣",
        },
        {
          id: 6,
          name: "不要酱油",
        },
      ],
      autodone:[{}],

      content:"",
      defindex:0,
  },

  onLoad:function(){
    var choosegoods = wx.getStorageSync("choosegoods")
    if (choosegoods){
      this.setData({
        choosegoods: choosegoods,
      })
    }
    // console.log(this.data.content)
  },
 
  getinfo:function(e){
    var that = this
    var id = e.target.dataset.id;
    var list = that.data.autoList;
    var content = list[id].name;
    var choosegoods = that.data.choosegoods
    var defindex = that.data.defindex//第几个商品
    choosegoods[defindex].note = that.data.content + ' ' + content;
   // var newcontent = this
    if (choosegoods[defindex].note.length>20){
        wx.showToast({
          title: '最多20字哦',
        })
        choosegoods[defindex].note = that.data.content ;
        return false;
    }
    this.setData({ 
      content: choosegoods[defindex].note,
      talength: choosegoods[defindex].note.length,
      choosegoods: choosegoods
    })

  },
  submit:function(e){
    var that = this
    var choosegoods = that.data.choosegoods
    var values = e.detail.value

    console.log(e)
    var pages = getCurrentPages();
    //var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //展示给用户看的备注  处理为 商品名称：备注；
    var shownote = ""
    for(var i in choosegoods){
      for(var j in values){
        if (values[j] !== '' && j == choosegoods[i].serviceitemno){
          shownote += choosegoods[i].serviceitemname + ":" + values[j]+"; "
        }
      }
    }
    console.log(shownote)
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
     prevPage.setData({
       noteword: shownote,
       notevalues:values,
     })
     wx.navigateBack(prevPage);
  },

  bindinput:function (e) {
    console.log(e)
    this.setData({
      defindex:e.currentTarget.dataset.id,
      content: e.detail.value
      })
   
  },
 
 
 

 
})