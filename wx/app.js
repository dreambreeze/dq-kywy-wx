//app.js
var common = require('./common.js');
App({
    onLaunch: function(op) {
        wx.removeStorageSync('openid')
        var _this = this;
        //获取系统（当前小程序）唯一IDwxf0015533c671835e
        let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
        _this.globalData.authorizerId = extConfig.authorizer_appid;
        // _this.globalData.authorizerId = 'wx8550b9449468b029';
        //获取本地storage保存的openid
        var openid = wx.getStorageSync('openid');
        //检查是否在登录态
        wx.checkSession({
            success: function(res) {
                //用户openid未保存在本地时重新登录
                if (!openid) {
                    //微信登录获取session_Key与openid保存至本地
                    common.getLogin(_this.globalData.authorizerId).then(function(data) {
                        openid = data;

                    }).catch(function(data) {
                        wx.showModal({
                            title: '提示',
                            content: data.message ? data.message : data,
                            showCancel: false
                        });
                    });
                }
            },
            fail: function() {
                //微信登录获取session_Key与openid保存至本地
                common.getLogin(_this.globalData.authorizerId).then(function(data) {
                    openid = data;
                }).catch(function(data) {
                    wx.showModal({
                        title: '提示',
                        content: data.message ? data.message : data,
                        showCancel: false
                    });
                });
            }
        });

        //检查是否有权限使用
        common.isExpiredTime(_this.globalData.authorizerId).catch(function(data) {
            wx.reLaunch({
                url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=小程序使用权限已过期&notJump=1',
            });
        });

        //进入小程序授权地理位置
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userLocation']) {
                    wx.authorize({
                        scope: 'scope.userLocation'
                    })
                }
            }
        });

    },


    globalData: {
        wXUserInfo: null,
        authorizerId: '',
        showImgUrl: common.config.showImgUrl,
        arrivetime: 5,
        startgray: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/startgray.png',
        startfull: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/startfull.png',
        addimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/add.png',
        reduceimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/reduce.png',
        dateobj: {
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
    },


    //去除数组重复数据  
    unique(arr) {
        return Array.from(new Set(arr))
    },

    /**
     * 监听小程序隐藏
     */
    onHide: function() {
        //清除扫描二维码的门店节点标识和房间号
        // wx.removeStorageSync('ShopNoRoomNo');
        //清除功能模块
        wx.removeStorageSync('ucenterNav');
        wx.removeStorageSync('homeNav');
        wx.removeStorageSync('vipNav');
        wx.removeStorageSync('promotions');
        //清除地理位置信息，以便每次打开小程序重新定位
        wx.removeStorageSync('currentReserveStore');
    },

    onShow: function(ops) {

        if (ops.scene == 1044) {
            console.log(ops.shareTicket)
        }
    }
})