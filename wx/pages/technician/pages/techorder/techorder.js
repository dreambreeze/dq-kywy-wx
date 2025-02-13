//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();
var util = require("../../../../utils/util.js");
Page({
    /**
     * 页面的初始数据
     */
    data: {
        inputLimit: '0/50',
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //无门店图片的默认门店图
        bannerImg: common.config.bannerImg,
        techdata: [],
        SelectedTime: 30,
        noteword: "",
        names: "",
        phone: "",
        roomStorage: [],
        tech: "", //技师编号集,
        dateArray: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this = this;
        //获取当前预约的门店信息
        var currentReserveStore = wx.getStorageSync('currentReserveStore');
        var noedid = currentReserveStore[0].nodeid
        var shopno = noedid.split("#")[0]
        //获取当前预约的技师
        var tech = ""
        var techdata = wx.getStorageSync('techdata')
        if (techdata) {
            if (shopno != techdata[0].shopno) {
                techdata = []
            } else {
                for (var i in techdata) {
                    tech += techdata[i].staffworkno + "号、"
                }
                tech = tech.substring(0, tech.length - 1)
            }
        }
        //获取当前预约的房间
        var roomStorage = wx.getStorageSync('roomStorage')
        if (roomStorage) {
            if (shopno != roomStorage[0].nodeid) {
                roomStorage = []
            }
        }
        this.setData({
            currentReserveStore: currentReserveStore,
            techdata: techdata,
            tech: tech,
            roomData: roomStorage
        });
        //加载个人信息
        this.getUser()
        wx.hideLoading()
        this.getDateArray(0, 0, 0)
    },
    /**
    * 页面展示事刷新数据
    */
    onShow() {
        
    },
    getDateArray: function(endDate, splitTime, count) {
        var that = this
        if (!endDate) {
            endDate = new Date()
            // endDate += 30 * 60 * 1000
        }
        if (!splitTime) {
            splitTime = 5 * 60 * 1000;
        }
        if (!count) {
            count = 6;
        }
        var endTime = endDate.getTime() + 30 * 60 * 1000
        var mod = endTime % splitTime;
        if (mod > 0) {
            endTime -= mod;
        }
        var dateArray = [];
        while (count-- > 0) {
            var d = new Date();
            d.setTime(endTime - count * splitTime)
            d = util.dateFtt("yyyy-MM-dd hh:mm", d);
            dateArray.push(d);
        }
        var dateobj = {
            20: {
                name: '20分钟'
            },
            30: {
                name: '30分钟'
            },
            40: {
                name: '40分钟'
            },
            50: {
                name: '50分钟'
            },
            60: {
                name: '1小时'
            },
            90: {
                name: '1.5小时'
            },
            120: {
                name: '2小时'
            },
            150: {
                name: '2.5小时'
            },
            180: {
                name: '3小时'
            },
        }
        that.setData({
            dateArray: dateobj
        })
        return dateobj;
    },


    /**
     * 监听页面加载输入备注事件
     */
    remarks: function(e) {
        var val = e.detail.value;

        this.setData({
            inputLimit: val.length + '/50',
            noteword: val
        });
    },


    /**
     * 购买成功
     */
    toSuccess: function() {
        var that = this
        var SelectedTime = that.data.SelectedTime
        if (SelectedTime == '') {
            wx.showToast({
                icon: "none",
                title: '请选择到店时间',
            })
            return false
        }
        var names = that.data.names
        var phone = that.data.phone
        if (phone) {
            var isphone = common.ismobile(phone)
            if (!isphone) {
                wx.showModal({
                    title: '提示',
                    content: "手机号码格式错误",
                    showCancel: false
                })
                return false
            }
        }
        if (!(names && phone)) {
            wx.showModal({
                title: '提示',
                content: "未输入预约信息",
                showCancel: false
            })
            return false
        }


        //向服务器提交数据
        var taskjson = new Object;
        var data = that.data.techdata
        var roomdata = that.data.roomData
        var nowroom = ""
        for (var j in roomdata) {
            if (roomdata[j].selected)
                nowroom = roomdata[j]
        }


        var arr = new Array
        if (data) { //若没有约技师  只有约房间
            var sname = ""
            for (var id in data) {

                var taskjsonchild = new Object
                taskjsonchild.StaffNo = data[id].staffno
                taskjsonchild.WorkNo = data[id].staffworkno
                taskjsonchild.ItemNo = ''
                arr.push(taskjsonchild)

            }
        }
        taskjson.TecInfos = arr
        var phone = that.data.phone
        taskjson.BSPhone = phone
        taskjson.BSName = that.data.names
        taskjson.ArriveTime = that.data.SelectedTime
        taskjson.Note = that.data.noteword

        //约房间
        taskjson.StoreName = that.data.currentReserveStore[0].store_name
        taskjson.RoomCategoryNo = nowroom ? nowroom.roomscategoryno : ""
        taskjson.RoomCategoryNa = nowroom ? nowroom.roomscategoryname : ""
        taskjson.BedNum = nowroom ? nowroom.bednum + "" : ""

        var shopno = data ? data[0].shopno : nowroom.nodeid

        var date = new Date()
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        var second = date.getSeconds();
        second = second < 10 ? ('0' + second) : second;
        var MutexSign = y + '' + m + '' + d + '' + h + '' + minute + '' + second + '' + Math.ceil(Math.random() * (9999 - 1000) + 1000)

        var sysinfo = wx.getSystemInfoSync() //获取当前设备信息
        var kvinfos = {
            "RGUID": "",
            "PhoneNo": phone,
            "ShopNo": shopno,
            "MutexSign": MutexSign,
            "TaskID": "5",
            "TaskName": "预约",
            "TaskJson": taskjson,
            "TaskTime": "",
            "TaskSrc": sysinfo.brand + " " + sysinfo.model,
            "TaskState": "1",
            "TaskResult": "",
            "AstA": app.globalData.authorizerId
        }
        that.loaddata('/index.php/Api/OnLineTasks/operate', [{
            "authorizerId": app.globalData.authorizerId,
            "taskid": 1,
            "tablename": "onlinetasks",
            "conditions": "",
            "kvinfos": kvinfos,
        }], 1)
    },

    //预约时间选择
    goToShowTime: function(e) {
        //获取当前时间
        var dateArray = this.getDateArray()
        this.setData({
            showTime: true,
            dateArray: dateArray
        })
    },
    hideTPTime: function() {
        this.setData({
            showTime: false
        })
    },

    //选择时间之后
    toSelectTime: function(e) {
        var SelectedTime = e.currentTarget.dataset.selectedtime
        this.setData({
            SelectedTime: SelectedTime
        })
        this.hideTPTime()
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
    /* 处理加载过来的数据 
         res   成功的数据   operate   
    */
    dealdata: function(res, operate) {
        switch (operate) {
            case 1:
                var artime = this.data.SelectedTime
                wx.removeStorageSync("roomStorage")
                wx.removeStorageSync("techdata")
                wx.redirectTo({
                    url: '../techpaycomplete/techpaycomplete?guid=' + res.data.guid + '&artime=' + artime,
                })
                break
        }
        wx.hideLoading()
    },
    /*加载个人信息*/
    getUser: function() {
        var openid = wx.getStorageSync('openid');
        var _this = this;
        wx.request({
            url: common.config.host + '/index.php/Api/Base/getUserInfo',
            data: {
                'openid': openid,
                'field': 'names,phone',
                'authorizerId': app.globalData.authorizerId
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode == 200 && res.data.status == 1) {
                    var names = res.data.info.names;
                    var phone = res.data.info.phone;
                    _this.setData({
                        names: res.data.info.names,
                        phone: res.data.info.phone
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.data.info,
                        showCancel: false
                    });
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
                        content: '网络连接失败，请检查您的网络',
                        showCancel: false
                    });
                }
            }
        });
    },
    /**
     * 获取用户微信绑定的手机号
     */
    getPhoneNumber: function(e) {
        var _this = this;
        if (!e.detail.encryptedData) {
            wx.showModal({
                title: '提示',
                content: '获取手机号失败',
                showCancel: false
            });
            return false;
        }
        if (e.detail.errMsg != 'getPhoneNumber:ok') {
            wx.showModal({
                title: '提示',
                content: '获取手机号失败',
                showCancel: false
            });
            return false;
        }
        //解密获取手机号
        wx.showLoading({
            title: '加载中',
        });

        let openid = wx.getStorageSync('openid');

        wx.request({
            url: common.config.host + '/index.php/Api/Base/get_encryptedData',
            data: {
                'authorizerId': app.globalData.authorizerId,
                'encryptedData': e.detail.encryptedData,
                'openid': openid,
                'iv': e.detail.iv
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode == 200) {
                    if (res.data.status == 1) {
                        var info = JSON.parse(res.data.info);
                        var phone = info.purePhoneNumber;
                        _this.setData({
                            phone: info.purePhoneNumber
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                        });
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '获取失败',
                    });
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
                        content: '网络连接失败，请检查您的网络',
                        showCancel: false
                    });
                }
            }
        });
    },
    /**
     * 手机输入框input事件
     */
    phoneVal: function(ev) {
        var phone = ev.detail.value.trim();
        this.setData({
            phone: phone
        })
    },

    /**
     * 姓名input 事件
     */
    namesVal: function(ev) {
        var names = ev.detail.value.trim();
        this.setData({
            names: names
        })
    },

    //去预约  1-约技师   2-约房间
    goyy: function(e) {
        var gotype = e.currentTarget.dataset.type
        if (gotype == 1) {
            wx.redirectTo({
                url: '../techindex/techindex',
            })
        } else if (gotype == 2) {
            wx.redirectTo({
                url: '../../../reserve/pages/reserve-room/reserve-room',
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '未确定的跳转类型',
                showCancel: false
            })
        }
    },
   
})