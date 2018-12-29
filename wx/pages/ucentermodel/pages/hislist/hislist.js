var app = getApp();
//获取全局配置
var common = require('../../../../common.js');
const date = new Date()
//加载状态
let loadState = true;
//页数
let pageIndex = 0;
Page({

    data: {
        choosecard: {},
        cards: [],
        bills: [],
        details: [],
        totalcount: 0,
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //无会员卡图片的默认会员卡图,
        datePicurl: 'https://note.youdao.com/yws/api/personal/file/WEB76bf178ce76fb99722cb35708c6444e9?method=download&shareKey=9681f80551b9067b01ade1f14d5532ad',
        //消费记录默认图标
        hisPicurl: 'https://iservice.daqisoft.cn/Public/Home/images/hisdefpic.png',
        //
        xiePic: "https://iservice.daqisoft.cn/Public/Home/images/xie.png",
        hldownPic: "https://iservice.daqisoft.cn/Public/Home/images/hldown.png",
        showcard: false,
        selected:0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //获取当前年月
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()

        this.setData({
            date: year + "年" + month + "月",
            ym: year + "-" + month + "-" + day,
            endmonth: year + "-" + month
        })

        //分页
        pageIndex = 0;
        //重新开启上拉加载
        loadState = true;

        //加载技师及技师类别信息 从当月第一天，查到当前天
        month = month > 9 ? month : "0" + month
        this.loaddata('/index.php/Api/AutoBase/getHistoryData', {
            "authorizerId": app.globalData.authorizerId,
            "swday": year + "-" + month + "-01",
            "ewday": year + "-" + month + "-" + day,
            "openid": wx.getStorageSync("openid"),

            "shopno": "",
            "cardno": '',
            'beginnum': pageIndex,
            'endnum': 10,
        }, 1)
    },

    //切换卡类型
    getcardtype: function(e) {
        var index = e.currentTarget.dataset.id
        var cards = this.data.cards
        var selectcard;
        for (var i in cards) {
            if (i == index) {
                cards[i].selected = true
                selectcard = cards[i]
            } else {
                cards[i].selected = false
            }
        }
        this.setData({
            cards: cards,
            showcard: false,
            selected: index,
            choosecard: selectcard
        })

        var ym = this.data.ym
        var year = ym.split("-")[0]
        var month = ym.split("-")[1]
        var day = new Date(year, month, 0);
        var lastdate = day.getDate() //当月最后一天
        month = month > 9 ? month : "0" + month

        //分页
        pageIndex = 0;
        //重新开启上拉加载
        loadState = true;
        var shopno = index == 0 ? '' : selectcard.ShopNo
        var cardno = index == 0 ? '' : selectcard.CardNo
        this.loaddata('/index.php/Api/AutoBase/getHistoryData', {
            "authorizerId": app.globalData.authorizerId,
            "swday": year + "-" + month + "-01",
            "ewday": year + "-" + month + "-" + lastdate,
            "openid": wx.getStorageSync("openid"),
            "shopno": shopno,
            "cardno": cardno,
            'beginnum': pageIndex,
            'endnum': 10
        }, 1)

    },

    //切换选择卡界面
    changeshow: function() {
        this.setData({
            showcard: !this.data.showcard,
        })
    },


    /**
     * 跳转至订单详情页
     */
    todetail: function(e) {

        var that = this
        var index = e.currentTarget.dataset.index

        var bill = that.data.bills[index]
        var key = bill.ShopNo + "" + bill.PayNo
        var choosecard = that.data.choosecard

        wx.setStorageSync('hdbill', bill)
        wx.setStorageSync('choosecard', choosecard)

        wx.navigateTo({
            url: '../hisdetail/hisdetail',
        });

    },

    bindDateChange: function(e) {
        var ym = e.detail.value.split('-')
        var year = ym[0]
        var month = ym[1] - 1 + 1
        this.setData({
            date: year + "年" + month + "月",
            ym: year + "-" + month
        })
        //加载技师及技师类别信息
        var day = new Date(year, month, 0);
        var lastdate = day.getDate() //当月最后一天
        month = month > 9 ? month : "0" + month

        //分页
        pageIndex = 0;
        //重新开启上拉加载
        loadState = true;
        var selectcard = this.data.choosecard
        var shopno = selectcard.CardNo == 1 ? '' : selectcard.ShopNo
        var cardno = selectcard.CardNo == 1 ? '' : selectcard.CardNo
        this.loaddata('/index.php/Api/AutoBase/getHistoryData', {
            "authorizerId": app.globalData.authorizerId,
            "swday": year + "-" + month + "-01",
            "ewday": year + "-" + month + "-" + lastdate,
            "openid": wx.getStorageSync("openid"),
            "shopno": shopno,
            "cardno": cardno,
            'beginnum': pageIndex,
            'endnum': 10
        }, 1)
    },


    /* 加载数据 */
    loaddata: function(url, data, operate) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        var that = this

        wx.request({
            url: common.config.host + url,
            data: data,
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                that.dealdata(res, operate)
            },
            fail: function(res) {
                loadState = false;
                that.setData({
                    loadMtext: '无更多内容'
                });
                wx.hideLoading();
                if (res.errMsg == 'request:fail timeout') {
                    wx.showModal({
                        title: '提示',
                        content: '请求超时',
                        showCancel: false
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '请求失败',
                        showCancel: false
                    });
                }
            }
        });
    },

    /* 处理加载过来的数据
         res   成功的数据   operate
         加载  1-   第一个结果集  会员卡信息
                    第二个结果集  结账单信息
                    第三个结果集  结账单详情
                    第四个结果集  消费明细

         2-加载会员卡项目优惠信息
    */
    dealdata: function(res, operate) {
        switch (operate) {
            case 1:
                if (res.data.status == 1) {
                    var data = res.data.info
                    var cards = res.data.cards

                    // var all = new Object
                    // all.CardNo='1',
                    // all.showname = "全部"
                    // if (this.data.choosecard==all.showtime){
                    //   all.selected =true
                    // }
                    //cards.unshift(all)
                    var choosecard = this.data.choosecard
                    if (cards[0]) {
                        if (choosecard.CardNo) {

                        } else {
                            cards[0].selected = true
                            this.setData({
                                cards: cards,
                                choosecard: cards[0]
                            })
                        }

                    }

                    var bills = data
                    var totalcount = 0 //本月总支出  = bills[j].PayTime.date.toString().subtring(0,19)
                    for (var j in bills) {
                        var btime = bills[j].LastOPTime.date
                        bills[j].PayTime = btime.substr(0, 19)
                        totalcount += bills[j].OPIcon == '-' ? bills[j].OPMoney * 1 : 0
                    }
                    var details = []
                    // var billdetails = dataarr[2]
                    // var paydetails  = dataarr[3]
                    this.setData({
                        bills: bills,
                        details: details,
                        totalcount: totalcount
                    })

                    if (bills.length == 10) {
                        loadState = true;
                        this.setData({
                            loadMtext: '上拉加载更多'
                        });
                    } else {
                        loadState = false;
                        this.setData({
                            loadMtext: '无更多内容'
                        });
                    }

                } else {
                    loadState = false;
                    this.setData({
                        bills: [],
                        showcard: false,
                        totalcount: 0,
                        loadMtext: '无更多内容'
                    })

                    wx.showModal({
                        title: '提示',
                        content: res.data.info + "",
                        showCancel: false,
                        success: function(res) {}
                    })

                }
                break
            case 2:



                break


        }
        wx.hideLoading()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var that = this;
        if (loadState) {
            // 显示加载图标

            pageIndex++;
            loadState = false;
            that.setData({
                loadMtext: '加载中...'
            });


            var ym = that.data.ym
            var year = ym.split("-")[0]
            var month = ym.split("-")[1]
            var day = new Date(year, month, 0);
            var lastdate = day.getDate() //当月最后一天
            month = month > 9 ? month : "0" + month
            var selectcard = that.data.choosecard
            var shopno = selectcard.CardNo == 1 ? '' : selectcard.ShopNo
            var cardno = selectcard.CardNo == 1 ? '' : selectcard.CardNo

            wx.request({
                url: common.config.host + '/index.php/Api/AutoBase/getHistoryData',
                data: {
                    "authorizerId": app.globalData.authorizerId,
                    "swday": year + "-" + month + "-01",
                    "ewday": year + "-" + month + "-" + lastdate,
                    "openid": wx.getStorageSync("openid"),
                    "shopno": shopno,
                    "cardno": cardno,
                    'beginnum': pageIndex,
                    'endnum': 10
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function(res) {
                    if (res.data.status == 1) {
                        var data = res.data.info
                        var totalcount = that.data.totalcount
                        var bills = that.data.bills

                        // var totalcount = 0 //本月总支出  = bills[j].PayTime.date.toString().subtring(0,19)
                        for (var j in data) {
                            var btime = bills[j].LastOPTime.date
                            bills[j].PayTime = btime.substr(0, 19)
                            totalcount += bills[j].PayNo ? bills[j].OPMoney * 1 : 0
                            bills.push(data[j]);
                        }


                        if (data.length == 10) {
                            loadState = true;
                            that.setData({
                                loadMtext: '上拉加载更多'
                            });
                        } else {
                            loadState = false;
                            that.setData({
                                loadMtext: '无更多内容'
                            })
                        }
                        that.setData({
                            bills: bills,
                            totalcount: totalcount
                        })

                    } else {
                        loadState = false;
                        that.setData({
                            loadMtext: '无更多内容'
                        })


                    }
                },
                fail: function(res) {
                    wx.hideLoading();
                    if (res.errMsg == 'request:fail timeout') {
                        wx.showModal({
                            title: '提示',
                            content: '请求超时',
                            showCancel: false
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '请求失败',
                            showCancel: false
                        });
                    }
                }
            })
        }
    },

})