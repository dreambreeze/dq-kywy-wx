// 引入腾讯地图SDK核心类
const QQMapWX = require('../common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
//html 转义
var WxParse = require('../../wxParse/wxParse.js');
//全局配置
var common = require('../../common.js');
var app = getApp();
var navArr = '';
var homeArr = '';
//首页顶部门店banner图
var banner = [];
//门店节点标识
let ShopNo = '';
//房号
let RoomNo = '';
//定位的门店地址、距离信息
var locationStore = [];
//呼叫服务显隐
var maskDisplay = 'none'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        banner: banner,
        maskDisplay: maskDisplay,
        couponmaskDisplay: 'hidden',
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //2018-12版本默认图片地址前缀,
        newDefaultImg: common.config.newDefaultImg,
        //导航tabBar
        navTabBar: common.config.navTabBar,
        //功能模块加载中
        info: '加载中...',
        indicatorDots: false,
        autoplay: true,
        interval: 2500,
        duration: 500,
        selected: 1,
        bannerList: {},
        banner: [{
            picurl: '../../images/index_banner@2x.png',
            staffworkno: 1
        }],
        imgurl: common.config.showImgUrl,

        // 服务列表
        functionList: [{
            jumpName: 'scancode',
            src: '../../images/index_features_01@2x.png',
            name: "扫码下单",
        }, {
            jumpName: 'showService',
            src: '../../images/index_features_02@2x.png',
            name: "呼叫服务",
        }, {
            jumpName: '',
            src: '../../images/index_features_03@2x.png',
            name: "预约理疗师",
            url: '../technician/pages/techindex/techindex'
        }, {
            jumpName: '',
            src: '../../images/index_features_04@2x.png',
            name: "房间预约",
            url: '../reserve/pages/reserve-room/reserve-room'
        }, {
            jumpName: '',
            src: '../../images/index_features_05@2x.png',
            name: "店面评价",
            url: '../reserve/pages/store-assess/store-assess'
        }],

        //资讯列表
        noticeList: [],
        showNotice: false,
        //团购优惠
        projectList: [],
        //拼团活动
        groupList: [],
        //推荐默认
        recommendListFst: [{
            staffname: "获得高级按摩师认证"
        }],
        recommendListSed: [{
            serviceitemname: "经典足浴"
        }],
        recommendListThid: [{
            MembershipTypeName: "会员充值 乐享优惠"
        }],
        data: {}
    },
    bindchange: function(e) {
        this.setData({
            selected: e.detail.currentItemId
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var locationData = wx.getStorageSync('currentReserveStore');
        if (locationData && undefined != locationData[0].nodeid) {
            this.setData({
                nodeid: locationData[0].nodeid ? locationData[0].nodeid : ''
            })
            this.getRecommend();
        }
        this.getNoticeList();
        this.getBannerList();
        this.getProject();
        this.getGroupList();

        //查看是否呼叫服务
        maskDisplay = options.maskDisplay
        if (maskDisplay == 'block') {
            this.setData({
                maskDisplay: maskDisplay,
                donaldshowIn: 'donaldshowIn',
                donaldconshowIn: 'donaldconshowIn'
            })
        }

        //加载小程序标题
        common.getAppletInfo(app.globalData.authorizerId).then(function(data) {
            wx.setNavigationBarTitle({
                title: data.info.nick_name,
            });

        }).catch(function(data) {
            wx.setNavigationBarTitle({
                title: '',
            });
        });

        //开启 sharetickets
        wx.showShareMenu({
            withShareTicket: true
        });

        let _this = this;

        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: common.config.QQMapWXKey
        });

        //扫描门店房间二维码记录门店标识与房号

        let sceneStr = decodeURIComponent(options.scene);

        if (sceneStr != 'undefined') {
            let sceneArr = sceneStr.split('@');
            ShopNo = sceneArr[0].split('=')[1];
            RoomNo = sceneArr[1].split('=')[1];
            //门店房号数据存储在本地
            wx.setStorageSync('ShopNoRoomNo', sceneStr);
        }

        //获取本地storage保存的openid
        var openid = wx.getStorageSync('openid');
        if (!openid) {
            common.getLogin(app.globalData.authorizerId).then(function(data) {
                openid = data
                //检查是否有可发的券
                common.haveCoupons(app.globalData.authorizerId, openid).then(function(data) {
                    if (data.status == 1) {
                        _this.setData({
                            has: data.has,
                            couponmaskDisplay: 'visiable',
                        })
                    } else {
                        _this.setData({
                            couponmaskDisplay: 'hidden',
                        });
                    }
                }).catch(function(data) {
                    _this.setData({
                        couponmaskDisplay: 'hidden',
                    })
                })
                common.getUInfo('names,phone', app.globalData.authorizerId, openid).then(function(data) {
                    wx.hideLoading();
                    wx.setStorageSync("phoneinfo", data.info)
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

                wx.setStorageSync("phoneinfo", data.info)

                //检查是否有可发的券
                common.haveCoupons(app.globalData.authorizerId, openid).then(function(data) {
                    if (data.status == 1 && maskDisplay != 'block') {
                        _this.setData({
                            has: data.has,
                            couponmaskDisplay: 'visiable',
                        })
                    } else {
                        _this.setData({
                            couponmaskDisplay: 'hidden',
                        });
                    }
                }).catch(function(data) {
                    _this.setData({
                        couponmaskDisplay: 'hidden',
                    })
                })
            }).catch(function(data) {

                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: data.message ? data.message : data,
                    showCancel: false
                });
            });
        }

        //自动屏幕高
        var query = wx.createSelectorQuery();
        var minHeight = 0;

        query.selectViewport().boundingClientRect(function(rect) {
            minHeight = rect.height;
        }).exec(function() {
            _this.setData({
                minHeight: minHeight + 'px'
            });
        });



        //加载呼叫服务内容
        wx.request({
            url: common.config.host + '/index.php/Api/Requestdata/getCallservice',
            data: {
                'authorizerId': app.globalData.authorizerId
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                if (res.statusCode == 200) {
                    if (res.data.status == 1) {
                        _this.setData({
                            callService: res.data.info
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
                        content: '请求错误',
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


        //检查是否有需要退单的拼团
        common.groupRefound(app.globalData.authorizerId);
        //检查是否有权限使用
        common.isExpiredTime(app.globalData.authorizerId).catch(function() {
            wx.reLaunch({
                url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=小程序使用权限已过期&notJump=1',
            });
        });


        //检查是否已发券
        // common.sendCoupons(app.globalData.authorizerId,openid).catch(){
        // }
    },
    //获取banner列表
    getBannerList() {
        let _this = this;
        common.getBanner(app.globalData.authorizerId, 1).then(function(data) {

            if (data.info) {
                _this.setData({
                    bannerList: data.info
                })
            }

        }).catch(function(data) {

        })
    },
    //获取菜单列表
    getfmoduleList() {
        let _this = this;
        //加载首页后台分配的功能模块
        let fid = common.config.navTabBar[0].id;
        let homeNav = wx.getStorageSync('homeNav');

        if (homeNav) {
            _this.setData({
                fmodule: homeNav,
                info: ''
            });
        } else {
            common.getFunction(fid, app.globalData.authorizerId, 1).then(function(data) {
                wx.setStorageSync('homeNav', data.info);
                _this.setData({
                    fmodule: data.info,
                    info: ''
                });
            }).catch(function(data) {
                _this.setData({
                    fmodule: false,
                    info: data
                });
            });
        }
    },
    /**
     * 去除空格
     */
    Trim(str, is_global) {
        var result;
        result = str.replace(/(^\s+)|(\s+$)/g, "");
        if (is_global.toLowerCase() == "g") {
            result = result.replace(/\s/g, "");
        }
        return result;
    },
    //获得资讯
    getNoticeList() {
        let _this = this;
        common.getNotice(app.globalData.authorizerId, 1).then(function(data) {
            let noticeList = data.info
            for (let i = 0; i < noticeList.length; i++) {
                noticeList[i].textDesc = noticeList[i].desc.replace(/<[^>]+>|&[^>]+;/g, "").replace(/\s/g, "")
            }
            _this.setData({
                noticeList: noticeList
            })
        }).catch(function(data) {});
    },
    showNotice(e) {
        var noticeMsg = e.currentTarget.dataset.desc
        this.setData({
            showNotice: true,
            noticeMsg: noticeMsg
        })
        WxParse.wxParse('noticeMsg', 'html', noticeMsg, this);
    },
    handleNotice() {
        this.setData({
            showNotice: false
        })
    },
    //获取团购优惠
    getProject() {
        let _this = this;
        common.getProject(app.globalData.authorizerId, '', '', '', '', '').then(function(data) {
            let projectArr = [];
            for (let i = 0; i < data.info.length; i++) {
                for (let j = 0; j < data.info[i].project.length; j++) {
                    projectArr.push(data.info[i].project[j])
                }
            }
            _this.setData({
                projectArr: data.info
            })
        })
    },
    //拼团列表
    getGroupList() {
        let _this = this;
        common.getGroupShopping(app.globalData.authorizerId, '', '', '', '', '', '').then(function(data) {
            _this.setData({
                grouptArr: data.info,
            })
        })
    },
    /**
     * 跳转至详情页
     */
    todetail: function(e) {
        let pid = e.currentTarget.dataset.pid
        let nodeid = e.currentTarget.dataset.nodeid
        wx.navigateTo({
            url: './transbuy/pages/group-detail/group-detail?pid=' + pid + '&nodeid=' + nodeid,
        })
    },
    //获取推荐
    getRecommend() {
        let _this = this;
        common.getRecommend(app.globalData.authorizerId, _this.data.nodeid).then(function(data) {
            _this.setData({
                recommendList: data
            })
        }).catch(function(data) {});
    },
    /**
     * 监听页面分享  单聊不可获取shareTickets   群聊可以
     */
    onShareAppMessage: function(options) {
        let that = this;
        var sharefrom = options.from

        let title = that.data.title ? that.data.title : ""
        if (sharefrom == "menu") { //button：页面内转发按钮；menu：右上角转发菜单
            sharefrom = "menu"
        } else {
            sharefrom = "button"
        }
        var shareObj = new Object

        shareObj = {
            title: title,
            url: "pages/index/index",
            success: function(res) {

                if (res.shareTickets) { //群聊
                    wx.getShareInfo({
                        shareTicket: res.shareTickets[0],
                        success: function(res) {},
                        fail: function(res) {},
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
                    // wx.showModal({
                    //   title: '提示',
                    //   content: data,
                    //   showCancel: false
                    // });
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
     * 点击显示呼叫服务
     */
    showService: function() {
        let ShopNoRoomNo = wx.getStorageSync('ShopNoRoomNo');
        if (!ShopNoRoomNo) {
            wx.showModal({
                title: '提示',
                content: '门店标识与房号不存在，请扫描桌面二维码',
                showCancel: true,
                success: function(re) {
                    if (re.confirm) {
                        wx.scanCode({
                            onlyFromCamera: true,
                            success: function(res) {
                                if (res.path) {
                                    try {
                                        var path = decodeURIComponent(res.path).split("?")
                                        var newpath = path[0]
                                        var ShopNoRoomNo = path[1].substr(6, path[1].length - 1)
                                        wx.setStorageSync("ShopNoRoomNo", ShopNoRoomNo)
                                        wx.reLaunch({
                                            url: '/' + res.path + '&maskDisplay=block',
                                        });
                                    } catch (e) {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取地址失败，无法跳转',
                                            showCancel: false
                                        });
                                    }
                                } else {
                                    wx.showModal({
                                        title: '提示',
                                        content: '获取地址失败，无法跳转',
                                        showCancel: false
                                    });
                                }
                            },
                            fail: function(res) {
                                wx.showModal({
                                    title: '提示',
                                    content: '调起客户端扫码界面失败',
                                    showCancel: false
                                })
                            }
                        });
                    }
                }
            });

        } else {
            this.setData({
                maskDisplay: 'block',
                donaldshowIn: 'donaldshowIn',
                donaldconshowIn: 'donaldconshowIn'
            });
        }
    },
    /**
     * 点击隐藏呼叫服务
     */
    hideService: function() {
        this.setData({
            maskDisplay: 'none',
            donaldshowIn: 'donaldshowOut',
            donaldconshowIn: 'donaldconshowOut'
        });
    },
    /**
     * 联系门店客服
     */
    phoneCall: function(e) {
        var phone = e.currentTarget.dataset.phone
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },
    /**
     * 地理位置
     */
    location: function() {
        wx.getSetting({
            success(res) {
                wx.showLoading({
                    title: '加载中',
                    mask: true
                });

                if (!res.authSetting['scope.userLocation']) {
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success(res) {
                            // 用户已经同意
                            qqmapsdk.geocoder({
                                address: locationStore[0].address,
                                success: function(res) {
                                    wx.hideLoading();
                                    if (res.status == 0) {
                                        wx.openLocation({
                                            latitude: res.result.location.lat,
                                            longitude: res.result.location.lng,
                                            name: locationStore[0].store_name,
                                            address: locationStore[0].address
                                        });
                                    } else {
                                        wx.showModal({
                                            title: '提示',
                                            content: '地址解码失败',
                                            showCancel: false
                                        });
                                    }
                                },
                                fail: function(res) {
                                    wx.hideLoading();
                                    wx.showModal({
                                        title: '提示',
                                        content: '地址解码失败',
                                        showCancel: false
                                    });
                                }
                            });
                        },
                        fail: function() {
                            wx.hideLoading();
                            wx.showModal({
                                title: '提示',
                                content: '已拒绝使用地理位置，现在去设置允许使用地理位置',
                                success: function(res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success: (res) => {
                                                if (res.authSetting['scope.userLocation']) {
                                                    wx.showLoading({
                                                        title: '加载中',
                                                        mask: true
                                                    });
                                                    qqmapsdk.geocoder({
                                                        address: locationStore[0].address,
                                                        success: function(res) {
                                                            wx.hideLoading();
                                                            if (res.status == 0) {
                                                                wx.openLocation({
                                                                    latitude: res.result.location.lat,
                                                                    longitude: res.result.location.lng,
                                                                    name: locationStore[0].store_name,
                                                                    address: locationStore[0].address
                                                                });
                                                            } else {
                                                                wx.showModal({
                                                                    title: '提示',
                                                                    content: '地址解码失败',
                                                                    showCancel: false
                                                                });
                                                            }
                                                        },
                                                        fail: function(res) {
                                                            wx.hideLoading();
                                                            wx.showModal({
                                                                title: '提示',
                                                                content: '地址解码失败',
                                                                showCancel: false
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    }
                                }
                            });
                        }
                    });
                } else {
                    wx.showLoading({
                        title: '加载中',
                        mask: true
                    });
                    qqmapsdk.geocoder({
                        address: locationStore[0].address,
                        success: function(res) {
                            wx.hideLoading();
                            if (res.status == 0) {
                                wx.openLocation({
                                    latitude: res.result.location.lat,
                                    longitude: res.result.location.lng,
                                    name: locationStore[0].store_name,
                                    address: locationStore[0].address
                                });
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: '地址解码失败',
                                    showCancel: false
                                });
                            }
                        },
                        fail: function(res) {
                            wx.hideLoading();
                            wx.showModal({
                                title: '提示',
                                content: '地址解码失败',
                                showCancel: false
                            });
                        }
                    });
                }
            }
        });
    },

    /**
     * 获取所有门店信息
     */
    getStores: function() {
        var that = this
        var p = new Promise(function(resolve, reject) {
            //获取所有门店信息
            wx.request({
                url: common.config.host + '/Api/Base/getStores',
                data: {
                    'authorizerId': app.globalData.authorizerId,
                    'geocoder': 1
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function(res) {
                    //返回成功
                    if (res.statusCode == 200) {
                        if (res.data.status == 1) {
                            let stores = res.data.info;
                            that.setData({
                                stores: stores
                            });

                            resolve(stores);
                        } else {
                            reject(res.data.info);
                        }

                    } else {
                        reject('请求失败');
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
        });
        return p;
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
     * 扫码下单
     */
    scancode: function() {
        let _this = this;
        //门店与房间号是否存在
        let sceneStr = wx.getStorageSync('ShopNoRoomNo');
        if (!sceneStr) {
            wx.scanCode({
                onlyFromCamera: true,
                scanType: [],
                success: function(res) {
                    if (res.path) {
                        try {
                            var path = decodeURIComponent(res.path).split("?")
                            var newpath = path[0]
                            var ShopNoRoomNo = path[1].substr(6, path[1].length - 1)
                            wx.setStorageSync("ShopNoRoomNo", ShopNoRoomNo)
                            wx.navigateTo({
                                url: '/pages/automina/pages/detail/detail',
                            })
                        } catch (e) {
                            wx.showModal({
                                title: '提示',
                                content: '获取地址失败，无法跳转',
                                showCancel: false
                            });
                        }
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '获取地址失败，无法跳转',
                            showCancel: false
                        });
                    }
                },
                fail: function(res) {
                    wx.navigateBack({
                        delta: 1
                    })
                },
                complete: function(res) {},
            })
        } else {
            wx.navigateTo({
                url: '/pages/automina/pages/detail/detail',
            })
        }
    },
    /**
     * 受理呼叫服务
     */
    serveracceptance: function(e) {
        let _this = this;
        //门店与房间号是否存在
        let sceneStr = wx.getStorageSync('ShopNoRoomNo');
        if (!sceneStr) {
            wx.showModal({
                title: '提示',
                content: '门店标识与房号不存在，请扫描桌面二维码',
                showCancel: true,
                success: function(re) {
                    if (re.confirm) {
                        wx.scanCode({
                            onlyFromCamera: true,
                            success: function(res) {
                                if (res.path) {
                                    try {
                                        var path = decodeURIComponent(res.path).split("?")
                                        var newpath = path[0]
                                        var ShopNoRoomNo = path[1].substr(6, path[1].length - 1)
                                        wx.setStorageSync("ShopNoRoomNo", ShopNoRoomNo)
                                        wx.reLaunch({
                                            url: '/' + res.path,
                                        });
                                    } catch (e) {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取地址失败，无法跳转',
                                            showCancel: false
                                        });
                                    }
                                } else {
                                    wx.showModal({
                                        title: '提示',
                                        content: '获取地址失败，无法跳转',
                                        showCancel: false
                                    });
                                }
                            },
                            fail: function(res) {
                                wx.showModal({
                                    title: '提示',
                                    content: '调起客户端扫码界面失败',
                                    showCancel: false
                                })
                            }
                        });
                    }
                }
            });
            return false;
        }

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        let sceneArr = sceneStr.split('@');
        ShopNo = sceneArr[0].split('=')[1];
        RoomNo = sceneArr[1].split('=')[1];

        //服务名称
        let voiceName = e.currentTarget.dataset.voice;

        //获取手机设备信息
        let systemInfo = '';
        try {
            let res = wx.getSystemInfoSync();
            systemInfo = res.model;
        } catch (e) {
            systemInfo = '未知（获取失败）'
        }

        //获取openid
        let openid = wx.getStorageSync('openid');

        //下服务
        wx.request({
            url: common.config.host + '/Api/Requestdata/serveracceptance',
            data: {
                'authorizerId': app.globalData.authorizerId,
                'ShopNo': ShopNo,
                'RoomNo': RoomNo,
                'voiceName': voiceName,
                'systemInfo': systemInfo,
                'openid': openid
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                if (res.statusCode == 200) {
                    wx.hideLoading();
                    if (res.data.status == 1) {
                        wx.showModal({
                            title: '提示',
                            content: '您呼叫的服务已受理成功，请稍等',
                            showCancel: false,
                            success: function(r) {
                                if (r.confirm) {
                                    _this.setData({
                                        maskDisplay: 'none',
                                        donaldshowIn: 'donaldshowOut',
                                        donaldconshowIn: 'donaldconshowOut'
                                    });
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
     * 监听页面显示
     */
    onShow: function() {
        let _this = this;

        var test = wx.getStorageSync('test');
        if (test) {
            wx.navigateTo({
                url: '/pages/reserve/pages/reserve-project/reserve-project',
                success: function() {
                    wx.removeStorageSync('test');
                }
            });
        }

        locationStore = wx.getStorageSync('currentReserveStore');

        if (locationStore) {
            _this.setData({
                locationStore: locationStore
            });
        } else {
            _this.getStores().then(
                function(data) {
                    //获取定位
                    new Promise(function(resolve, reject) {
                        locationStore = [];
                        let stores = _this.data.stores;
                        for (let i = 0; i < stores.length; i++) {
                            var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;
                            common.geocoder(address).then(function(loca) {
                                var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;
                                common.calculateDistance([loca]).then(function(distance) {
                                    locationStore.push({
                                        'store_name': stores[i].store_name,
                                        'address': address == '' ? '未设置地址' : address,
                                        'tel': stores[i].tel,
                                        'distance': (distance / 1000).toFixed(2) + 'km',
                                        'juli': distance,
                                        'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                                        'nodeid': stores[i].request_id
                                    });

                                    resolve(locationStore);
                                }).catch(function(res) {
                                    locationStore.push({
                                        'store_name': stores[i].store_name,
                                        'address': address == '' ? '未设置地址' : address,
                                        'juli': 9999999,
                                        'tel': stores[i].tel,
                                        'distance': '未知',
                                        'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                                        'nodeid': stores[i].request_id
                                    });

                                    resolve(locationStore);
                                })
                            }).catch(function(res) {
                                locationStore.push({
                                    'store_name': stores[i].store_name,
                                    'address': address == '' ? '未设置地址' : address,
                                    'tel': stores[i].tel,
                                    'distance': '未知',
                                    'juli': 9999999,
                                    'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                                    'nodeid': stores[i].request_id
                                });
                                resolve(locationStore);
                            })
                        }
                    }).then(function(data) {
                        let timer = null;
                        clearTimeout(timer);

                        timer = setTimeout(function() {
                            locationStore.sort(function(obj1, obj2) {
                                var val1 = obj1.juli
                                var val2 = obj2.juli

                                if (val1 < val2) {
                                    return -1;
                                } else if (val1 > val2) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            //赠加缓存时间
                            for (let i = 0; i < locationStore.length; i++) {
                                locationStore[i]['cache'] = new Date().getTime();
                            }

                            wx.setStorageSync('currentReserveStore', locationStore);
                            _this.setData({
                                locationStore: locationStore
                            });
                        }, 1000);
                    });
                }
            ).catch(function(reason) {
                wx.showModal({
                    title: '提示',
                    content: '获取门店信息失败',
                    showCancel: false
                });
            });
        }
    },
    /**
     * 页面跳转
     */
    jumpPage: function(e) {
        let url = e.currentTarget.dataset.url;
        let opened = e.currentTarget.dataset.opened;
        let funname = e.currentTarget.dataset.funname;
        //是否开通
        if (opened == 0) {
            wx.showModal({
                title: '提示',
                content: '功能暂未开通',
                showCancel: false
            });
            return false;
        }


        //是否呼叫服务
        if (funname == '呼叫服务') {
            let ShopNoRoomNo = wx.getStorageSync('ShopNoRoomNo');
            if (!ShopNoRoomNo) {
                wx.showModal({
                    title: '提示',
                    content: '门店标识与房号不存在，请扫描桌面二维码',
                    showCancel: true,
                    success: function(re) {
                        if (re.confirm) {
                            wx.scanCode({
                                onlyFromCamera: true,
                                success: function(res) {
                                    if (res.path) {
                                        try {
                                            var path = decodeURIComponent(res.path).split("?")
                                            var newpath = path[0]
                                            var ShopNoRoomNo = path[1].substr(6, path[1].length - 1)
                                            wx.setStorageSync("ShopNoRoomNo", ShopNoRoomNo)
                                            wx.reLaunch({
                                                url: '/' + res.path,
                                            });
                                        } catch (e) {
                                            wx.showModal({
                                                title: '提示',
                                                content: '获取地址失败，无法跳转',
                                                showCancel: false
                                            });
                                        }
                                    } else {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取地址失败，无法跳转',
                                            showCancel: false
                                        });
                                    }
                                },
                                fail: function(res) {
                                    wx.showModal({
                                        title: '提示',
                                        content: '调起客户端扫码界面失败',
                                        showCancel: false
                                    })
                                }
                            });
                        }
                    }
                });

            } else {
                this.setData({
                    maskDisplay: 'block',
                    donaldshowIn: 'donaldshowIn',
                    donaldconshowIn: 'donaldconshowIn'
                });
            }
        } else if (funname == '预约理疗师' || funname == '预约房间') {

            var appid = app.globalData.authorizerId
            //华天富足人生特殊需求，wx03d70af5b6faa4ac 后台设置 是否开启判别会员服务（在门店有会员卡）

            var phone = wx.getStorageSync('phoneinfo').phone
            if (appid && phone) {
                common.isVip(appid, phone).then(function(data) {
                    if (data.status == 0) {
                        if (!url) {
                            return false;
                        }

                        wx.navigateTo({
                            url: url,
                        });
                    } else {

                        wx.showModal({
                            title: '提示',
                            content: '未查询到您的会员卡，请前往会员中心办理会员卡',
                            showCancel: false
                        })
                        return false;
                    }
                }).catch(function(data) {

                });
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '未获取到手机号码，请稍候重试~',
                })
                return false;
            }
        } else {
            if (!url) {
                return false;
            }
            wx.navigateTo({
                url: url,
            });
        }
    },

    /**
     * 点击隐藏领券
     */
    hidecouponmask: function() {
        this.setData({
            couponmaskDisplay: 'hidden',
        });
    },
    //点击领券
    sendcoupon() {
        var that = this
        var openid = wx.getStorageSync('openid')
        var has = that.data.has
        common.sendCoupon(app.globalData.authorizerId, openid, has).then(function(data) {
            if (data.status == 1) {
                wx.showModal({
                    title: '提示',
                    content: '恭喜您获得了优惠券，可去我的券包查看',
                    showCancel: false
                })
            }
            that.setData({
                couponmaskDisplay: 'hidden',
            });
        }).catch(function(data) {
            that.setData({
                couponmaskDisplay: 'hidden',
            });
        });
    }

})