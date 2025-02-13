var common = require('../../../../common.js')
var phone = '';
var names = '';
var verify = '';
var openid = '';
var app = getApp();
//重新获取验证码秒数
var seconds;
//定时器
var verifyTimer = null;

var returnway = ''; //way  从自主点单来的  returnway=1  从预约来的 returnway=2
Page({

    /**
     * 页面的初始数据
     */
    data: {
        seconds: seconds
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        verify = '';
        phone = '';
        names = '';




        wx.showLoading({
            title: '加载中',
        });
        var _this = this;

        if (options.returnway) { //
            _this.setData({
                returnway: options.returnway
            })
        }

        var openid = wx.getStorageSync('openid');
        if (!openid) {
            common.getLogin(app.globalData.authorizerId).then(function(data) {
                common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function(data) {
                    wx.hideLoading();
                    names = data.info.names;
                    phone = data.info.phone;
                    _this.setData({
                        names: data.info.names,
                        phone: data.info.phone,
                        uinfo: data.info
                    });
                }).catch(function(data) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: data,
                        showCancel: false
                    });
                });
            }).catch(function(data) {
                wx.showModal({
                    title: '提示',
                    content: data,
                    showCancel: false
                });
            });
        } else {
            common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function(data) {
                wx.hideLoading();
                names = data.info.names;
                phone = data.info.phone;
                _this.setData({
                    names: data.info.names,
                    phone: data.info.phone,
                    uinfo: data.info
                });
            }).catch(function(data) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: data.message ? data.message : data,
                    showCancel: false
                });
            });
        }

    },


    /**
     * 手机输入框input事件
     */
    phoneVal: function(ev) {
        phone = ev.detail.value.trim();
    },

    /**
     * 姓名input 事件
     */
    namesVal: function(ev) {
        names = ev.detail.value.trim();
    },

    /**
     * 验证码
     */
    verifyVal: function(ev) {
        verify = ev.detail.value.trim();
    },

    /**
     * 获取验证码
     */
    getVerify: function() {
        var _this = this;
        if (phone == '') {
            wx.showModal({
                title: '提示',
                content: '请输入手机号',
                showCancel: false
            });
            return false;
        }

        if (!common.ismobile(phone)) {
            wx.showModal({
                title: '提示',
                content: '手机号格式错误',
                showCancel: false
            });
            return false;
        }

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        wx.request({
            url: common.config.host + '/index.php/Api/Base/getVerify',
            data: {
                'phone': phone,
                'authorizerId': app.globalData.authorizerId
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode == 200) {
                    if (res.data.status == 1) {
                        //开启定时器
                        seconds = 60;
                        clearInterval(verifyTimer);
                        verifyTimer = setInterval(function() {
                            if (seconds <= 0) {
                                seconds = 0;
                                clearInterval(verifyTimer);
                            }
                            _this.setData({
                                seconds: seconds
                            });
                            seconds--;
                        }, 1000);
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                            showCancel: false
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                            showCancel: false
                        });
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '请求失败，服务器错误',
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
                        content: '请求失败',
                        showCancel: false
                    });
                }
            }
        });
    },

    /**
     * 点击保存信息
     */
    infoSave: function() {
        var that = this

        if (names == '') {
            wx.showModal({
                title: '提示',
                content: '请输入姓名',
                showCancel: false
            });
            return false;
        }
        if (phone == '') {
            wx.showModal({
                title: '提示',
                content: '请输入手机号',
                showCancel: false
            });
            return false;
        }
        if (!common.ismobile(phone)) {
            wx.showModal({
                title: '提示',
                content: '手机号格式错误',
                showCancel: false
            });
            return false;
        }
        if (verify == '') {
            wx.showModal({
                title: '提示',
                content: '请输入验证码',
                showCancel: false
            });
            return false;
        }
        wx.showLoading({
            title: '加载中',
        });

        var openid = wx.getStorageSync('openid');

        wx.request({
            url: common.config.host + '/index.php/Api/Base/saveUserInfo',
            data: {
                'openid': openid,
                'names': names,
                'phone': phone,
                'verify': verify,
                'authorizerId': app.globalData.authorizerId,
                'type': 2
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode == 200) {
                    if (res.data.status == 1) {
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                            showCancel: false,
                            success: function(res) {
                                if (res.confirm) {
                                    var returnway = that.data.returnway
                                    switch (returnway) {
                                        case "1":
                                            wx.redirectTo({
                                                url: '../../../../pages/automina/pages/detail/detail',
                                            });
                                            break
                                        case "2":
                                            wx.redirectTo({
                                                url: '../../../../pages/technician/pages/techindex/techindex',
                                            });
                                            break
                                        case "3":
                                            wx.redirectTo({
                                                url: '../../../../pages/reserve/pages/reserve-room/reserve-room',
                                            });
                                            break

                                        default:
                                            wx.navigateBack();
                                            break
                                    }
                                }
                            }
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                            showCancel: false
                        });
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '请求失败',
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
                        content: '请求失败',
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
                        phone = info.purePhoneNumber;
                        _this.setData({
                            phone: info.purePhoneNumber,
                            uinfo: {
                                'phone': phone,
                                'names': names
                            }
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                            showCancel: false
                        });
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '获取失败',
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
                        content: '请求失败',
                        showCancel: false
                    });
                }
            }
        });
    }
})