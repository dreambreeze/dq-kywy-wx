const app = getApp()
var common = require('../../../../common.js');
Page({

    data: {
        showImgUrl:common.config.showImgUrl,
        toright: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/toright.png',
        fooddefpic: 'https://iservice.daqisoft.cn/Public/Home/images/fooddef.png',
        cart: {},
        goods: {},
        userinfo: {},
        arrivetime: '',
        order: null,
        store: null,
        orderinfo: null,
        conditions: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this
        that.setData({
            store: wx.getStorageSync("store"),
            goods: wx.getStorageSync("goods"),
            arrivetime: app.globalData.arrivetime,
            showImgUrl: app.globalData.showImgUrl,
            fooddefpic: wx.getStorageSync("fooddefpic")
        })
        //加载加载数据
        var conditions = ""
        if (options.MutexSign) {
            conditions = " MutexSign = '" + options.MutexSign + "'" + " and taskstate !=0"
        } else {
            conditions = " RGUID = '" + options.rguid + "'" + " and taskstate !=0"
        }
        that.setData({
            conditions: conditions
        })
        that.loaddata('/index.php/Api/OnLineTasks/lists', {
            "authorizerId": app.globalData.authorizerId,
            "tablename": "onlinetasks",
            "conditions": conditions,
        }, 1)

        //获取小程序广告
        common.getAppletAd().then(function(data) {
            that.setData({
                ad: data.info
            });
        }).catch(function(data) {
            that.setData({
                ad: false
            });
        });
    },

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
                        content: '网络连接失败，请检查您的网络',
                        showCancel: false
                    });
                }
            }

        });
    },

    //处理加载过来的数据
    //  res   成功的数据   operate   加载  1-
    dealdata: function(res, operate) {
        switch (operate) {
            case 1:
                if (res.data.status == 0) {
                    //var order = this.data.order
                    var order = res.data.data

                    var orderlength = Object.keys(order).length
                    for (var i in order) {
                        order[i].taskjson = JSON.parse(order[i].taskjson)
                        order[i].tasktime = order[i].tasktime.substring(0, 19)
                        order[i].taskjson.Note = ""
                        if (order[i].taskjson) {
                            for (let j in order[i].taskjson.arr) {
                                if (order[i].taskjson.arr[j].Note) {
                                    order[i].taskjson.Note += order[i].taskjson.arr[j].ServiceItemName + ":" + order[i].taskjson.arr[j].Note + "; "
                                }
                            }
                        }

                    }
                    this.setData({
                        order: order,
                    })
                }
                break
            case 2:
                if (res.data.status == 0) {
                    //var order = this.data.order
                    var order = res.data.data
                    var orderlength = Object.keys(order).length
                    for (var i in order) {
                        order[i].taskjson = JSON.parse(order[i].taskjson)
                        order[i].tasktime = order[i].tasktime.substring(0, 19)

                        order[i].taskjson.Note = ""
                        if (order[i].taskjson) {
                            for (let j in order[i].taskjson.arr) {
                                if (order[i].taskjson.arr[j].Note) {
                                    order[i].taskjson.Note += order[i].taskjson.arr[j].ServiceItemName + ":" + order[i].taskjson.arr[j].Note + "; "
                                }
                            }
                        }
                    }
                    this.setData({
                        order: order,
                    })

                    wx.hideNavigationBarLoading() //完成停止加载
                    wx.stopPullDownRefresh() //停止下拉刷新
                }
                break

        }
        wx.hideLoading()
    },

    onPullDownRefresh() {

        wx.showNavigationBarLoading() //在标题栏中显示加载
        var conditions = this.data.conditions
        this.loaddata('/index.php/Api/OnLineTasks/lists', {
            "authorizerId": app.globalData.authorizerId,
            "tablename": "onlinetasks",
            "conditions": conditions,
        }, 2)
        wx.stopPullDownRefresh() //停止下拉刷新
        　
    },

    /**
     * 点击广告跳转链接
     */
    jumpAd: function(e) {
        let adurl = e.currentTarget.dataset.adurl;
        if (adurl) {
            common.jishuzhichi(adurl);
        }
    }

})