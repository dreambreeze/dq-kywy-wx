var app = getApp();
//获取全局配置
var common = require('../../../../common.js');
//订单类型
var orderType = '';
//二维码弹窗数据
var showQrcode = {}
Page({
    /**
     * 页面的初始数据
     */
    data: {
        orderType: [{
                'name': '在线办卡',
                'type': 1
            },
            {
                'name': '在线充值',
                'type': 2
            },
            {
                'name': '在线转赠',
                'type': 4
            },
            {
                'name': '预约',
                'type': 5
            },
            {
                'name': '自助点单',
                'type': 7
            },
            {
                'name': '拼团订单',
                'type': 8
            },
            {
                'name': '团购订单',
                'type': 9
            }
        ],
        orderState: [
            '全部',
            '待使用',
            '待评价',
            '已完成'
        ],
        tname: '订单分类',
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //无会员卡图片的默认会员卡图
        cardPicUrl: common.config.orderCardIcon,
        typeclick: 1,
        //分类弹窗是否显示
        typeOrderDisplay: false,
        //二维码弹窗显隐
        qrDisplay: 'none',
        //弹窗数据
        showQrcode: showQrcode
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var ymd = new Date('YYYYMMDDHH')

        let _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        common.checkingOrder(app.globalData.authorizerId, '', '').then(function(data) {
            wx.hideLoading();
            if (data.info.length > 0) {
                _this.setData({
                    orderData: data.info
                });
            } else {
                _this.setData({
                    orderData: ''
                });
                wx.showModal({
                    title: '提示',
                    content: '没有查询到订单信息',
                    showCancel: false
                });
            }
        }).catch(function(data) {

            wx.hideLoading();
            _this.setData({
                orderData: ''
            });
            wx.showModal({
                title: '提示',
                content: data,
                showCancel: false
            });
        });
    },

    /**
     * 点击切换全部订单和分类订单
     */
    orderTypeTitleChange: function(ev) {
        var _this = this;
        var idx = ev.currentTarget.dataset.idx;
        let typeclick = ev.currentTarget.dataset.typeclick;

        orderType = '';

        if (idx == 1) {
            wx.showLoading({
                title: '加载中',
                mask: true
            });

            common.checkingOrder(app.globalData.authorizerId, '', orderType).then(function(data) {
                wx.hideLoading();
                if (data.info.length > 0) {
                    _this.setData({
                        orderData: data.info,
                        typeOrderDisplay: false,
                        tIdx: idx,
                        tname: '订单分类',
                        topTypeHeight: 'height: 86rpx;',
                        typeclick: 1
                    });
                } else {
                    _this.setData({
                        orderData: ''
                    });
                    wx.showModal({
                        title: '提示',
                        content: '没有查询到订单信息',
                        showCancel: false
                    });
                }
            }).catch(function(data) {
                wx.hideLoading();
                _this.setData({
                    orderData: ''
                });
                wx.showModal({
                    title: '提示',
                    content: data,
                    showCancel: false
                });
            });
        } else if (idx == 2) {
            this.setData({
                typeOrderDisplay: (typeclick == 1 ? true : false),
                tIdx: idx,
                topTypeHeight: (typeclick == 1 ? 'height: 176rpx;' : 'height: 86rpx;'),
                typeclick: (typeclick == 1 ? 2 : 1)
            });
        } else if (idx == 3) {
            this.setData({
                typeOrderDisplay: (typeclick == 1 ? true : false),
                tIdx: 2,
                topTypeHeight: (typeclick == 1 ? 'height: 176rpx;' : 'height: 86rpx;'),
                typeclick: (typeclick == 1 ? 2 : 1)
            });
        }
    },

    /**
     * 点击切换分类订单类型
     */
    orderTypeChange: function(ev) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this = this;
        var tname = ev.currentTarget.dataset.tname;
        orderType = ev.currentTarget.dataset.type;

        common.checkingOrder(app.globalData.authorizerId, '', orderType).then(function(data) {
            wx.hideLoading();
            if (data.info.length > 0) {
                var orderData = data.info;
                _this.setData({
                    orderData: orderData,
                    typeOrderDisplay: false,
                    tIdx: 2,
                    tname: tname,
                    topTypeHeight: 'height: 86rpx;',
                    typeclick: 1
                });
            } else {
                _this.setData({
                    orderData: ''
                });
                wx.showModal({
                    title: '提示',
                    content: '没有查询到订单信息',
                    showCancel: false
                });
            }
        }).catch(function(data) {
            wx.hideLoading();
            _this.setData({
                orderData: ''
            });
            wx.showModal({
                title: '提示',
                content: data,
                showCancel: false
            });
        });
    },

    /**
     * 点击切换订单状态
     */
    orderStateChange: function(ev) {
        var idx = ev.currentTarget.dataset.idx;
        this.setData({
            sIdx: idx
        });
    },

    /**
     * 点击立即消费
     */
    lijixiaofei: function(e) {
        showQrcode.qrcode = e.currentTarget.dataset.qrcode
        showQrcode.pname = e.currentTarget.dataset.pname
        showQrcode.price = e.currentTarget.dataset.price
        showQrcode.orderno = e.currentTarget.dataset.orderno
        this.setData({
            qrDisplay: 'block',
            showQrcode: showQrcode
        });
    },

    //未满团  去分享
    toshare(e) {
        let pid = e.currentTarget.dataset.pid
        let orderno = e.currentTarget.dataset.orderno
        let groupno = e.currentTarget.dataset.groupno
        let nodeid = e.currentTarget.dataset.nodeid + "#china"
        wx.navigateTo({
            url: '/pages/transbuy/pages/group-paycomplete/group-paycomplete?orderno=' + orderno + '&groupno=' + groupno + '&pid=' + pid + '&nodeid=' + nodeid
        })
    },

    /**
     * 前往拼团订单详情
     */
    toGroupOrderDetail(e) {
        var id = e.currentTarget.dataset.id;
        var orderno = e.currentTarget.dataset.orderno;
        var nodeid = e.currentTarget.dataset.nodeid + "#china";
        wx.navigateTo({
            url: '/pages/transbuy/pages/group-orderdetail/group-orderdetail?orderno=' + orderno + '&pid=' + id + '&nodeid=' + nodeid,
        });
    },

    /**
     * 前往团购订单详情
     */
    toEGroupOrderDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/ucentermodel/pages/orderdetail/orderdetail?id=' + id,
        });
    },
    /**
     * 再次购买团购
     */
    againBuyEGroup: function(e) {
        let pid = e.currentTarget.dataset.pid;
        let nodeid = e.currentTarget.dataset.nodeid;
        wx.navigateTo({
            url: '/pages/transbuy/pages/project-detail/project-detail?pid=' + pid + '&nodeid=' + nodeid,
        });
    },
    /**
     * 再次购买拼团
     */
    againBuyGroup: function(e) {
        let pid = e.currentTarget.dataset.pid;
        let nodeid = e.currentTarget.dataset.nodeid;
        nodeid += "#china"
        wx.navigateTo({
            url: '/pages/transbuy/pages/group-detail/group-detail?pid=' + pid + '&nodeid=' + nodeid,
        });
    },
    /**
     * 删除拼团订单
     */
    delGroupOrderItem: function(e) {
        let id = e.currentTarget.dataset.id;
        let _this = this;

        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            success: function(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '加载中',
                        mask: true
                    });

                    //用户openid
                    let openid = wx.getStorageSync('openid');

                    common.delGroupItem(app.globalData.authorizerId, id).then(function(data) {
                        wx.hideLoading();
                        _this.refreshOrder()
                    }).catch(function(data) {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: data,
                            showCancel: false
                        });
                    });
                }
            }
        })
    },
    /**
     * 删除团购订单
     */
    delEGroupOrderItem: function(e) {
        let id = e.currentTarget.dataset.id;
        let _this = this;

        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            success: function(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '加载中',
                        mask: true
                    });
                    _this = _this
                    //用户openid
                    let openid = wx.getStorageSync('openid');

                    common.delEBuyItem(app.globalData.authorizerId, id).then(function(data) {
                        wx.hideLoading();
                        _this.refreshOrder()
                    }).catch(function(data) {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: data,
                            showCancel: false
                        });
                    });
                }
            }
        })
    },
    /**
     * 评价拼团
     */
    assessGroup(e) {
        let pid = e.currentTarget.dataset.pid;
        let nodeid = e.currentTarget.dataset.nodeid + "#china";
        let id = e.currentTarget.dataset.id;

        wx.navigateTo({
            url: '/pages/transbuy/pages/group-assess/group-assess?pid=' + pid + '&nodeid=' + nodeid + '&id=' + id,
        });
    },
    /**
     * 评价团购
     */
    assessEGroup: function(e) {
        let pid = e.currentTarget.dataset.pid;
        let nodeid = e.currentTarget.dataset.nodeid;
        let id = e.currentTarget.dataset.id;

        wx.navigateTo({
            url: '/pages/transbuy/pages/assess/assess?pid=' + pid + '&nodeid=' + nodeid + '&id=' + id,
        });
    },
    /**
     * 关闭二维码
     */
    closeQrcode: function() {
        this.setData({
            qrDisplay: 'none'
        });
    },

    /**
     * 点击评价，跳转至评价页
     */
    evaluation: function() {
        wx.navigateTo({
            url: '/pages/transbuy/pages/assess/assess',
        });
    },

    /**
     * 跳转至订单详情页
     */
    toOrderDetail: function(e) {
        var guid = e.currentTarget.dataset.guid;

        if (e.currentTarget.dataset.taskid == 5) {
            var index = e.currentTarget.dataset.index
            var yyorder = this.data.orderData[index]
            wx.setStorageSync("yyorder", yyorder)
            wx.navigateTo({
                url: '../reserveorderdetail/reserveorderdetail?guid=' + guid,
            });
        } else if (e.currentTarget.dataset.taskid == 7) { //自助点单
            wx.navigateTo({
                url: '../../../../pages/automina/pages/orderdetail/orderdetail?rguid=' + guid,
            })
        } else {
            wx.navigateTo({
                url: '../orderdetail/orderdetail?type=1&guid=' + guid,
            });
        }

    },

    /**
     * 跳转至办卡订单详情页
     */
    docardOrderdetail: function(e) {
        var guid = e.currentTarget.dataset.guid;
        var orderType = e.currentTarget.dataset.type
        wx.navigateTo({
            url: '../docardOrderdetail/docardOrderdetail?type=' + orderType + '&guid=' + guid,
        });
    },

    /**
     * 点击在线办卡退款
     */
    docardRefund: function(e) {
        var guid = e.currentTarget.dataset.guid;
        var taskid = e.currentTarget.dataset.taskid;
        let _this = this;

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        wx.request({
            url: common.config.host + '/index.php/Api/Requestdata/docardRefund',
            data: {
                'authorizerId': app.globalData.authorizerId,
                'guid': guid,
                'taskid': taskid
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                //返回成功
                if (res.statusCode == 200) {
                    if (res.data.status == 1) {
                        wx.showModal({
                            title: '提示',
                            content: res.data.info,
                            showCancel: false,
                            success: function(res) {
                                if (res.confirm) {
                                    common.checkingOrder(app.globalData.authorizerId, '', '').then(function(data) {
                                        if (data.info.length > 0) {
                                            var orderData = data.info
                                            _this.setData({
                                                orderData: orderData
                                            });
                                        } else {
                                            _this.setData({
                                                orderData: ''
                                            });
                                            wx.showModal({
                                                title: '提示',
                                                content: '没有查询到订单信息',
                                                showCancel: false
                                            });
                                        }
                                    }).catch(function(data) {
                                        _this.setData({
                                            orderData: ''
                                        });
                                        wx.showModal({
                                            title: '提示',
                                            content: data,
                                            showCancel: false
                                        });
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
            }
        });
    },

    //监听下拉刷新
    onPullDownRefresh: function() {
        let _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        common.checkingOrder(app.globalData.authorizerId, '', orderType).then(function(data) {
            wx.hideLoading();
            if (data.info.length > 0) {
                var orderData = data.info
                _this.setData({
                    orderData: orderData
                });
            } else {
                _this.setData({
                    orderData: ''
                });
                wx.showModal({
                    title: '提示',
                    content: '没有查询到订单信息',
                    showCancel: false
                });
            }
        }).catch(function(data) {
            wx.hideLoading();
            _this.setData({
                orderData: ''
            });
            wx.showModal({
                title: '提示',
                content: data.message ? data.message : data,
                showCancel: false
            });
        });

        wx.stopPullDownRefresh();
    },

    /**
     * 删除订单
     */
    delOrder: function(e) {
        var guid = e.currentTarget.dataset.guid;
        var _this = this;
        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            success: function(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '加载中',
                        mask: true
                    });

                    common.delOrder(app.globalData.authorizerId, guid).then(function(data) {
                        common.checkingOrder(app.globalData.authorizerId, '', orderType).then(function(data) {
                            wx.hideLoading();
                            if (data.info.length > 0) {
                                var orderData = data.info
                                _this.setData({
                                    orderData: orderData
                                });
                            } else {
                                _this.setData({
                                    orderData: ''
                                });
                                wx.showModal({
                                    title: '提示',
                                    content: '没有查询到订单信息',
                                    showCancel: false
                                });
                            }
                        }).catch(function(data) {
                            wx.hideLoading();
                            _this.setData({
                                orderData: ''
                            });
                            wx.showModal({
                                title: '提示',
                                content: data.message ? data.message : data,
                                showCancel: false
                            });
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
            }
        });
    },

    //再次预约
    redirecttech: function(e) {
        var gotype = e.currentTarget.dataset.gotype
        if (gotype) {
            wx.redirectTo({
                url: '../../../../pages/technician/pages/techindex/techindex',
            })
        } else {
            wx.redirectTo({ //约房间
                url: '../../../../pages/reserve/pages/reserve-room/reserve-room',
            })
        }

    },

    /**
     * 刷新订单
     */
    refreshOrder() {
        let _this = this
        common.checkingOrder(app.globalData.authorizerId, '', orderType).then(function(data) {
            wx.hideLoading();
            if (data.info.length > 0) {
                _this.setData({
                    orderData: data.info
                });
            } else {
                _this.setData({
                    orderData: ''
                });
                wx.showModal({
                    title: '提示',
                    content: '没有查询到订单信息',
                    showCancel: false
                });
            }
        }).catch(function(data) {
            wx.hideLoading();
            _this.setData({
                orderData: ''
            });
            wx.showModal({
                title: '提示',
                content: data,
                showCancel: false
            });
        });
    },

})