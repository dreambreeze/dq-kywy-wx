var app = getApp();
var common = require('../../../../common.js');
//所有卡类型
var cardType;
//当前要结账的卡
var checkoutCard;
//切换选择的卡
var selectCard;
//选择的卡下标
var selectCardIndex = 0;
//需付金额
var need = 0;
//账单门店标识，账单号
var ShopNo, BusinessNo;
//记录打开页面时间
let openPageTime = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //图片地址前缀
        showImgUrl: common.config.showImgUrl,
        //无会员卡图片的默认会员卡图
        cardPicUrl: common.config.cardPicUrl,
        //所有卡类型
        cardType: cardType,
        selectCardDisplay: 'display:none;',
        //卡图片
        payWayList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //记录打开页面时间
        openPageTime = new Date().getTime();
        var _this = this;
        //是否存在openid状态，true存在，false不存在
        var openidState = true;
        //时间
        var openidTime = null;
        //二维码参数
        var option = decodeURIComponent(options.scene);

        var optionArr = option.split('@');

        // ShopNo = optionArr[0].split('=')[1];
        // BusinessNo = optionArr[1].split('=')[1];

        ShopNo = 'DQT02';
        BusinessNo = '201812050001';

        if (!ShopNo || !BusinessNo) {
            wx.showModal({
                title: '提示',
                content: '账单编号不存在，获取账单信息失败',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            });
            return false;
        }

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        //获取用户openid
        var openid = wx.getStorageSync('openid');

        if (!openid) {
            openidState = false;

            common.getLogin(app.globalData.authorizerId).then(function(data) {
                openidState = true;
                openid = data;
            }).catch(function(data) {
                openidState = false;
                wx.showModal({
                    title: '提示',
                    content: '获取账单信息失败',
                    showCancel: false
                });
                return false;
            });
        }

        this.loaddata('/index.php/Api/AutoBase/getMMVipCard', {
            "authorizerId": app.globalData.authorizerId,
            "type": "2",
            "openid": wx.getStorageSync("openid"),
            "isstoresort": 0,
            "shopno": ShopNo
        }, 1)

        clearInterval(openidTime);
        openidTime = setInterval(function() {
            if (openidState) {
                clearInterval(openidTime);
                //锁单
                _this.lockOrder(ShopNo, BusinessNo).then(function(data) {
                    //获取用户会员卡
                    _this.getOpenCardType().then(function(data) {
                        //过滤无效会员卡
                        if (data.info.length > 1) {
                            cardType = [];
                            for (var i = 0; i < data.info.length; i++) {
                                if (data.info[i].CardState == 0) {
                                    cardType.push(data.info[i]);
                                }
                            }
                        } else {
                            cardType = data.info;
                        }

                        if (cardType.length == 0) {
                            wx.showModal({
                                title: '提示',
                                content: '会员卡非正常状态，无法结账',
                                showCancel: false,
                                success: function(res) {
                                    if (res.confirm) {
                                        wx.navigateBack();
                                    }
                                }
                            });
                            return false;
                        }

                        //充值金额与充值赠送金额合计成余额
                        for (var i = 0; i < cardType.length; i++) {
                            cardType[i]['Balance'] = (parseFloat(cardType[i].CardNum) + parseFloat(cardType[i].SendNum));
                            cardType[i]['AuthMoney'] = parseFloat(cardType[i].AuthMoney);
                        }

                        checkoutCard = cardType[0];
                        selectCard = cardType[0];

                        //查询账单信息
                        _this.getBillingInfo(checkoutCard, ShopNo, BusinessNo).then(function(data) {
                            wx.hideLoading();
                            need = data.need;
                            _this.setData({
                                BillingInfo: data.info,
                                BusinessNo: BusinessNo,
                                need: need,
                                bsname: data.bsname,
                                offer_amount: data.offer_amount
                            });

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
                            return false;
                        });

                        _this.setData({
                            cardType: [],
                            checkoutCard: null,
                            selectCard: []
                        });
                    });
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
            }
        }, 800);

    },
    /* 加载数据 */
    loaddata: function (url, data, operate) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        var that = this
        new Promise(function (resolve, reject) {
            wx.request({
                url: common.config.host + url,
                data: data,
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    //resolve(res, operate)
                    that.dealdata(res, operate)
                },
                fail: function (res) {
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
    },

    /* 处理加载过来的数据
      res   成功的数据   operate   加载  1-加载会员卡信息   2-加载会员卡项目优惠信息
    */
    dealdata: function (res, operate) {
        switch (operate) {
            case 1:
                if (res.data.status == 1) {
                    //初始付款方式
                    var payWayList = [{
                        AutoID: -1,
                        MembershipTypeName: '微信支付',
                        pic: 'icon-aui-icon-weichat'
                    }]
                    var store = wx.getStorageSync("store")
                    var shopno = store['request_id'].split("#")[0]
                    var cart = this.data.cart
                    var shopgoods = this.data.goods
                    let onlycashFlag = true;


                    for (var i in res.data.info) {
                        payWayList.push(res.data.info[i])
                    }

                    this.setData({
                        payWayList: payWayList
                    })

                    //选中默认结算商品
                    this.passiveSelectAll()

                    //待付款商品列表的商品只包含微信支付的商品时不更改默认支付方式
                    for (var id in cart.list) {
                        if (shopgoods[id].selected && shopgoods[id].onlycash != 1) {
                            onlycashFlag = false
                            break
                        }
                    }
                    if (!onlycashFlag) {
                        for (let i in res.data.info) {
                            payWayList.push(res.data.info[i])
                            //当拥有当前门店会员卡时默认支付方式为当前门店第一张卡
                            if (this.data.pyselected == 0 &&
                                res.data.info[i].ShopNo == shopno) {
                                this.setData({
                                    pyselected: (parseInt(i) + 1)
                                })
                                //更换选中会员卡
                                this.selectPayWay((parseInt(i) + 1), 2)
                            }
                        }
                    }
                } else {
                    wx.showToast({
                        icon: "none",
                        title: '未查询到适用本店的会员卡！',
                    })
                }
                break
            case 2:
                // 被动全选商品
                this.passiveSelectAll()

                var cart = this.data.cart
                var goods = res.data.iteminfo
                var shopgoods = this.data.goods

                var count = 0
                var total = 0

                for (var id in cart.list) {
                    var cartinfo = new Object;
                    // count += cart.list[id];  计算请求会员折扣后的购物车数据
                    if (shopgoods[id].selected && shopgoods[id].onlycash != 1) {
                        total += (goods[id].BasePrice * cart.list[id]);
                        goods[id].BasePrice = parseFloat(goods[id].BasePrice)
                    }
                }
                cart.iteminfo = goods

                total = parseFloat((total).toFixed(2))

                cart.total = total;

                this.setData({
                    cart: cart,
                })
                break
            case 3: //提交订单
                this.dealAfterOrder(res)
                break
        }
        wx.hideLoading()
    },
    /**
     * 获取当前用户所有卡类型
     */
    getOpenCardType: function() {
        var p = new Promise(function(resolve, reject) {
            var openid = wx.getStorageSync('openid'),
                _this = this;

            wx.request({
                url: common.config.host + '/index.php/Api/Base/getVipCard',
                data: {
                    'authorizerId': app.globalData.authorizerId,
                    'openid': openid,
                    'type': 2
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
                                resolve(res.data);
                            }
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

    /**
     * 切换选卡事件
     */
    bindChange: function(e) {
        const val = e.detail.value;
        selectCardIndex = val[0];

        this.setData({
            selectCard: cardType[val[0]]
        });
    },

    /**
     * 点击选卡
     */
    switching: function() {
        this.setData({
            selectCardDisplay: 'display:block;'
        });
    },

    /**
     * 点击关闭选卡
     */
    closeSelectCard: function() {
        this.setData({
            selectCardDisplay: 'display:none;'
        });
    },

    /**
     * 确定选卡
     */
    carry: function() {
        var _this = this;
        checkoutCard = cardType[selectCardIndex];
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        //查询账单信息
        _this.getBillingInfo(checkoutCard, ShopNo, BusinessNo).then(function(data) {
            wx.hideLoading();

            need = data.need;

            _this.setData({
                BillingInfo: data.info,
                BusinessNo: BusinessNo,
                need: need,
                bsname: data.bsname,
                selectCardDisplay: 'display:none;',
                checkoutCard: null,
                offer_amount: data.offer_amount
            });

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
            return false;
        });
    },

    /**
     * 获取账单信息
     */
    getBillingInfo: function(checkoutCard, shopNo, businessNo) {
        var p = new Promise(function(resolve, reject) {
            var openid = wx.getStorageSync('openid');
            wx.request({
                url: common.config.host + '/index.php/Api/Base/getBillingInfo',
                data: {
                    'authorizerId': app.globalData.authorizerId,
                    'openid': openid,
                    'checkoutCard': checkoutCard,
                    'shopNo': shopNo,
                    'businessNo': businessNo
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
                                reject('没有查询到账单信息');
                            } else {
                                resolve(res.data);
                            }
                        } else {
                            reject(res.data.info);
                        }
                    } else {
                        reject('请求失败，服务器错误');
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

    /**
     * 点击跳转至充值
     */
    jumpurl: function(e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url,
        });
    },

    /**
     * 确定付款
     */

    nowPay: function() {
        //审核页面打开时间是否大于5分钟
        var currentTima = new Date().getTime();
        if ((openPageTime + 300000) < currentTima) {
            wx.showModal({
                title: '提示',
                content: '当前页面超过5分钟未操作，请重新进入',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
            });
            return false;
        }

        wx.showModal({
            title: '提示',
            content: '确定要付款吗？',
            success: function(res) {
                if (res.confirm) {
                    //卡内余额是否足够买单
                    if (checkoutCard.Balance < need) {
                        if ((checkoutCard.Balance + checkoutCard.AuthMoney) < need) {
                            wx.showModal({
                                title: '提示',
                                content: '卡内余额不足，请充值',
                                success: function(res) {
                                    if (res.confirm) {
                                        wx.navigateTo({
                                            url: '/pages/component/pages/recharge-amount/recharge-amount?cardno=' + checkoutCard.CardNo + '&shopno=' + checkoutCard.ShopNo + '&jumpback=1',
                                        });
                                    }
                                }
                            });
                            return false;
                        } else {
                            wx.showModal({
                                title: '提示',
                                content: '卡内余额不足，将使用授信金额',
                                showCancel: false
                            });
                        }
                    }

                    wx.showLoading({
                        title: '加载中',
                        mask: true
                    });

                    //获取手机设备信息
                    var systemInfo = '';
                    try {
                        var res = wx.getSystemInfoSync();
                        systemInfo = res.model;
                    } catch (e) {
                        systemInfo = '未知（获取失败）';
                    }

                    checkoutCard['systemInfo'] = systemInfo;

                    //结账请求
                    var openid = wx.getStorageSync('openid');
                    wx.request({
                        url: common.config.host + '/index.php/Api/Requestdata/memberCheckout',
                        data: {
                            'authorizerId': app.globalData.authorizerId,
                            'openid': openid,
                            'checkoutCard': checkoutCard,
                            'shopNo': ShopNo,
                            'businessNo': BusinessNo
                        },
                        method: 'POST',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function(res) {
                            wx.hideLoading();
                            if (res.statusCode == 200) {
                                if (res.data.status == 1) {
                                    wx.showModal({
                                        title: '提示',
                                        content: res.data.info,
                                        showCancel: false,
                                        success: function(res) {
                                            if (res.confirm) {
                                                wx.navigateBack();
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
                }
            }
        });
    },

    /**
     * 锁单请求
     */
    lockOrder: function(shopNo, businessNo) {
        var p = new Promise(function(resolve, reject) {
            //锁单请求
            wx.request({
                url: common.config.host + '/index.php/Api/Requestdata/lockOrder',
                data: {
                    'authorizerId': app.globalData.authorizerId,
                    'shopNo': shopNo,
                    'businessNo': businessNo
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function(res) {
                    wx.hideLoading();
                    if (res.statusCode == 200) {
                        if (res.data.status == 1) {
                            resolve(res.data);
                        } else {
                            reject(res.data.info);
                        }
                    } else {
                        reject('请求失败，服务器错误');
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
    }

})
