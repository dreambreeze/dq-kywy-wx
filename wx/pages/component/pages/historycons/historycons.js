var app = getApp();
var common = require('../../../../common.js');
//所有卡类型
var cardType;
//当前要结账的卡
var checkoutCard;
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
        isShowPayWay: false,
        checkoutCard: checkoutCard,
        //付款方式
        payWayList: [],
        pyselected: 0,
        BillingInfo: {},
        isShowDiscount: false,
        //优惠券列表
        discountList: [],
        //合计需付
        need: 0,
        //优惠金额
        offerAmount: 0,
        //卡券支付
        cardNeedAmount: 0,
        //微信支付
        weChatNeedAmount: 0,
        //当前使用的优惠券数量
        selectCouponsNum: 0
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

        ShopNo = 'DQT03';
        BusinessNo = '201901260001';

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

                        //初始付款方式
                        let payWayList = [{
                            AutoID: -1,
                            MembershipTypeName: '微信支付',
                            pic: 'icon-aui-icon-weichat'
                        }]

                        for (let i in cardType) {
                            payWayList.push(cardType[i])
                            //当拥有当前门店会员卡时默认支付方式为当前门店第一张卡
                            if (_this.data.pyselected == 0 && cardType[i].ShopNo == ShopNo) {
                                checkoutCard = cardType[i]
                                _this.setData({
                                    pyselected: (parseInt(i) + 1),
                                })
                            }else{
                                checkoutCard = payWayList[0]
                            }
                        }
                        _this.setData({
                            cardType: cardType,
                            checkoutCard: checkoutCard,
                            payWayList: payWayList,
                        });
						let checkoutParam = checkoutCard.AutoID == -1 ? [] : checkoutCard
                        //查询账单信息
                        _this.getBillingInfo(checkoutParam, ShopNo, BusinessNo).then(function(data) {
                            wx.hideLoading();
                            let BillInfo = data.info
                            let offerAmout = checkoutCard.AutoID == -1 ? _this.getInitOfferAmount(data.allcan) : data.offer_amount
                            need = data.need;
							_this.calculatePrice(need,offerAmout,checkoutCard,data.info)
                            _this.setData({
                                BillingInfo: BillInfo,
                                BusinessNo: BusinessNo,
                                need: need,
                                bsname: data.bsname,
                                discountList: data.allcan,
                                offerAmount: offerAmout,
                            });
                            _this.getSelectCouponsNum(data.allcan)
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
    selectPayWay(e) {
        var paywayindex = e.currentTarget.dataset.autoid;
        let checkoutCard = this.data.payWayList[paywayindex]
        this.setData({
            pyselected: paywayindex,
            checkoutCard: checkoutCard
        })
        let checkoutParam = checkoutCard.AutoID == -1 ? [] : checkoutCard
        //查询账单信息
        this.getBillingInfo(checkoutParam, ShopNo, BusinessNo).then((data) => {
            wx.hideLoading();
            need = data.need;
            let BillInfo = data.info
            let offerAmout = checkoutCard.AutoID == -1 ? this.getInitOfferAmount(data.allcan): data.offer_amount
            need = data.need;
			this.calculatePrice(need,offerAmout,checkoutCard,data.info)
            this.setData({
                BillingInfo: data.info,
                BusinessNo: BusinessNo,
                need: need,
                bsname: data.bsname,
                isShowPayWay:false,
                offerAmount: offerAmout,
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
     * 选择优惠券
     */
    selectDiscount(e) {
        let discountNo = e.currentTarget.dataset.discountno
        let discountList = this.data.discountList
        let offerAmout = this.data.offerAmount
        let need = this.data.need
        let selectCouponsNum = this.data.selectCouponsNum
        let checkoutCard = this.data.checkoutCard
        let BillingInfo  = this.data.BillingInfo
        let changeAmount = 0
        for (let discount of discountList) {
            if (discount.id == discountNo) {//当前优惠券
                discount.selected = discount.selected == 0 ? 1 : 0
                //判断获取优惠金额变动值
				if (discount.cpstype == 'coupons') {//现金券
					changeAmount = parseFloat(discount.amount)
				} else {//项目券
					if(checkoutCard.AutoId == -1){
						changeAmount = parseFloat(discount.project_price)
					}else{
						for(let bill of BillingInfo) {
							if(discount.project ==  bill.ServiceItemName){
								changeAmount = parseFloat(bill.PaySinglePrice)
								break
							}
						}
					}
				}
                if (discount.selected == 1){//确认使用当前优惠券
                    selectCouponsNum++
					offerAmout = offerAmout + changeAmount
                }else{//取消使用
					selectCouponsNum--
					offerAmout = offerAmout - changeAmount
                }
                break
            }
        }
        this.calculatePrice(need,offerAmout,checkoutCard,BillingInfo)
        this.setData({
            discountList: discountList
        })
    },
	/**
     * 计算价格
     * need:合计需付
     * offerAmout:优惠金额
     * checkoutCard:当前付款方式
     * BillingInfo:账单列表
	 */
	calculatePrice(need,offerAmout,checkoutCard,BillingInfo){
		let cardNeedAmount = 0
		let weChatNeedAmount = 0
	    let onlyCashAmount = 0
        for(let bill of BillingInfo){
            if(bill.OnlyCash == 1){//限现金支付
				onlyCashAmount += parseFloat(bill.PaySinglePrice)  *  parseFloat(bill.ServiceNum)
            }
        }

        if(checkoutCard.AutoId == -1){//微信支付
			weChatNeedAmount = (need - offerAmout) < onlyCashAmount ? onlyCashAmount : (need - offerAmout)
        }else{//卡券支付
			cardNeedAmount = parseFloat(need) - parseFloat(offerAmout) - parseFloat(onlyCashAmount)
			cardNeedAmount = cardNeedAmount < 0 ? 0 : cardNeedAmount
			weChatNeedAmount = onlyCashAmount
        }
        this.setData({
			cardNeedAmount:cardNeedAmount,
			weChatNeedAmount:weChatNeedAmount
        })
    },
	/**
     * 获取选择优惠券张数
     */
    getSelectCouponsNum(discountList) {
        let selectCouponsNum = 0
        for (let index in discountList) {
            let item = discountList[index]
            if (item.selected == 1) {
                selectCouponsNum++
            }
        }
        this.setData({
            selectCouponsNum: selectCouponsNum,
        })
    },
    /**
     * 微信支付时获取初始化优惠金额
     */
    getInitOfferAmount(discountList){
        let offerAmout = 0
        for (let index in discountList) {
            let item = discountList[index]
            if (item.selected && item.selected == 1) {
                if (item.cpstype == 'coupons'){
                    offerAmout += parseFloat(item.amount)
                }else{
                    offerAmout += parseFloat(item.project_price)
                }
            }
        }
        return offerAmout
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
            isShowPayWay: true
        })
    },
    hidePayWay: function() {
        this.setData({
            isShowPayWay: false
        })
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
    toApplyCard() {
        wx.navigateTo({
            url: "/pages/component/pages/docard/docard",
        });
    },

    /**
     * 确定付款
     */
    nowPay() {
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
            success: (res) => {
                let checkoutCard = this.data.checkoutCard
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
