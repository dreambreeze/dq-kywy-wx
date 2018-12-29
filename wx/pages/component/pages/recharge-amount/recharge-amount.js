//输入公用配置参数
let common = require('../../../../common.js');
//获取APP
let app = getApp();
//当前要充值的会员卡
var rechargeCard;
//充值规则
var recharRules = [];
//选中的充值金额
var am = 0;
//赠送金额
var gift = 0;
//推销员工号
var salesStaff;
//记录打开页面时间
var openPageTime = 0;
//跳转目标
var jumpBack;
//当前的充值金额规则组
var amountIdx = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        amountIdx: amountIdx,
        //当前要充值的会员卡
        rechargeCard: rechargeCard,
        //图片地址前缀,
        showImgUrl: common.config.showImgUrl,
        //2018-12版本默认图片地址前缀,
        newDefaultImg: common.config.newDefaultImg,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //记录打开页面时间
        openPageTime = new Date().getTime();

        var cardno = options.cardno;
        var shopno = options.shopno;
        jumpBack = options.jumpback;
        //获取当前用户的所有会员卡
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
                                content: '无会员卡类型',
                                showCancel: false
                            });
                        } else {

                            for (var i = 0; i < res.data.info.length; i++) {
                                if (res.data.info[i].CardNo == cardno && res.data.info[i].ShopNo == shopno) {
                                    rechargeCard = res.data.info[i];
                                }
                            }

                            //卡状态是否正常
                            if (rechargeCard.CardState != 0) {
                                var CardStateMsg = '';
                                switch (rechargeCard.CardState) {
                                    case 1:
                                        CardStateMsg = '会员卡已锁定';
                                        break;
                                    case 2:
                                        CardStateMsg = '会员卡已挂失';
                                        break;
                                }
                                wx.showModal({
                                    title: '提示',
                                    content: CardStateMsg,
                                    showCancel: false,
                                    success: function(res) {
                                        if (res.confirm) {
                                            wx.navigateBack();
                                        }
                                    }
                                });
                                return false;
                            }

                            rechargeCard['names'] = res.data.names;
                            rechargeCard['phone'] = res.data.phone;
                            rechargeCard['Balance'] = (parseFloat(rechargeCard.CardNum) + parseFloat(rechargeCard.SendNum));

                            //获取充值规则
                            var ruleArr = [];
                            var rule = !rechargeCard.rules ? ['0=0'] : rechargeCard.rules.split(';');
                            for (var i = 0; i < rule.length; i++) {
                                ruleArr.push({
                                    'am': parseFloat(rule[i].split('=')[0]),
                                    'gift': parseFloat(rule[i].split('=')[1])
                                });
                            }

                            //先排序
                            ruleArr = ruleArr.sort(common.compare('am'));

                            //当前选中的充值金额
                            for (let i = 0; i < ruleArr.length; i++) {
                                if (ruleArr[i].am >= parseFloat(rechargeCard.ReNewLevel)) {
                                    am = ruleArr[i].am;
                                    gift = ruleArr[i].gift;
                                    break;
                                }
                            }
                            am = ruleArr[amountIdx].am,
                            gift = ruleArr[amountIdx].gift,
                            _this.setData({
                                rechargeCard: rechargeCard,
                                recharRules: ruleArr,
                                NewAccLevel: parseFloat(rechargeCard.ReNewLevel),
                                amountIdx: amountIdx,
                            });
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

        //推销员工号
        salesStaff = '';
    },
    /**
     * 点击切换金额
     */
    changeAmount: function(e) {
        if (parseFloat(e.target.dataset.am) < parseFloat(rechargeCard.ReNewLevel)) {
          return false;
        }
        am = e.target.dataset.am;
        gift = e.target.dataset.gift;
        this.setData({
            amountIdx: e.currentTarget.dataset.index
        });
    },

    /**
     * 点击提交按钮
     */
    handleCard: function(e) {
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

        //判别此卡是否不允许充值
        if (rechargeCard.CanReNew == 0) {
            wx.showModal({
                title: '提示',
                content: '此卡不支持在线充值',
                showCancel: false
            });
            return false;
        }

        //是否达到续费标准(金额)
        if (parseFloat(am) < parseFloat(rechargeCard.ReNewLevel)) {
            wx.showModal({
                title: '提示',
                content: '续费金额未达到续费标准金额，此卡续费标准金额为' + rechargeCard.ReNewLevel + '元',
                showCancel: false
            });
            return false;
        }

        //获取手机设备信息
        var systemInfo = '';
        try {
            var res = wx.getSystemInfoSync();
            systemInfo = res.model;
        } catch (e) {
            systemInfo = '未知（获取失败）';
        }

        wx.showLoading({
            title: '加载中',
            mask: true
        });

        var formId = e.detail.formId;

        var openid = wx.getStorageSync('openid');

        wx.request({
            url: common.config.host + '/index.php/Api/Requestdata/rechargeUniformOrders',
            data: {
                'authorizerId': app.globalData.authorizerId,
                'openid': openid,
                'rAmount': am,
                'gAmount': gift,
                'formId': formId,
                'rechargeCard': rechargeCard,
                'userInfo': {
                    'staffNo': salesStaff.trim(),
                    'systeminfo': systemInfo
                }
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                var info = res.data.info;
                if (res.statusCode == 200) {
                    if (res.data.status == 1) {
                        wx.requestPayment({
                            timeStamp: info.timeStamp,
                            nonceStr: info.nonceStr,
                            package: info.package,
                            signType: info.signType,
                            paySign: info.paySign,
                            success: function(res) {

                                if (res.errMsg == 'requestPayment:ok') {
                                    //保存prepay_id用于发送小程序模版信息
                                    common.savePrepayId(app.globalData.authorizerId, openid, info.package);
                                    wx.showToast({
                                        title: '支付成功',
                                        icon: 'success',
                                        mask: true,
                                        success: function() {
                                            if (!jumpBack) {
                                                setTimeout(function() {
                                                    wx.redirectTo({
                                                        url: '/pages/ucentermodel/pages/orders/orders',
                                                    });
                                                }, 1000);
                                            } else if (jumpBack == 1) {
                                                setTimeout(function() {
                                                    wx.navigateBack();
                                                }, 1000);
                                            }
                                        }
                                    });
                                }
                            },
                            fail: function(res) {
                                if (res.errMsg == 'requestPayment:fail cancel') {
                                    wx.showToast({
                                        title: '支付已取消',
                                        mask: true
                                    });
                                } else {
                                    wx.showModal({
                                        title: '提示',
                                        content: res.errMsg,
                                        showCancel: false
                                    });
                                }
                            }
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: info,
                            showCancel: false
                        });
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: info,
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
    },

    /**
     * 监听输入的推销员工号
     */
    salesStaff: function(e) {
        salesStaff = e.detail.value;
    }
})