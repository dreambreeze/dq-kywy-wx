//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();
//所有门店
var stores;
//当前选中的门店
var sidx;
// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../../pages/common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
//定位的门店地址、距离信息
var locationStore = [];
//搜索内容
var searchVal;
//预约来源
var rtype;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        stores: stores
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        rtype = options.type;

        locationStore = [];
        var _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var currentReserveStore = wx.getStorageSync('currentReserveStore');

        common.getStores(app.globalData.authorizerId, 1).then(function(data) {
            wx.hideLoading();
            stores = data;
            //获取当前门店
            for (let i = 0; i < stores.length; i++) {
                if (stores[i].request_id == currentReserveStore[0].nodeid) {
                    sidx = i;
                }
            }
            if (!sidx) {
                sidx = 0;
            }
            _this.setData({
                stores: stores,
                sidx: sidx
            });

        }).catch(function(data) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: data,
                showCancel: false,
                success: res => {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            });
        });

        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: common.config.QQMapWXKey
        });

        searchVal = '';
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '客源无忧微信营销平台'
        }
    },

    /**
     * 点击切换门店
     */
    changeStore: function(e) {
        var sidx = e.currentTarget.dataset.sidx;
        var currStores = stores[sidx];
        console.log(currStores)

        var address = currStores.province + currStores.city + currStores.area + currStores.address_detail;
        locationStore = [];
        new Promise(function(resolve, reject) {


            var lalo = new Object
            common.geocoder(address).then(function(loca) {
                console.log(loca)
                lalo = [];
                lalo.push(loca)
                common.calculateDistance(lalo).then(function(distance) {
                    console.log(distance)
                    locationStore.push({
                        'store_name': currStores.store_name,
                        'address': address == '' ? '未设置地址' : address,
                        'tel': currStores.tel,
                        'distance': (distance / 1000).toFixed(2) + 'km',
                        'store_img': currStores.store_img == '' ? common.config.bannerImg : common.config.showImgUrl + currStores.store_img.split(',')[0],
                        'nodeid': currStores.request_id
                    });
                    resolve(locationStore);
                }).catch(function(res) {
                    console.log(res)
                    locationStore.push({
                        'store_name': currStores.store_name,
                        'address': address == '' ? '未设置地址' : address,
                        'tel': currStores.tel,
                        'distance': '未知',
                        'store_img': currStores.store_img == '' ? common.config.bannerImg : common.config.showImgUrl + currStores.store_img.split(',')[0],
                        'nodeid': currStores.request_id
                    });
                    resolve(locationStore);
                })
            }).catch(function(res) {
                locationStore.push({
                    'store_name': currStores.store_name,
                    'address': address == '' ? '未设置地址' : address,
                    'tel': currStores.tel,
                    'distance': '未知',
                    'store_img': currStores.store_img == '' ? common.config.bannerImg : common.config.showImgUrl + currStores.store_img.split(',')[0],
                    'nodeid': currStores.request_id
                });
                resolve(locationStore);
            })

        }).then(function(data) {
            //赠加缓存时间
            for (let i = 0; i < data.length; i++) {
                data[i]['cache'] = new Date().getTime();
            }

            wx.setStorageSync('currentReserveStore', data);
            if (rtype == 'projectstore') {
                wx.redirectTo({
                    url: '/pages/transbuy/pages/project-store/project-store?nodeid=' + data[0].nodeid,
                });
            }

            if (rtype == 3) {

                wx.redirectTo({
                    url: '../../../reserve/pages/reserve-project/reserve-project',
                });

            } else if (rtype == 2) {
                wx.redirectTo({
                    url: '../../../reserve/pages/reserve-room/reserve-room',
                });

            } else if (rtype == 1) {
                wx.redirectTo({
                    url: '../../../technician/pages/techindex/techindex',
                })
            }
        });


    },

    /**
     * 搜索门店
     */
    searchSubmit: function() {
        var _this = this;
        console.log(searchVal);
        wx.showLoading({
            title: '加载中',
            mask: true
        });

        var currentReserveStore = wx.getStorageSync('currentReserveStore');

        if (!searchVal) {
            common.getStores(app.globalData.authorizerId, 1).then(function(data) {
                wx.hideLoading();
                stores = data;
                //获取当前门店
                for (let i = 0; i < stores.length; i++) {
                    if (stores[i].request_id == currentReserveStore[0].nodeid) {
                        sidx = i;
                    }
                }

                _this.setData({
                    stores: stores,
                    sidx: sidx,
                    emptyMsg: false
                });

            }).catch(function(data) {
                wx.hideLoading();

                wx.showModal({
                    title: '提示',
                    content: data,
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            wx.navigateBack();
                        }
                    }
                });
            });
        } else {
            common.getStores(app.globalData.authorizerId, 1).then(function(data) {
                wx.hideLoading();
                stores = [];

                for (let i = 0; i < data.length; i++) {
                    if (common.likeFind(searchVal, data[i].store_name)) {
                        stores.push(data[i]);
                    }
                }

                if (stores.length > 0) {
                    _this.setData({
                        stores: stores,
                        sidx: -1,
                        emptyMsg: false
                    });
                } else {
                    _this.setData({
                        emptyMsg: '没有查询到数据'
                    });
                }
            }).catch(function(data) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: data,
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            wx.navigateBack();
                        }
                    }
                });
            });
        }
    },

    /**
     * 搜索门店监听输入内容
     */
    searchInput: function(e) {
        searchVal = e.detail.value;
    }
})