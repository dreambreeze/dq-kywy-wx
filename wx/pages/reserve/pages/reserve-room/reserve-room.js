// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../../pages/common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();

var pmoff = true;
var tmoff = true;
var downX = 0;
var oUlLeft = 0;
var roomPeopleNumW = 0;
var roomPeopleTouchW = 0;
var leftval = 0;

var downXT = 0;
var oUlLeftT = 0;
var roomTypeNumW = 0;
var roomTypeTouchW = 0;
var leftvalT = 0;
//定位的门店地址、距离信息
var locationStore = [];
//需要计算的距离纬度经度
var latLng = [];
//所有门店信息
let stores;
//定时执行时间
var timer = null;
//所有房间信息
var roomData;
//当前第几页
var currPage = 0;
//一页显示多少条
var totalPage = 0;
//加载状态
var loadState = true;
//房间类型数据
var roomTypeRow = [];
//房间人数数据
var roomNumRow;
//当前选中房间人数数据
var roomNumIdx = -1;
//当前选中房间类型数据
var roomTypeIdx = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        maskDisplay: 'none',
        roomArr: [0, 1, 2, 3, 4],
        pmoff: pmoff,
        tmoff: tmoff,
        roomPLeft: 0,
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //无项目图片的默认项目图
        roomDefaultImg: common.config.roomDefaultImg,
        //上拉加载更多的文本提示
        loadMtext: '',
        //房间类型数据
        roomTypeRow: roomTypeRow,
        //房间人数数据
        roomNumRow: roomNumRow,
        //点击切换选择房间类型
        roomTypeIdx: roomTypeIdx,
        //点击切换选择房间人数
        roomNumIdx: roomNumIdx,
        //人数房间类型高度
        numTypeBoxHeight: '80rpx',
        numTypeBoxMaxHeight: '80rpx',
        //项目房间类型高度
        projectTypeBoxHeight: '80rpx',
        projectTypeBoxMaxHeight: '80rpx',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var query = wx.createSelectorQuery();
        let _this = this;

        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: common.config.QQMapWXKey
        });

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        //定位缓存大于1小时就删除缓存
        var currStoreCache = wx.getStorageSync('currentReserveStore');

        if (currStoreCache) {
            var currTime = new Date().getTime() - 3600000;
            if (currStoreCache[0].cache < currTime) {
                wx.removeStorageSync('currentReserveStore');
            }
        }
        //所有房间数据
        roomData = [];

        roomNumIdx = -1;

        roomTypeIdx = 0;

        locationStore = wx.getStorageSync('currentReserveStore');
        new Promise(function(resolve, reject) {
            if (locationStore) {
                resolve(1);
                _this.setData({
                    locationStore: locationStore
                });
            } else {
                _this.getStores().then(
                    function(data) {
                        //获取定位
                        new Promise(function(resolve, reject) {
                            locationStore = [];
                            for (let i = 0; i < stores.length; i++) {
                                var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;
                                var lalo = new Object
                                common.geocoder(address).then(function(loca) {
                                    var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;
                                    lalo = [];
                                    lalo.push(loca)
                                    common.calculateDistance(lalo).then(function(distance) {
                                        var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;
                                        locationStore.push({
                                            'store_name': stores[i].store_name,
                                            'address': address == '' ? '未设置地址' : address,
                                            'tel': stores[i].tel,
                                            'distance': (distance / 1000).toFixed(2) + 'km',
                                            'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                                            'nodeid': stores[i].request_id
                                        });
                                        resolve(locationStore);
                                    }).catch(function(res) {
                                        console.log(res)
                                        locationStore.push({
                                            'store_name': stores[i].store_name,
                                            'address': address == '' ? '未设置地址' : address,
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
                                        'store_img': stores[i].store_img == '' ? common.config.bannerImg : common.config.showImgUrl + stores[i].store_img.split(',')[0],
                                        'nodeid': stores[i].request_id
                                    });
                                    resolve(locationStore);
                                })
                            }
                        }).then(function(data) {
                            clearTimeout(timer);
                            timer = setTimeout(function() {
                                locationStore.sort(function(obj1, obj2) {
                                    var val1 = obj1.distance == '未知' ? '9999999' : obj1.distance
                                    var val2 = obj2.distance == '未知' ? '9999999' : obj2.distance
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
                                resolve(1);
                            }, 1000);
                        });
                    }
                ).catch(function(reason) {
                    reject(0);
                    wx.showModal({
                        title: '提示',
                        content: '获取门店信息失败',
                        showCancel: false
                    });
                });
            }
        }).then(function() {
            //获取所有房间信息
            common.getRoomInfo(app.globalData.authorizerId, locationStore[0].nodeid, currPage, totalPage, 0, 0, roomNumIdx).then(function(data) {
                wx.hideLoading();
                if (data.info.length == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '没有查询到房间信息数据',
                        showCancel: false
                    });
                    return false;
                }

                roomData = data.info
                if (data.info.length < totalPage) {
                    loadState = false;
                    _this.setData({
                        roomData: roomData,
                        loadMtext: '无更多内容'
                    });
                } else {
                    loadState = true;
                    _this.setData({
                        roomData: roomData,
                        loadMtext: '上拉加载更多'
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

            //获取房间类型与房间人数
            wx.request({
                url: common.config.host + '/index.php/Api/Requestdata/getRoomCategory',
                data: {
                    'authorizerId': app.globalData.authorizerId,
                    'ShopNo': locationStore[0].nodeid
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function(res) {
                    //返回成功
                    if (res.statusCode == 200) {
                        if (res.data.status == 1) {
                            roomTypeRow = res.data.info.roomcate;
                            roomNumRow = res.data.info.roompnum;
                            let allType = {
                                autoid:0,
                                roomscategoryname:'全部房型'
                            }
                            _this.setData({
                                roomTypeRow: roomTypeRow,
                                roomNumRow: roomNumRow
                            });
                        } else {
                            roomTypeRow = '';
                            roomNumRow = '';
                        }
                    } else {
                        roomTypeRow = '';
                        roomNumRow = '';
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
        });

        //获取手机信息
        var openid = wx.getStorageSync("openid")
        if (!openid) {
            //调用获取openid
            common.getLogin(app.globalData.authorizerId).then(function(data) {
                _this.getPhoneInfo(data)
            })
        } else {
            _this.getPhoneInfo(openid)
        }
        _this.setData({
            roomNumIdx: roomNumIdx,
            roomTypeIdx: roomTypeIdx
        });
    },

    /** 
     * 切换查看更多类型
     */
    changeBoxHeight(e) {
        var height = e.currentTarget.dataset.height == '80rpx' ? 'auto' : '80rpx';
        var maxHeight = e.currentTarget.dataset.height == '80rpx' ? '400rpx' : '80rpx';
        var boxType = e.currentTarget.dataset.box;

        var query = wx.createSelectorQuery();
        query.select('.type-list').boundingClientRect((res) => {
            var listHeight = res.height; // 获取list高度
        }).exec();

        if (boxType == 'num') {
            this.setData({
                numTypeBoxHeight: height,
                numTypeBoxMaxHeight: maxHeight,
            });
        }
        if (boxType == 'project') {
            this.setData({
                projectTypeBoxHeight: height,
                projectTypeBoxMaxHeight: maxHeight,
            });
        }
    },
    /**
     * 点击切换门店
     */
    changeStoreBtn: function() {
        wx.removeStorageSync("techdata")
        wx.removeStorageSync("roomStorage")
        wx.redirectTo({
            url: '../select-store/select-store?type=2',
        })
    },

    /**
     * 点击立即预约显示选择时间
     */
    reserveBtnTime: function() {
        this.setData({
            showSelectTime: 'showIn',
            maskDisplay: 'block'
        });
    },

    /**
     * 预约房间
     */
    reserveBtn: function(ev) {
        var idx = ev.currentTarget.dataset.id
        var roomData = this.data.roomData
        for (var i in roomData) {
            roomData[i].selected = i == idx ? true : false;
        }
        wx.setStorageSync('roomStorage', roomData)
        var phoneinfo = wx.getStorageSync("phoneinfo")
        if (phoneinfo.phone) {
            //转去
            wx.navigateTo({
                url: '../../../technician/pages/techorder/techorder'
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '您未绑定手机号，请前往绑定',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.redirectTo({
                            url: '../../../../pages/ucentermodel/pages/infobind/infobind?returnway=3',
                        })
                    }
                }
            })
        }
    },
    /**
     * 点击跳转房间详情
     */
    toRoomDetail: function(ev) {
        var id = ev.currentTarget.dataset.idx;
        wx.navigateTo({
            url: '../room-detail/room-detail?id=' + id,
        });
    },

    /**
     * 拨打电话
     */
    phoneCall: function(ev) {
        var phone = ev.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone,
        });
    },

    /**
     * 点击切换选择房间人数
     */
    changeRoomNum: function(ev) {
        roomNumIdx = ev.currentTarget.dataset.idx;
        var _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        //获取所有房间信息
        common.getRoomInfo(app.globalData.authorizerId, locationStore[0].nodeid, currPage, totalPage, 0, roomTypeIdx, roomNumIdx).then(function(data) {
            wx.hideLoading();
            if (data.info.length == 0) {
                wx.showModal({
                    title: '提示',
                    content: '没有查询到房间信息数据',
                    showCancel: false
                });
                return false;
            }
            roomData = data.info;
            if (data.info.length < totalPage) {
                loadState = false;
                _this.setData({
                    roomData: roomData,
                    loadMtext: '无更多内容',
                    roomNumIdx: roomNumIdx
                });
            } else {
                loadState = true;
                _this.setData({
                    roomData: roomData,
                    loadMtext: '上拉加载更多',
                    roomNumIdx: roomNumIdx
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
     * 点击切换选择房间类型
     */
    changeRType: function(ev) {
        roomTypeIdx = ev.currentTarget.dataset.idx;
        var _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        //获取所有房间信息
        common.getRoomInfo(app.globalData.authorizerId, locationStore[0].nodeid, currPage, totalPage, 0, roomTypeIdx, roomNumIdx).then(function(data) {
            wx.hideLoading();
            if (data.info.length == 0) {
                wx.showModal({
                    title: '提示',
                    content: '没有查询到房间信息数据',
                    showCancel: false
                });
                return false;
            }


            roomData = data.info;

            if (data.info.length < totalPage) {
                loadState = false;
                _this.setData({
                    roomData: roomData,
                    loadMtext: '无更多内容',
                    roomTypeIdx: roomTypeIdx
                });
            } else {
                loadState = true;
                _this.setData({
                    roomData: roomData,
                    loadMtext: '上拉加载更多',
                    roomTypeIdx: roomTypeIdx
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
        var p = new Promise(function(resolve, reject) {
            //获取所有门店信息
            wx.request({
                url: common.config.host + '/index.php/Api/Base/getStores',
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
                            stores = res.data.info;
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
                            content: '请求失败',
                            showCancel: false
                        });
                    }
                }
            });
        });
        return p;
    },
    //获取手机号码
    getPhoneInfo: function(openid) {
        wx.showLoading({
            title: '加载中...',
        })
        var that = this;
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
                    wx.setStorageSync("phoneinfo", res.data.info)
                    that.setData({
                        phoneinfo: res.data.info
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
                console.log(res)
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

    //如果没有选择的 清除缓存
    onUnload() {
        var that = this
        var tdata = that.data.roomData
        var temp = false
        for (var i in tdata) {
            if (tdata[i].selected) {
                temp = true
            }
        }
        if (!temp) {
            wx.removeStorageSync("roomStorage")
        }
    },
})