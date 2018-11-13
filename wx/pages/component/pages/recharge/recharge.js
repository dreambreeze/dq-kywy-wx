var app = getApp();
var common = require('../../../../common.js');
// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../../pages/common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;

var height = 0,
    dcH = 0,
    dcStoreList = [],
    cardType = [],
    cardTypeData = [];
//门店电话和地址
var shopInfo = {};
//用户姓名/手机号
var names, phone;
var storesortTime = null;
let siH = 0;
let dcSHeight = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dcStore: dcStoreList,
        storeIdx: 0,
        showMask: false,
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //无会员卡图片的默认会员卡图
        cardPicUrl: common.config.cardPicUrl,
        //所有卡类型
        cardType: cardType,
        //门店电话和地址
        shopInfo: shopInfo
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var _this = this;

        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: common.config.QQMapWXKey
        });

        if (wx.canIUse('createSelectorQuery')) {
            var query = wx.createSelectorQuery();
            query.select('.dc-title').boundingClientRect(function(res) {
                if (res) {
                    dcH = res.height;
                }
            }).exec();

            query.select('.s-info').boundingClientRect(function(res) {
                siH = res ? res.height : 0;
            }).exec();

            setTimeout(function() {
                wx.getSystemInfo({
                    success: function(res) {
                        height = res.windowHeight - dcH;
                        dcSHeight = res.windowHeight - dcH - siH;
                        _this.setData({
                            height: height,
                            dcSHeight: dcSHeight
                        });
                    }
                });
            }, 1000);
        }

        this.getOpenCardType();
    },
    /**
     * 点击切换门店会员卡
     */
    changeStore: function(e) {
        //获取门店电话和地址
        shopInfo = {
            shoptel: cardTypeData[dcStoreList[e.target.dataset.index]][0].shoptel,
            address: cardTypeData[dcStoreList[e.target.dataset.index]][0].address,
            storename: dcStoreList[e.target.dataset.index]
        }

        for (var i = 0; i < cardTypeData[dcStoreList[e.target.dataset.index]].length; i++) {
            cardTypeData[dcStoreList[e.target.dataset.index]][i]['Balance'] = (parseFloat(cardTypeData[dcStoreList[e.target.dataset.index]][i].CardNum) + parseFloat(cardTypeData[dcStoreList[e.target.dataset.index]][i].SendNum));
        }

        this.setData({
            storeIdx: e.target.dataset.index,
            cardType: cardTypeData[dcStoreList[e.target.dataset.index]],
            //获取门店电话和地址
            shopInfo: shopInfo
        });
    },

    /**
     * 获取当前用户所有卡类型
     */
    getOpenCardType: function() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var openid = wx.getStorageSync('openid'),
            _this = this;

        wx.request({
            url: common.config.host + '/index.php/Api/Base/getVipCard',
            data: {
                'authorizerId': app.globalData.authorizerId,
                'openid': openid,
                'type': 2,
                'isstoresort': 1
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode == 200) {
                    if (res.data.status == 1) {
                        if (res.data.info == '') {
                            wx.showModal({
                                title: '提示',
                                content: '您还没有会员卡，现在去办卡',
                                success: function(e) {
                                    if (e.confirm) {
                                        wx.redirectTo({
                                            url: '../docard/docard?id=3',
                                        });
                                    } else if (e.cancel) {
                                        wx.navigateBack();
                                    }
                                }
                            });
                        } else {
                            //获取会员卡数据以切换门店使用
                            cardTypeData = res.data.info;

                            //如果只有一个门店，就不需要获取定位距离最近的门店展示在最前面
                            if (Object.keys(cardTypeData).length > 1) {
                                //获取门店地址
                                var addressArr = [];
                                for (var item in cardTypeData) {
                                    addressArr.push({
                                        'address': cardTypeData[item][0].address,
                                        'distance': '999999',
                                        'storename': item
                                    });
                                }

                                console.log(addressArr);

                                var k = [];

                                //计算门店距离
                                for (let i = 0; i < addressArr.length; i++) {
                                    common.geocoder(addressArr[i].address).then(function(data) {
                                        common.calculateDistance([data]).then(function(data) {
                                            addressArr[i]['distance'] = data;
                                            k.push(1);
                                        }).catch(function(data) {
                                            addressArr[i]['distance'] = '999999';
                                            k.push(2);
                                        });
                                    }).catch(function(data) {
                                        addressArr[i]['distance'] = '999999';
                                        k.push(3);
                                    });
                                }

                                //定时检查定位计算距离是否有返回，已返回清除定时器
                                clearInterval(storesortTime);
                                storesortTime = setInterval(function() {
                                    if (k.length == addressArr.length) {
                                        clearInterval(storesortTime);
                                        wx.hideLoading();

                                        //以距离最近的门店排序
                                        addressArr = addressArr.sort(common.compare('distance'));

                                        //获取门店列表
                                        dcStoreList = [];
                                        for (let i = 0; i < addressArr.length; i++) {
                                            dcStoreList.push(addressArr[i].storename);
                                        }


                                        //获取门店电话和地址
                                        shopInfo = {
                                            shoptel: cardTypeData[addressArr[0].storename][0].shoptel,
                                            address: cardTypeData[addressArr[0].storename][0].address,
                                            storename: dcStoreList[0]
                                        }
                                        //充值金额与赠送金额合计成余额
                                        for (var i = 0; i < cardTypeData[addressArr[0].storename].length; i++) {
                                            cardTypeData[addressArr[0].storename][i]['Balance'] = (parseFloat(cardTypeData[addressArr[0].storename][i].CardNum) + parseFloat(cardTypeData[addressArr[0].storename][i].SendNum));
                                        }

                                        //用户姓名与手机号
                                        names = res.data.names;
                                        phone = res.data.phone;

                                        _this.setData({
                                            dcStore: dcStoreList,
                                            cardType: cardTypeData[addressArr[0].storename],
                                            shopInfo: shopInfo
                                        });

                                    }
                                }, 1200);
                            } else {
                                wx.hideLoading();
                                //获取门店列表
                                dcStoreList = [];
                                for (var item in cardTypeData) {
                                    dcStoreList.push(item);
                                }


                                //获取门店电话和地址
                                shopInfo = {
                                    shoptel: cardTypeData[dcStoreList[0]][0].shoptel,
                                    address: cardTypeData[dcStoreList[0]][0].address,
                                    storename: dcStoreList[0]
                                }
                                //充值金额与赠送金额合计成余额
                                for (var i = 0; i < cardTypeData[dcStoreList[0]].length; i++) {
                                    cardTypeData[dcStoreList[0]][i]['Balance'] = (parseFloat(cardTypeData[dcStoreList[0]][i].CardNum) + parseFloat(cardTypeData[dcStoreList[0]][i].SendNum));
                                }

                                //用户姓名与手机号
                                names = res.data.names;
                                phone = res.data.phone;

                                _this.setData({
                                    dcStore: dcStoreList,
                                    cardType: cardTypeData[dcStoreList[0]],
                                    shopInfo: shopInfo
                                });
                            }
                        }
                    } else {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                            showCancel: false
                        });
                    }
                } else {
                    wx.hideLoading();
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
                        showCancel: false,
                        success: res => {
                            if (res.confirm) {
                                wx.navigateBack();
                            }
                        }
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '请求失败',
                        showCancel: false,
                        success: res => {
                            if (res.confirm) {
                                wx.navigateBack();
                            }
                        }
                    });
                }
            }
        });
    },

    /**
     * 点击跳转至充值
     */
    jumpurl: function(e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url,
        });
    },

    /**
     * 打电话
     */
    callphone: function(e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.tel
        });
    },

    /**
     * 点击导航
     */
    location: function(e) {
        var address = e.currentTarget.dataset.address;
        var storename = e.currentTarget.dataset.sname;
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
                                address: address,
                                success: function(res) {
                                    wx.hideLoading();
                                    if (res.status == 0) {
                                        wx.openLocation({
                                            latitude: res.result.location.lat,
                                            longitude: res.result.location.lng,
                                            name: storename,
                                            address: address
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
                                                        address: address,
                                                        success: function(res) {
                                                            wx.hideLoading();
                                                            if (res.status == 0) {
                                                                wx.openLocation({
                                                                    latitude: res.result.location.lat,
                                                                    longitude: res.result.location.lng,
                                                                    name: storename,
                                                                    address: address
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
                        address: address,
                        success: function(res) {
                            wx.hideLoading();
                            if (res.status == 0) {
                                wx.openLocation({
                                    latitude: res.result.location.lat,
                                    longitude: res.result.location.lng,
                                    name: storename,
                                    address: address
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
    }
})