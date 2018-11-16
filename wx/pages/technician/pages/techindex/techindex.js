// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../../pages/common/lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
//全局配置
const common = require('../../../../common.js');
//获取APP
const app = getApp();
//定位的门店地址、距离信息
var locationStore = [];
//需要计算的距离纬度经度
var latLng = [];
//所有门店信息
let stores;
//定时执行时间
var timer = null;
//当前第几页
var currPage = 1;
//多少条
var totalPage = 8;
//左容器图片
var leftItem = [];
//右容器图片
var rightItem = [];
Page({
    /**
     * 页面的初始数据
     */
    data: {
        techNODefault: '',
        typeDefault: 0,
        typeLists: [],
        maskDisplay: 'none',
        indicatorDots: false,
        data: {},
        showImgUrl: "",
        iconHide: 'display:block',
        reserveBtnHide: 'display:none',
        leftItem: [],
        rightItem: [],
        lHeight: 0,
        rHeight: 0,
        imgWidth: 0,
        imgHeight: 0,
    },
    itemReset: function(e) {
        //图片原始宽度
        let beforeWidth = e.detail.width;
        //图片原始高度
        let beforeHeight = e.detail.height;
        //图片设置的宽度
        let nowWidth = this.data.imgWidth;
        //比例=图片原始宽度/图片设置的宽度
        let wProportion = beforeWidth / nowWidth;
        //图片设置的高度=图片原始高度/比例
        let imgHeight = beforeHeight / wProportion;
        //当左区域高=右区域高   或   当左区域高<右区域高
        if (this.data.lHeight == this.data.rHeight || this.data.lHeight < this.data.rHeight) {
            leftItem.push(e.target.dataset.item)
            this.setData({
                lHeight: this.data.lHeight + imgHeight
            })
            //当左区域高>右区域高
        } else if (this.data.lHeight > this.data.rHeight) {
            rightItem.push(e.target.dataset.item)
            this.setData({
                rHeight: this.data.rHeight + imgHeight
            })
        }
        this.setData({
            leftItem: leftItem,
            rightItem: rightItem,
        })
    },
    onLoad: function(options) {
        this.setData({
            showImgUrl: common.config.showImgUrl
        })
        var that = this

        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: common.config.QQMapWXKey
        });

        //定位缓存大于1小时就删除缓存
        var currStoreCache = wx.getStorageSync('currentReserveStore');
        if (currStoreCache) {
            var noedid = currStoreCache[0].nodeid
            var shopno = noedid.split("#")[0]
            //加载技师及技师类别信息
            that.loaddata('/index.php/Api/TechNician/getTechnician', {
                "authorizerId": app.globalData.authorizerId,
                "shopno": shopno,
                "openid": wx.getStorageSync("openid"),
                'currPage': currPage,
                'num': totalPage,
            }, 1)

            var currTime = new Date().getTime() - 3600000;
            if (currStoreCache[0].cache < currTime) {
                wx.removeStorageSync('currentReserveStore');
            }
        } else {
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

                            var currStoreCache = res.data.info

                            var noedid = currStoreCache[0].request_id
                            console.log(noedid)
                            var shopno = noedid.split("#")[0]
                            //加载技师及技师类别信息
                            if (shopno) {
                                that.loaddata('/index.php/Api/TechNician/getTechnician', {
                                    "authorizerId": app.globalData.authorizerId,
                                    "shopno": shopno,
                                    "openid": wx.getStorageSync("openid"),

                                }, 1)
                            }


                        } else {

                        }

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

        }

        //获取手机信息
        var openid = wx.getStorageSync("openid")
        if (!openid) {
            //调用获取openid
            common.getLogin(app.globalData.authorizerId).then(function(data) {
                that.getPhoneInfo(data)
            })
        } else {
            that.getPhoneInfo(openid)
        }
        //设置瀑布流图片宽度
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    imgWidth: res.windowWidth * 330 / 750,
                })
            },
        })
    },
    
    //选择技师类别
    typeSelect: function(e) {
        var typeDefault = e.target.dataset.id
        this.setData({
            typeDefault: typeDefault
        })
        var currStoreCache = wx.getStorageSync('currentReserveStore');
        var noedid = currStoreCache[0].nodeid
        var shopno = noedid.split("#")[0]
        //加载技师及技师类别信息
        if (typeDefault != 0) {
            this.loaddata('/index.php/Api/TechNician/getTechnician', {
                "authorizerId": app.globalData.authorizerId,
                "shopno": shopno,
                "openid": wx.getStorageSync("openid"),
                "techniciantypeno": typeDefault,
            }, 1)
        } else {
            this.loaddata('/index.php/Api/TechNician/getTechnician', {
                "authorizerId": app.globalData.authorizerId,
                "shopno": shopno,
                "openid": wx.getStorageSync("openid"),
            }, 1)
        }

    },

    //去技师详情
    toTechdetail: function(e) {
        var selected = e.currentTarget.dataset.id
        console.log("现在选的" + selected)
        var url = '../techdetail/techdetail'
        var typeDefault = this.data.typeDefault
        if (typeDefault == 0) {
            url += '?selected=' + selected
        } else {
            url += '?selected=' + selected + '&typeDefault=' + typeDefault
        }
        wx.navigateTo({
            url: url,
        })
    },

    //去选项目
    toproject: function(e) {
        wx.navigateTo({
            url: '../techproject/techproject',
        })
    },
    bindfocus: function() {
        wx.redirectTo({
            url: '../techsearch/techsearch',
        })
    },



    /**
     * 加载技师数据
     */
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
         res   成功的数据   operate   加载  1-加载会员卡信息   2-加载会员卡项目优惠信息
    */
    dealdata: function(res, operate) {
        switch (operate) {
            case 1:
                if (res.data.status == 0) {
                    var data = res.data.data
                    var techdata = wx.getStorageSync("techdata")
                    if (techdata.length > 0) {
                        for (var i in techdata) {
                            let workno = techdata[i].staffworkno
                            if (data[workno]) {
                                data[workno].selected = true
                            }
                        }
                    }
                    let typeLists = data ? res.data.typeLists : {}
                    this.setData({
                        typeLists: typeLists,
                        data: res.data.data
                    })
                } else {
                    //获取数据失
                    wx.showModal({
                        title: '提示',
                        content: res.data.data,
                        showCancel: false,
                        success: function(res) {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    })
                }
                break
            case 2:
                break
        }
        wx.hideLoading()
    },
    /**
     * 预约table选项卡导航跳转
     */
    onlineReserevTabJump: function(ev) {
        wx.redirectTo({
            url: ev.currentTarget.dataset.url,
        });
    },
    /**
     * 点击预约选中预约项
     */
    reserve: function(ev) {
        var idx = ev.currentTarget.dataset.idx;
        var data = this.data.data,
        leftItem = this.data.leftItem,
        rightItem = this.data.rightItem,
        i=0;
        data[idx].selected = !data[idx].selected;
        for (i = 0; i < leftItem.length ; i++){
            if (leftItem[i].staffworkno == data[idx].staffworkno){
                leftItem[i].selected = data[idx].selected;
                break;
            }
        }
        for (i = 0; i < rightItem.length; i++) {
            if (rightItem[i].staffworkno == data[idx].staffworkno) {
                rightItem[i].selected = data[idx].selected;
                break;
            }
        }
        this.setData({
            data: data,
            leftItem: leftItem,
            rightItem: rightItem
        });
    },
    /**
     * 点击立即预约显示选择时间
     */
    reserveBtnTime: function() {
        var that = this
        //判断是否有选择预约
        var data = this.data.data
        var snum = 0 //计数预约数
        var dataarr = new Array
        for (var i in data) {
            if (data[i].selected) {
                snum++
                dataarr.push(data[i])
            }
        }
        wx.setStorageSync("techdata", dataarr)
        var phoneinfo = wx.getStorageSync("phoneinfo")
        if (phoneinfo.phone) {
            if (snum > 0) {
                //转去
                wx.navigateTo({
                    url: '../techorder/techorder',
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '未选择技师',
                    showCancel: false
                })
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '您未绑定手机号，请前往绑定',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.redirectTo({
                            url: '../../../../pages/ucentermodel/pages/infobind/infobind?returnway=2',
                        })
                    }
                }
            })
        }

    },


    /**
     * 跳转确认下单页
     */
    confirmBtn: function() {
        var _this = this;
        wx.navigateTo({
            url: '/pages/reserve/pages/room-order-confirm/room-order-confirm',
            success: function() {
                _this.setData({
                    maskDisplay: 'none',
                    showSelectTime: 'showOut'
                });
            }
        });
    },
    /**
     * 点击切换门店
     */
    changeStoreBtn: function() {

        wx.removeStorageSync("techdata")
        wx.removeStorageSync("roomStorage")
        wx.redirectTo({
            url: '/pages/reserve/pages/select-store/select-store?type=1',
        })
    },

    /**
     * 监听页面显示事件
     */
    onShow: function() {
        let _this = this;
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

                        for (let i = 0; i < stores.length; i++) {
                            var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;

                            console.log(address)
                            common.geocoder(address).then(function(loca) {
                                var address = stores[i].province + stores[i].city + stores[i].area + stores[i].address_detail;

                                common.calculateDistance([loca]).then(function(distance) {
                                    console.log(distance)
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
                                    console.log(res)
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
                                        console.log(res)
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

    //下拉刷新
    onPullDownRefresh() {
        var that = this
        wx.showNavigationBarLoading() //在标题栏中显示加载
        var currStoreCache = wx.getStorageSync('currentReserveStore');
        if (currStoreCache) {
            var noedid = currStoreCache[0].nodeid
            var shopno = noedid.split("#")[0]
            //加载技师及技师类别信息
            that.loaddata('/index.php/Api/TechNician/getTechnician', {
                "authorizerId": app.globalData.authorizerId,
                "shopno": shopno,
                "openid": wx.getStorageSync("openid"),
                'currPage': 1,
                'num': totalPage,
            }, 1)
        }
        that.setData({
            typeDefault: 0
        })
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh() //停止下拉刷新
    },

    //如果没有选择的 清除缓存
    onUnload() {
        var that = this
        var tdata = that.data.data
        var temp = false
        for (var i in tdata) {
            if (tdata[i].selected) {
                temp = true
            }
        }
        if (!temp) {
            wx.removeStorageSync("techdata")
        }
        leftItem = [];
        rightItem = [];
        that.setData({
            leftItem: [],
            rightItem: [],
            lHeight: 0,
            rHeight: 0,
            imgWidth: 0,
            imgHeight: 0,
        })
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
    //电话拨打
    phoneCall: function(e) {
        var phone = e.currentTarget.dataset.phone
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },


})