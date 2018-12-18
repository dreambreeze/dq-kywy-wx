let app = getApp();
let common = require('../../../../common.js');
// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
let storesortTime = null;
//门店节点标识
let nodeid = '';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        banner: [],
        showImgUrl: common.config.showImgUrl
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this;
        nodeid = options.nodeid;

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: common.config.QQMapWXKey
        });

        //获取项目
        common.getProject(app.globalData.authorizerId, nodeid, '').then(function(data) {

            let storeProjectArr = data.info;
            if (storeProjectArr) {

                //项目banner图
                let banner = !storeProjectArr[0]['store_img'] ? [common.config.roomDefaultImg] : storeProjectArr[0]['store_img'].split(',');
                if (storeProjectArr[0]['store_img']) {
                    banner = banner.map(function(item) {
                        return common.config.showImgUrl + item;
                    });
                }

                wx.setNavigationBarTitle({
                    title: storeProjectArr[0].store_name,
                });

                _this.setData({
                    storeProject: storeProjectArr,
                    banner: banner
                });

                var k = [];
                //计算门店距离
                for (let i = 0; i < storeProjectArr.length; i++) {
                    common.geocoder(storeProjectArr[i].address_detail).then(function (data) {
                        common.calculateDistance([data]).then(function (data) {
                            storeProjectArr[i]['distance'] = (data / 1000).toFixed(2);
                            k.push(1);
                        }).catch(function (data) {
                            storeProjectArr[i]['distance'] = '未知';
                            k.push(2);
                        });
                    }).catch(function (data) {
                        storeProjectArr[i]['distance'] = '未知';
                        k.push(3);
                    });
                }

                //定时检查定位计算距离是否有返回，已返回清除定时器
                clearInterval(storesortTime);
                storesortTime = setInterval(function () {
                    if (k.length == storeProjectArr.length) {
                        clearInterval(storesortTime);
                        wx.hideLoading();
                        //以距离最近的门店排序
                        let projectArr = storeProjectArr.sort(common.compare('distance'));
                        _this.setData({
                            storeProject: storeProjectArr,
                        });
                    }
                }, 1200);
            } else {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '无项目内容',
                    showCancel: false
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

        //获取评价内容
        common.getAssess(app.globalData.authorizerId, nodeid, '', '', 0).then(function(data) {
            if (data.info) {
                _this.setData({
                    assesData: data.info
                });
            }
        }).catch(function(data) {});
    },
    /**
     * 查看全部评论
     */
    lookAllAssess: function() {
        wx.navigateTo({
            url: '../all-assess/all-assess?nodeid=' + nodeid,
        });
    },
    /**
     * 点击切换门店
     */
    changeStoreBtn: function() {
        wx.removeStorageSync("techdata")
        wx.removeStorageSync("roomStorage")
        wx.redirectTo({
            url: '/pages/reserve/pages/select-store/select-store?type=projectstore',
        })
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
                                        wx.openLocation({
                                            latitude: res.result.location.lat,
                                            longitude: res.result.location.lng,
                                            name: locationStore.store_name,
                                            address: locationStore.address
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
                                                        address: locationStore.address,
                                                        success: function (res) {
                                                            wx.hideLoading();
                                                            if (res.status == 0) {
                                                                wx.openLocation({
                                                                    latitude: res.result.location.lat,
                                                                    longitude: res.result.location.lng,
                                                                    name: locationStore.store_name,
                                                                    address: locationStore.address
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
                                    address: locationStore.address
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
     * 图片预览
     */
    previewImg: function(e) {
        wx.previewImage({
            urls: e.currentTarget.dataset.urlarr,
            current: e.currentTarget.dataset.currentimg,
        });
    }
})
