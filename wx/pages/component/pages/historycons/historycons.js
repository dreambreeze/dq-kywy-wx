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
        //2018-12版本默认图片地址前缀,
        newDefaultImg: common.config.newDefaultImg,
        //无会员卡图片的默认会员卡图
        cardPicUrl: common.config.cardPicUrl,
        //所有卡类型
        cardType: cardType,
        selectCardDisplay: 'display:none;',
        selectCard: selectCard,
        //付款方式
        payWayList: [],
        pyselected: 0,
        BillingInfo: {},
        isShowDiscount: false,
        //优惠券列表
        discountList:[],
        selectedCoupons:{},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var store = wx.getStorageSync("store")
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

        _this.setData({
            discountList:[
                {
                    discountNo: 20181212001,
                    discountNum:50.00,
                    discountType:1,
                    effectiveTime:"2019-10-01",
                    selected:true
                },
                {
                    discountNo: 20181212002,
                    discountNum: '益健足浴',
                    discountType: 2,
                    effectiveTime: "2019-10-01",
                    selected: false
                },
                {
                    discountNo: 20181212003,
                    discountNum: 50.00,
                    discountType: 1,
                    effectiveTime: "2019-10-01",
                    selected: false
                },
            ]    
        })

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
                        //初始付款方式
                        var payWayList = [{
                            AutoID: -1,
                            MembershipTypeName: '微信支付',
                            pic: 'icon-aui-icon-weichat'
                        }]

                        for (let i in cardType) {
                            payWayList.push(cardType[i])
                            //当拥有当前门店会员卡时默认支付方式为当前门店第一张卡
                            if (_this.data.pyselected == 0 && cardType[i].ShopNo == ShopNo) {
                                _this.setData({
                                    pyselected: (parseInt(i) + 1),
                                    selectCard: cardType[i]
                                })
                            }
                        }
                        _this.setData({
                            cardType: cardType,
                            checkoutCard: checkoutCard,
                            selectCard: selectCard,
                            payWayList: payWayList,
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

    /* ①第一步  选择切换支付方式 e.detail.currentItemId=0 微信支付，否则会员卡支付  */
    selectPayWay: function(e, channel) {
        var paywayindex;
        if (channel == 2) {
            paywayindex = e
        } else {
            paywayindex = e.currentTarget.dataset.autoid;
        }
        var that = this
        that.setData({
            pyselected: paywayindex,
            selectCard: that.data.payWayList[paywayindex]
        })
        //若选到了会员 那么请求服务器会员折扣
        if (paywayindex > 0) {
            var card = that.data.payWayList[paywayindex]
            //拼接商品 编号
            var ItemsNo = ""
            var BillingInfo = that.data.BillingInfo
            for (var k in BillingInfo) {
                if (BillingInfo[k].onlycash == 0)
                    ItemsNo += k + ","
            }
            //若有 会员卡买单的东西
            if (ItemsNo != '') {
                that.hidePayWay()
            } else { //只有微信支付的商品
                //that.passiveSelectAll()
                that.hidePayWay()
            }
        } else {
            //that.passiveSelectAll()
            //隐藏选择结果
            that.hidePayWay()
        }
    },
    /**
     * 选择优惠券
     */
    selectDiscount(e){
        var discountNo = e.currentTarget.dataset.discountno
        var discountList = this.data.discountList
        for(let discount of discountList){
            if (discount.discountNo == discountNo){
                discount.selected = !discount.selected
                this.setData({
                    discountList: discountList
                })
            }
        }
    },

    /**
     * 显示优惠券弹窗
     */
    showDiscount() {
        this.setData({
            isShowDiscount: true
        })
    },
    /**
     * 关闭优惠券弹窗
     */
    hideDiscount() {
        this.setData({
            isShowDiscount: false
        })
    },
    /**
     * 会员卡图片错误时绑定默认图片
     */
    errImg() {
        var _errImg = e.target.dataset.errImg;
        var _objImg = "'" + _errImg + "'";
        var _errObj = {};
        _errObj[_errImg] = "../../img/01.png";
        console.log(e.detail.errMsg + "----" + _errObj[_errImg] + "----" + _objImg);
        this.setData(_errObj); //注意这里的赋值方式...
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
     * 选择结账方式弹出层控制
     */
    showPayWay: function() {
        this.setData({
            showPayWay: true
        })
    },
    hidePayWay: function() {
        this.setData({
            showPayWay: false
        })
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
     * 点击跳转至办卡
     */
    toApplyCard(){
        wx.navigateTo({
            url: "/pages/component/pages/docard/docard",
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