var common = require('../../common.js');
var app = getApp();

//功能模块数组
let checkmodule = {};
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //导航tabBar
        navTabBar: common.config.navTabBar,
        //功能模块加载中
        info: '加载中...',
        //分享按钮拖拽参数
        top: '600rpx',
        left: '620rpx',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //开启 sharetickets
        wx.showShareMenu({
            withShareTicket: true
        })

        checkmodule = {};
        let _this = this;

        let query = wx.createSelectorQuery();
        let minHeight = 0;
        let setHeightTimer = null;
        query.selectViewport().boundingClientRect(function(rect) {
            minHeight = rect.height;
        }).exec();

        clearTimeout(setHeightTimer);
        setHeightTimer = setTimeout(function() {
            _this.setData({
                minHeight: minHeight + 'px'
            });
        }, 1000);

        //检查是否有权限使用
        common.isExpiredTime(app.globalData.authorizerId).catch(function() {
            wx.reLaunch({
                url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=小程序使用权限已过期&notJump=1',
            });
        });
    },

    /**
     * 点击底部导航
     */
    enginNav: function(e) {
        //点击跳转URL
        var url = e.currentTarget.dataset.url;
        //是否允许点击
        let isTo = e.currentTarget.dataset.isto;
        if (!isTo) {
            wx.showModal({
                title: '提示',
                content: '功能开发中，敬请期待',
                showCancel: false
            });
            return false;
        }
        wx.redirectTo({
            url: url,
        });
    },
    /**
     * 技术支持跳转
     */
    jishuzhichi: function() {
        common.jishuzhichi();
    },
    /**
     * 页面跳转
     */
    jumpPage: function(e) {
        var url = e.currentTarget.dataset.url;
        if (!url) {
            return false;
        }
        wx.navigateTo({
            url: url,
        });
    },
    /**
     * 监听页面分享  单聊不可获取shareTickets   群聊可以
     */
    onShareAppMessage: function(options) {
        let that = this;
        var sharefrom = options.from
        if (sharefrom == "menu") { //button：页面内转发按钮；menu：右上角转发菜单
            sharefrom = "menu"
        } else {
            sharefrom = "button"
        }
        var shareObj = new Object
        shareObj = {
            title: '',
            url: "pages/index/index",
            success: function(res) {
                console.log(res)
                if (res.shareTickets) { //群聊
                    wx.getShareInfo({
                        shareTicket: res.shareTickets[0],
                        success: function(res) {
                            console.log(res)
                        },
                        fail: function(res) {
                            console.log(res)
                        },
                        complete: function(res) {}
                    })
                } else { //单聊
                    //
                }
                wx.showLoading({
                    title: '加载中',
                    mask: true
                });
                //用户openid
                let openid = wx.getStorageSync('openid');
                common.getShareCoupon(app.globalData.authorizerId, openid).then(function(data) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: "恭喜您分享获得优惠券，可去我的券包查看",
                        showCancel: false
                    });
                }).catch(function(data) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: data,
                        showCancel: false
                    });
                });
            },
            fail: function() {
                wx.showToast({
                    icon: 'none',
                    title: '您取消了分享',
                })

            },
        }
        return shareObj
    },
    /**
     * 分享按钮开始拖拽
     */
    shareTouchStar(e){
        this.setData({
            initY: e.touches[0].pageY - e.currentTarget.offsetTop,
            initX: e.touches[0].pageX - e.currentTarget.offsetLeft,
        })
    },
    /**
     * 分享按钮拖拽
     */
    shareTouchMove(e) {
        let top = e.touches[0].pageY - this.data.initY;
        let left = e.touches[0].pageX - this.data.initX;
        if (top > 505 || left > 327 || top < 0 || left < 0) {
            return false;
        }
        this.setData({
            top: top+'px',
            left: left+'px',
        })
    },
    /**
     * 监听页面显示
     */
    onShow: function() {
        let _this = this;
        //加载优惠活动后台分配的功能模块
        let fid = common.config.navTabBar[2].id;
        let promotions = wx.getStorageSync('promotions');
        if (promotions) {
            //遍历检查
            for (let i = 0; i < promotions.length; i++) {
                if (promotions[i].fun_name == 'E团购') {
                    checkmodule['isebuy'] = 1;
                }
                if (promotions[i].fun_name == '优惠券') {
                    checkmodule['u'] = 1;
                }
                if (promotions[i].fun_name == '分享有礼') {
                    checkmodule['share'] = 1;
                }
                if (promotions[i].fun_name == '爱拼团') {
                    checkmodule['group'] = 1;
                }
            }

            _this.setData({
                fmodule: promotions,
                info: '',
                checkmodule: checkmodule
            });
        } else {
            common.getFunction(fid, app.globalData.authorizerId).then(function(data) {
                let d = data.info;
                wx.setStorageSync('promotions', d);

                //遍历检查
                for (let i = 0; i < d.length; i++) {
                    if (d[i].fun_name == 'E团购') {
                        checkmodule['isebuy'] = 1;
                    }
                    if (d[i].fun_name == '优惠券') {
                        checkmodule['u'] = 1;
                    }
                    if (d[i].fun_name == '分享有礼') {
                        checkmodule['share'] = 1;
                    }
                    if (d[i].fun_name == '爱拼团') {
                        checkmodule['group'] = 1;
                    }
                }

                _this.setData({
                    fmodule: d,
                    info: '',
                    checkmodule: checkmodule
                });
            }).catch(function(data) {
                _this.setData({
                    fmodule: false,
                    info: data
                });
            });
        }
    }

})