let app = getApp();
let common = require('../../../../common.js');
//购买数量
let buyNum = 0;
//项目ID
let pid = '';
//项目所属门店节点标识
let nodeid = '';
//购物已有项目数量
let cartNum = '';
//区分是否加入购物车还是立即购买，1为加入购物车，2为立即购买
let buyType;
// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
let storesortTime = null;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        indicatorDots: false,
        banner: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this;
        //项目ID与门店标识
        pid = options.pid;
        nodeid = options.nodeid;

        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: common.config.QQMapWXKey
        });

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        common.getProject(app.globalData.authorizerId, nodeid, pid).then(function(data) {
            let storeProjectArr = data.info;
            if (storeProjectArr) {
                //项目banner图
                let banner = storeProjectArr[0].imgurl.map(function(item) {
                    return common.config.showImgUrl + item
                });
                wx.setNavigationBarTitle({
                    title: storeProjectArr[0].project_name,
                });
                //计算门店距离
                var k = [];
                for (let i = 0; i < storeProjectArr.length; i++) {
                    common.geocoder(storeProjectArr[i].address_detail).then(function(data) {
                        common.calculateDistance([data]).then(function(data) {
                            storeProjectArr[i]['distance'] = (data / 1000).toFixed(2);
                            k.push(1);
                        }).catch(function(data) {
                            storeProjectArr[i]['distance'] = '未知';
                            k.push(2);
                        });
                    }).catch(function(data) {
                        storeProjectArr[i]['distance'] = '未知';
                        k.push(3);
                    });
                }
                //定时检查定位计算距离是否有返回，已返回清除定时器
                clearInterval(storesortTime);
                storesortTime = setInterval(function() {
                    if (k.length == storeProjectArr.length) {
                        clearInterval(storesortTime);
                        wx.hideLoading();
                        //以距离最近的门店排序
                        let projectArr = storeProjectArr.sort(common.compare('distance'));
                        _this.setData({
                            storeProject: storeProjectArr,
                            banner: banner
                        });
                    }
                }, 1200);
            } else {
                wx.showModal({
                    title: '提示',
                    content: '无项目内容',
                    showCancel: false,
                    success: function(res) {
                        if (res.confirm) {
                            wx.navigateBack();
                        }
                    }
                });
            }
        }).catch(function(data) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: data,
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            });
        });

        //用户openid是否存在
        let openid = wx.getStorageSync('openid');

        //获取购物车项目数量
        let shopCartArr = {
            'pid': pid,
            'nodeid': nodeid,
            'openid': openid,
            'type': 1
        };

        if (!openid) {
            common.getLogin(app.globalData.authorizerId).then(function(data) {
                openid = data;
                shopCartArr['openid'] = data;

                common.getShopCartNum(app.globalData.authorizerId, shopCartArr).then(function(data) {
                    cartNum = data.info;
                    buyNum = !data.info ? 0 : data.info;
                    _this.setData({
                        cartNum: cartNum,
                        nums: buyNum
                    });
                }).catch(function(data) {
                    cartNum = 0;
                    buyNum = 0;
                    _this.setData({
                        cartNum: cartNum,
                        nums: buyNum
                    });
                });
            });
        } else {
            common.getShopCartNum(app.globalData.authorizerId, shopCartArr).then(function(data) {
                cartNum = data.info;
                buyNum = !data.info ? 0 : data.info;
                _this.setData({
                    cartNum: cartNum,
                    nums: buyNum
                });
            }).catch(function(data) {
                cartNum = 1;
                buyNum = 0;
                _this.setData({
                    cartNum: cartNum,
                    nums: buyNum
                });
            });
        }

        //获取评价内容
        common.getAssess(app.globalData.authorizerId, nodeid, pid, '', 0).then(function(data) {
            if (data.info) {
                _this.setData({
                    assesData: data.info
                });
            }
        }).catch(function(data) {});

        this.setData({
            maskDisplay: 'none',
            nums: buyNum
        });
    },
    /**
     * 查看全部评论
     */
    lookAllAssess: function() {
        wx.navigateTo({
            url: '../all-assess/all-assess?nodeid=' + nodeid + '&pid=' + pid,
        });
    },
    /**
     * 点击加入购物车
     */
    pushCar: function() {
        //buyShow.call(this);
        this.addNum()
        this.determine()
        buyType = 1;
    },
    /**
     * 点击立即购买
     */
    buys: function() {
        buyNum = 1;
        this.determine()
        buyType = 2;
    },

    /**
     * 点击加入购物车确定与立即购买确定
     */
    determine: function() {
        let _this = this;
        if (!pid || !nodeid) {
            wx.showModal({
                title: '提示',
                content: '门店标识不存在',
                showCancel: false
            });
            return false;
        }

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        //用户openid
        let openid = wx.getStorageSync('openid');

        //加入购物车请求参数
        let shopCartArr = {
            'pid': pid,
            'nodeid': nodeid,
            'openid': openid,
            'num': buyNum
        };

        common.pushShopCart(app.globalData.authorizerId, shopCartArr).then(function(data) {
            wx.hideLoading();
            //buyHide.call(_this);
            cartNum = buyNum;

            _this.setData({
                cartNum: cartNum
            });
            if (buyType == 1) {
                wx.showToast({
                    title: '加入购物车成功',
                    icon: 'success',
                    mask: true
                });
            } else {
                wx.navigateTo({
                    url: '../buy-car/buy-car',
                });
            }

        }).catch(function(data) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: data,
                showCancel: false
            });
        });
    },
    /**
     * 联系门店客服
     */
    phoneCall: function (e) {
        var phone = e.currentTarget.dataset.phone
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },
    /**
	 * 地理位置
	 */
    location: function (e) {
        let locationStore = e.currentTarget.dataset.location
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
                                address: locationStore.address_detail,
                                success: function (res) {
                                    wx.hideLoading();
                                    if (res.status == 0) {
                                        console.log(res)
                                        wx.openLocation({
                                            latitude: res.result.location.lat,
                                            longitude: res.result.location.lng,
                                            name: locationStore.store_name,
                                            address: locationStore.address_detail
                                        });
                                    } else {
                                        wx.showModal({
                                            title: '提示',
                                            content: '地址解码失败',
                                            showCancel: false
                                        });
                                    }
                                },
                                fail: function (res) {
                                    wx.hideLoading();
                                    wx.showModal({
                                        title: '提示',
                                        content: '地址解码失败',
                                        showCancel: false
                                    });
                                }
                            });
                        },
                        fail: function () {
                            wx.hideLoading();
                            wx.showModal({
                                title: '提示',
                                content: '已拒绝使用地理位置，现在去设置允许使用地理位置',
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success: (res) => {
                                                if (res.authSetting['scope.userLocation']) {
                                                    wx.showLoading({
                                                        title: '加载中',
                                                        mask: true
                                                    });
                                                    qqmapsdk.geocoder({
                                                        address: locationStore.address_detail,
                                                        success: function (res) {
                                                            wx.hideLoading();
                                                            if (res.status == 0) {
                                                                wx.openLocation({
                                                                    latitude: res.result.location.lat,
                                                                    longitude: res.result.location.lng,
                                                                    name: locationStore.store_name,
                                                                    address: locationStore.address_detail
                                                                });
                                                            } else {
                                                                wx.showModal({
                                                                    title: '提示',
                                                                    content: '地址解码失败',
                                                                    showCancel: false
                                                                });
                                                            }
                                                        },
                                                        fail: function (res) {
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
                        address: locationStore.address_detail,
                        success: function (res) {
                            wx.hideLoading();
                            if (res.status == 0) {
                                wx.openLocation({
                                    latitude: res.result.location.lat,
                                    longitude: res.result.location.lng,
                                    name: locationStore.store_name,
                                    address: locationStore.address_detail
                                });
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: '地址解码失败',
                                    showCancel: false
                                });
                            }
                        },
                        fail: function (res) {
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
     * 关闭购买数量
     */
    closeBuy: function() {
        buyHide.call(this);
    },
    /**
     * 购买数量减减
     */
    lessNum: function() {
        buyNum--;
        if (buyNum <= 1) {
            buyNum = 1;
        }
        this.setData({
            nums: buyNum
        });
    },
    /**
     * 购买数量加加
     */
    addNum: function() {
        buyNum++;
        this.setData({
            nums: buyNum
        });
    },

    //去购物车购买
    tocart() {
        wx.navigateTo({
            url: '../buy-car/buy-car',
        })
    },

});
