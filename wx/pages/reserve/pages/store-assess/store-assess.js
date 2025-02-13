let app = getApp();
let common = require('../../../../common.js');
//分页页码
let pageIndex = 0;
//加载状态
let loadState = true;
//评价数据
let assessData = [];
//评价门店数据
let storeArr = [];
//定位定时器
let storesortTime = null;
//选择门店的下标
let index = 0;
//选择门店的nodeid
let nodeid = '';
//当前评价类型
let currentType = ''
//所有门店
let allStore = {
    store_name: '所有门店',
    request_id: '',
    distance: 0
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //获取用户基本信息框
        display: 'display:none',
        //加载态度
        currentState: '加载中...',
        index: index,
        nodeid: nodeid,
        //评价类型列表
        typeList: [{
                name: '全部',
                value: ''
            },
            {
                name: '好评',
                value: 1
            },
            {
                name: '中评',
                value: 2
            },
            {
                name: '差评',
                value: 3
            }
        ],
        //评价类型
        currentType: currentType,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getStoreArr();
    },

    /**
     * 门店评价完成刷新页面
     */
    onShow() {
        this.getAssessData();
    },

    /**
     * 获取评论数据
     */
    getAssessData() {
        let _this = this;
        //分页
        pageIndex = 0;
        //重新开启上拉加载
        loadState = true;
        //评价数据
        assessData = [];

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        let openid = wx.getStorageSync('openid');
        if (!openid) {
            common.getLogin(app.globalData.authorizerId).then(function(data) {
                openid = data;
                //加载所有评价内容
                common.getStoreAssess(app.globalData.authorizerId, openid, pageIndex, currentType,nodeid).then(function(data) {
                    wx.hideLoading();
                    assessData = data.info;
                    _this.setData({
                        assesData: assessData,
                        selfAssess: data.selfAssess
                    });
                    if (data.info || data.selfAssess) {
                        if (assessData.length == 15) {
                            loadState = true;
                            _this.setData({
                                loadMtext: '上拉加载更多'
                            });
                        } else {
                            loadState = false;
                            _this.setData({
                                loadMtext: '无更多内容'
                            });
                        }
                    } else {
                        loadState = false;
                        _this.setData({
                            loadMtext: '无更多内容',
                            currentState: '无评价内容'
                        });
                    }
                }).catch(function(data) {
                    wx.hideLoading();
                    loadState = false;
                    _this.setData({
                        loadMtext: '无更多内容',
                        currentState: data
                    });
                });
            }).catch(function(data) {
                wx.hideLoading();
                loadState = false;
                _this.setData({
                    loadMtext: '无更多内容',
                    currentState: data
                });
            });
        } else {
            //加载所有评价内容
            common.getStoreAssess(app.globalData.authorizerId, openid, pageIndex, currentType,nodeid).then(function(data) {
                wx.hideLoading();
                assessData = data.info;
                _this.setData({
                    assesData: assessData,
                    selfAssess: data.selfAssess
                });
                if (data.info || data.selfAssess) {
                    if (assessData.length == 15) {
                        loadState = true;
                        _this.setData({
                            loadMtext: '上拉加载更多'
                        });
                    } else {
                        loadState = false;
                        _this.setData({
                            loadMtext: '无更多内容'
                        });
                    }
                } else {
                    loadState = false;
                    _this.setData({
                        loadMtext: '无更多内容',
                        currentState: '无评价内容'
                    });
                }
            }).catch(function(data) {
                wx.hideLoading();
                loadState = false;
                _this.setData({
                    loadMtext: '无更多内容',
                    currentState: data
                });
            });
        }
    },

    /**
     * 获取门店
     */
    getStoreArr(){
        var _this =  this

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        common.getStores(app.globalData.authorizerId).then(function (data) {
            storeArr = data;
            let currrntArr = [];

            for (let i = 0; i < storeArr.length; i++) {
                common.geocoder(storeArr[i].address_detail).then(data => {
                    common.calculateDistance([data]).then(data => {
                        storeArr[i]['distance'] = data;
                        currrntArr.push(1);
                    }).catch(data => {
                        storeArr[i]['distance'] = '999999';
                        currrntArr.push(1);
                    });
                }).catch(data => {
                    storeArr[i]['distance'] = '999999';
                    currrntArr.push(1);
                });
            }
            storeArr = storeArr.sort(common.compare('distance'));
            wx.hideLoading();
            storeArr.unshift(allStore)
            _this.setData({
                storeArr: storeArr
            });

            //定时检查定位计算距离是否有返回，已返回清除定时器
            clearInterval(storesortTime);
            storesortTime = setInterval(function () {
                if (currrntArr.length >= storeArr.length) {
                    clearInterval(storesortTime);
                    //以距离最近的门店排序
                    storeArr = storeArr.sort(common.compare('distance'));
                    wx.hideLoading();
                    _this.setData({
                        storeArr: storeArr
                    });
                }
            }, 1000);

        }).catch(function (data) {
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
    },
    /**
     * 切换评论类型
     */
    changeType(e){
        currentType = e.currentTarget.dataset.type
        this.setData({
            currentType: currentType
        })
        this.getAssessData()
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        let _this = this;
        //分页
        pageIndex = 0;
        //重新开启上拉加载
        loadState = true;
        //评价数据
        assessData = [];

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        let openid = wx.getStorageSync('openid');
        //加载评价内容
        common.getStoreAssess(app.globalData.authorizerId, openid, pageIndex, currentType,nodeid).then(function(data) {
            wx.hideLoading();
            if (data.info || data.selfAssess) {
                assessData = data.info;
                _this.setData({
                    assesData: assessData,
                    selfAssess: data.selfAssess
                });

                if (assessData.length == 15) {
                    loadState = true;
                    _this.setData({
                        loadMtext: '上拉加载更多'
                    });
                } else {
                    loadState = false;
                    _this.setData({
                        loadMtext: '无更多内容'
                    });
                }
            } else {
                loadState = false;
                _this.setData({
                    loadMtext: '无更多内容',
                    currentState: '无评价内容'
                });
            }
        }).catch(function(data) {
            wx.hideLoading();
            loadState = false;
            _this.setData({
                loadMtext: '无更多内容',
                currentState: data
            });
        });

        _this.setData({
            currentType: currentType
        });

        wx.stopPullDownRefresh();
    },

    /**
     * 点击跳转至评价
     */
    toAssess: function() {
        let _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });

        let openid = wx.getStorageSync('openid');

        //查询用户信息
        common.getUInfo('nickname,avatarUrl,names', app.globalData.authorizerId, openid).then(function(data) {
            wx.hideLoading();

            if (data.info.nickname) {
                wx.navigateTo({
                    url: '../assess/assess',
                });
            } else {
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
                            _this.setData({
                                display: 'display:block'
                            });
                        } else {
                            wx.getUserInfo({
                                success: function(res) {
                                    let udata = res;
                                    common.saveUserInfo(openid, app.globalData.authorizerId, udata.encryptedData, udata.iv, 1).then(function(data) {
                                        wx.navigateTo({
                                            url: '../assess/assess',
                                        });
                                    }).catch(function(data) {
                                        wx.navigateTo({
                                            url: '../assess/assess',
                                        });
                                    });
                                }
                            });
                        }
                    }
                });

            }

        }).catch(function(data) {
            wx.hideLoading();

            wx.getSetting({
                success(res) {
                    if (!res.authSetting['scope.userInfo']) {
                        _this.setData({
                            display: 'display:block'
                        });
                    } else {
                        wx.getUserInfo({
                            success: function(res) {
                                let udata = res;
                                common.saveUserInfo(openid, app.globalData.authorizerId, udata.encryptedData, udata.iv, 1).then(function(data) {
                                    wx.navigateTo({
                                        url: '../assess/assess',
                                    });
                                }).catch(function(data) {
                                    wx.navigateTo({
                                        url: '../assess/assess',
                                    });
                                });
                            }
                        });
                    }
                }
            });
        });

    },

    /**
     * 同意获取用户基本信息
     */
    getUInfo: function(e) {
        let _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });

        let openid = wx.getStorageSync('openid');

        let udata = e.detail;
        if (udata.errMsg != 'getUserInfo:ok') {
            wx.hideLoading();
            return false;
        }

        common.saveUserInfo(openid, app.globalData.authorizerId, udata.encryptedData, udata.iv, 1).then(function(data) {
            wx.hideLoading();
            _this.setData({
                display: 'display:none'
            });
            wx.navigateTo({
                url: '../assess/assess',
            });
        }).catch(function(data) {
            wx.hideLoading();
            _this.setData({
                display: 'display:none'
            });
            wx.navigateTo({
                url: '../assess/assess',
            });
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
    },

    /**
     * 选择门店
     */
    bindPickerChange: function(e) {
        index = e.detail.value
        nodeid = storeArr[index].request_id
        this.setData({
            nodeid: nodeid,
            index: index
        })
        this.getAssessData()
    },

    /**
     * 上位加载更多评价
     */
    onReachBottom: function() {
        let _this = this;
        //获取评价内容
        if (loadState) {
            try {
                pageIndex++;
                loadState = false;
                //获取用户openid
                let openid = wx.getStorageSync('openid');
                _this.setData({
                    loadMtext: '加载中...'
                });

                wx.showLoading({
                    title: '加载中...',
                    mask: true
                });

                common.getStoreAssess(app.globalData.authorizerId, openid, pageIndex, currentType,nodeid).then(function(data) {
                    wx.hideLoading();
                    if (data.info) {
                        for (let i = 0; i < data.info.length; i++) {
                            assessData.push(data.info[i]);
                        }

                        loadState = true;
                        _this.setData({
                            assesData: assessData,
                            loadMtext: '上拉加载更多'
                        });
                    } else {
                        loadState = false;
                        _this.setData({
                            assesData: assessData,
                            loadMtext: '无更多内容'
                        });
                    }
                }).catch(function(data) {
                    wx.hideLoading();
                    loadState = false;
                    _this.setData({
                        assesData: assessData,
                        loadMtext: '无更多内容'
                    });
                });
            } catch (e) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: e.message,
                    showCancel: false
                });
            }
        }

    }

})