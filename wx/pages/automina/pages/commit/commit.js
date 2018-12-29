var app = getApp();
var util = require('../../../../utils/util.js');
var common = require('../../../../common.js');

Page({
    /**
     * 页面的初始数据
     *  一、选择支付方式 默认微信 全选商品
     *  二、切换支付方式为会员卡  请求会员折扣  bindchange
     *  三、全选操作，勾选/取消商品   selectlList selectAll
     *  四、计算总价操作  cartCount
     *
     *
     * paystatus:true  付款状态   true 可以 提交订单付款  false 不可提交订单
     */
    data: {
        cart: {},
        mmcart: {},
        goods: {},
        goodsList: {},
        userinfo: {},
        arrivetime: 5,
        addr: '',
        toright: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/toright.png',
        storeimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/store.png',
        light: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/light.png',
        x: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/x.png',
        selectedimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/selected.png',
        noselectedimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/noselected.png',
        defaultcardimg: "https://iservice.daqisoft.cn/Public/Home/images/amimgs/3mcard.png",
        note: '口味、偏好、要求等',
        noteword: "",
        payWayList: [],
        pwseleted: 0,
        showPayWay: false,
        store: null,
        showImgUrl: null,
        onlycash: false,
        pyselected: 0,
        selectAllStatus: false,
        MutexSign: "",
        phoneinfo: {},
        roomname: "",
        paystatus: true
    },

    onLoad: function() {
        var store = wx.getStorageSync("store")
        this.setData({
            cart: app.cart,
            mmcart: app.cart,
            goods: app.goods,
            goodsList: app.goodsList ? app.goodsList : "",
            addr: app.addr,
            roomname: wx.getStorageSync("roomname"),
            store: store,
            showImgUrl: app.globalData.showImgUrl,
            phoneinfo: wx.getStorageSync("phoneinfo"),
            fooddefpic: wx.getStorageSync("fooddefpic")
        });
        //加载会员卡信息phoneinfo: wx.getStorageSync("phoneinfo"),


        var shopno = store['request_id'].split("#")[0]
        this.loaddata('/index.php/Api/AutoBase/getMMVipCard', {
            "authorizerId": app.globalData.authorizerId,
            "type": "2",
            "openid": wx.getStorageSync("openid"),
            "isstoresort": 0,
            "shopno": shopno
        }, 1)

        
    },

    /* 加载数据 */
    loaddata: function(url, data, operate) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        var that = this

        new Promise(function(resolve, reject) {
            wx.request({
                url: common.config.host + url,
                data: data,
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function(res) {
                    //resolve(res, operate)
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
        });
    },

    /* 处理加载过来的数据
         res   成功的数据   operate   加载  1-加载会员卡信息   2-加载会员卡项目优惠信息
    */
    dealdata: function(res, operate) {
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
                        for (var i in res.data.info) {
                            payWayList.push(res.data.info[i])
                            //当拥有当前门店会员卡时默认支付方式为当前门店第一张卡
                            if (this.data.pyselected == 0 &&
                                res.data.info[i].ShopNo == shopno) {
                                this.setData({
                                    pyselected : i
                                })
                                //更换选中会员卡
                                this.selectPayWay(i, 2)
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

    /* ①第一步  选择切换支付方式   e.detail.currentItemId=0 微信支付，  否则会员卡支付  */

    selectPayWay: function(e, channel) {
        var paywayindex;
        if (channel == 2) {
            paywayindex = e
        } else {
            paywayindex = e.currentTarget.dataset.autoid;
        }
        console.log('paywayindex' + paywayindex)
        var that = this
        that.setData({
            pyselected: paywayindex,
        })
        var goods = that.data.goods
        var cart = that.data.cart
        //若选到了会员 那么请求服务器会员折扣
        if (paywayindex > 0) {

            var card = this.data.payWayList[paywayindex]
            //拼接商品 编号
            var ItemsNo = ""
            var list = cart.list
            for (var k in list) {
                if (goods[k].onlycash == 0)
                    ItemsNo += k + ","
            }
            //若有 会员卡买单的东西
            if (ItemsNo != '') {
                // this.loaddata('/index.php/Api/AutoMina/commit', {
                //   "authorizerId": app.globalData.authorizerId,
                //   "nodeId": wx.getStorageSync('store')['request_id'],
                //   "ItemsNo": ItemsNo,
                //   "OpenCardShopNo": card.ShopNo,
                //   "MMCardNo": card.CardNo,
                //   "list": list,
                // }, 2)
                wx.showLoading({
                    title: '加载中...',
                    mask: true
                })
                new Promise(function(resolve, reject) {
                    wx.request({
                        url: common.config.host + '/Api/AutoMina/commit',
                        data: {
                            'authorizerId': app.globalData.authorizerId,
                            "nodeId": wx.getStorageSync('store')['request_id'],
                            "ItemsNo": ItemsNo,
                            "OpenCardShopNo": card.ShopNo,
                            "MMCardNo": card.CardNo,
                            "list": list,
                        },
                        method: 'POST',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function(res) {
                            resolve(res)
                        },
                        fail: function(res) {
                            reject(res)
                        }
                    });
                }).then(function(res) {
                    wx.hideLoading()
                    cart.iteminfo = res.data.iteminfo
                    that.setData({
                        cart: cart,
                    })
                    that.passiveSelectAll()
                    //隐藏选择结果
                    that.hidePayWay()
                }).catch(function(res) {
                    wx.hideLoading()
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
                    that.passiveSelectAll()
                })
            } else { //只有微信支付的商品
                that.passiveSelectAll()
            }
        } else {
            that.passiveSelectAll()
            //若选择了微信支付  重新计算总价
            that.countCart()
            //隐藏选择结果
            that.hidePayWay()
        }

    },

    /* 计算操作后的 总价格*/
    countCart: function() {

        var total = 0
        var count = 0
        var cart = this.data.cart
        var goods = this.data.goods
        var pyselected = this.data.pyselected
        for (var id in cart.list) {
            if (goods[id].selected) {
                count += cart.list[id];
                if (pyselected > 0) { //会员卡cart.iteminfo
                    var iteminfo = cart.iteminfo
                    if (iteminfo) {
                        total += iteminfo[id].BasePrice * cart.list[id];
                        goods[id].totalprice = parseFloat((iteminfo[id].BasePrice * cart.list[id]).toFixed(2));
                    }
                } else { //微信
                    total += goods[id].itembaseprice * cart.list[id];
                    goods[id].totalprice = parseFloat((goods[id].itembaseprice * cart.list[id]).toFixed(2));
                }

            }
        }

        total = parseFloat((total).toFixed(2))
        cart.count = count;
        cart.total = total;
        this.setData({
            cart: cart,
            goods: goods
        });
    },

    //点击  提交事件
    tosubmit: function(e) {
        var that = this
        var goods = that.data.goods
        var cart = that.data.cart
        var pyselected = that.data.pyselected

        var paystatus = that.data.paystatus //true 可提交  false不可提交
        if (!paystatus) {
            wx.showToast({
                icon: "none",
                title: '当前已有订单提交，请稍候提交!',
                mask: true,
            })
            return false
        } else {
            that.setData({
                paystatus: false
            })
        }

        //判断是否有选中了商品
        var gcount = 0
        for (var id in cart.list) {
            if (goods[id].selected) {
                gcount++
            }
        }

        if (gcount == 0) {
            wx.showToast({
                icon: "none",
                title: '请选择商品后提交！',
                mask: true,
            })
            that.setData({
                paystatus: true
            })
            return false
        }


        var date = new Date()
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        var second = date.getSeconds();
        second = second < 10 ? ('0' + second) : second;
        //订单号
        var orderNO = y + '' + m + '' + d + '' + h + '' + minute + '' + second + '' + Math.ceil(Math.random() * (9999 - 1000) + 1000)

        var cart = this.data.cart

        if (pyselected > 0) {
            //判断会员卡余额是否充足
            var card = this.data.payWayList[pyselected]

            var emoney = parseFloat(card.CardNum) + parseFloat(card.SendNum)

            if (cart.total > emoney) {
                wx.showToast({
                    image: '../../imgs/warn.png',
                    title: '卡上余额不足！',
                    mask: true
                })
                that.setData({
                    paystatus: true
                })
                return false
            } else {

                //保存prepay_id用于发送小程序模版信息
                var prepay_id = e.detail.formId
                var openid = wx.getStorageSync("openid")
                common.savePrepayId(app.globalData.authorizerId, openid, prepay_id);
                this.submit(e, orderNO)
            }

        } else {
            //选择的是微信支付
            if (cart.total > 0) {
                this.wechatPay(e, orderNO)
            } else {

                //保存prepay_id用于发送小程序模版信息
                var prepay_id = e.detail.formId
                var openid = wx.getStorageSync("openid")
                common.savePrepayId(app.globalData.authorizerId, openid, prepay_id)
                this.submit(e, orderNO)
            }

        }
    },

    /*  提交订单    */
    submit: function(e, orderNO, signno = '') {
        var formId = e.detail.formId

        var that = this
        var pyselected = that.data.pyselected
        var card = that.data.payWayList[that.data.pyselected]
        var cart = that.data.cart
        var goods = that.data.goods

        //判断是否有选中了商品
        var gcount = 0

        for (var id in cart.list) {
            if (goods[id].selected) {
                gcount++
            }
        }

        if (gcount == 0) {
            wx.showToast({
                icon: "none",
                title: '请选择商品后提交！',
                mask: true,
            })
            that.setData({
                paystatus: true
            })
            return false
        }




        wx.showLoading({
            title: '提交中...',
            mask: true
        })


        //提交订单
        const timstamp = Date.parse(new Date()) / 1000;
        const fivemafter = timstamp + 5 * 60;
        const five_date = new Date(fivemafter * 1000);
        var h = five_date.getHours() < 10 ? "0" + five_date.getHours() : five_date.getHours();
        var m = five_date.getMinutes() < 10 ? "0" + five_date.getMinutes() : five_date.getMinutes();

        var preTime = h + ':' + m;
        // const timstamp = Date.parse(new Date()) / 1000;
        // var orderNO = timstamp + '' + Math.ceil(Math.random() * (9999 - 1000) + 1000)//随机数1000-9999 保持4位数
        this.setData({
            MutexSign: orderNO
        })
        var orderTime = util.formatTime(new Date())

        var shopno = that.data.store['request_id'].split("#")[0]
        //向服务器提交数据
        var taskjson = new Object;
        var goods = that.data.goods
        var notevalues = that.data.notevalues
        taskjson.RoomNo = app.addr
        taskjson.RoomNa = that.data.roomname

        var arr = new Array
        var sname = ""
        for (var id in cart.list) {
            if (goods[id].selected) {
                var taskjsonchild = new Object
                taskjsonchild.ServiceItemNo = id
                taskjsonchild.ServiceItemName = goods[id].serviceitemname
                sname += taskjsonchild.ServiceItemName + ","
                taskjsonchild.ServiceNum = cart.list[id]
                taskjsonchild.ServiceCategoryNo = goods[id].servicecategoryno

                taskjsonchild.OPrice = goods[id].itembaseprice
                taskjsonchild.RPrice = pyselected > 0 ? cart.iteminfo[id].BasePrice : goods[id].itembaseprice
                taskjsonchild.OMoney = goods[id].itembaseprice * cart.list[id]
                taskjsonchild.NMoney = cart.list[id] * taskjsonchild.RPrice
                taskjsonchild.Note = ""
                if (notevalues) {
                    taskjsonchild.Note = notevalues[id] ? notevalues[id] : ""
                }
                arr.push(taskjsonchild)
            }
        }
        taskjson.arr = arr

        if (this.data.pyselected > 0) {
            taskjson.PayType = 1
            taskjson.SignNo = card.RecNo //会员卡标识

            taskjson.BMTypeNo = card.YWMembershipTypeNo //业务门店会员卡类型编号
            taskjson.BMTypeName = card.YWMembershipTypeName //业务门店会员卡类型

            taskjson.OShopNo = card.ShopNo //开卡门店
            taskjson.OShopName = card.ShopName //开卡门店名称
            taskjson.CardNo = card.CardNo //会员卡卡号
            taskjson.OMTypeName = card.MembershipTypeName //开卡门店会员卡类型

            taskjson.CardNum = card.CardNum //充值余额
            taskjson.SendNum = card.SendNum //赠送余额
            taskjson.AuthMoney = card.AuthMoney //授信额度
            taskjson.CardScoring = card.CardScoring //积分余额
        } else {
            taskjson.PayType = 0
            //this.wechatPay(e)
            taskjson.SignNo = signno //微信支付商户单号



        }
        taskjson.BShopNo = shopno //业务门店标识
        taskjson.BShopName = that.data.store['store_name'] //业务门店名称
        taskjson.PayMoney = cart.total
        taskjson.Count = cart.count


        var phoneno = wx.getStorageSync("phoneinfo").phone

        var sysinfo = wx.getSystemInfoSync() //获取当前设备信息
        var kvinfos = {
            "RGUID": "",
            "PhoneNo": phoneno,
            "ShopNo": shopno,
            "MutexSign": orderNO,
            "TaskID": "7",
            "TaskName": "自助点单",
            "TaskJson": taskjson,
            "TaskTime": "",
            "TaskSrc": sysinfo.brand + " " + sysinfo.model,
            "TaskState": "1",
            "TaskResult": ""
        }

        that.loaddata('/index.php/Api/OnLineTasks/operate', [{
            "authorizerId": app.globalData.authorizerId,
            "taskid": 1,
            "tablename": "onlinetasks",
            "conditions": "",
            "kvinfos": kvinfos,
        }], 3)

        //测试模板消息

        if (taskjson.SignNo || (taskjson.SignNo == '' && taskjson.PayMoney == 0)) { //防止还未返回支付数据时就提交  发送模板消息请求



            sname = sname.substr(0, sname.length - 1);
            let Obj = new Object
            Obj.orderNO = orderNO
            Obj.orderTime = orderTime
            Obj.store_name = that.data.store['store_name']
            Obj.total = cart.total
            Obj.PayType = taskjson.PayType
            Obj.sname = sname

            that.setData({
                Obj: Obj
            })
            // this.test(orderNO, orderTime, that.data.store['store_name'], cart.total, taskjson.PayType, sname)

        }

    },
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
    /* 微信支付*/
    wechatPay: function(e, ono) {
        //选择微信支付
        var that = this
        var paystatus = that.data.paystatus
        var openid = wx.getStorageSync('openid');
        var cart = this.data.cart;
        var nodeid = wx.getStorageSync("store").request_id
        var trid = ""

        wx.request({
            url: common.config.host + '/index.php/Api/AutoMina/autominaUniformOrders',
            data: {
                'authorizerId': app.globalData.authorizerId,
                'openid': openid,
                'total_fee': cart.total,
                "ono": ono,
                "nodeid": nodeid
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(rs) {


                wx.hideLoading()
                var info = rs.data.info
                if (rs.statusCode == 200) {
                    if (rs.data.status == 1) {
                        //保存prepay_id用于发送小程序模版信息
                        common.savePrepayId(app.globalData.authorizerId, openid, info.package)
                        wx.requestPayment({
                            timeStamp: info.timeStamp,
                            nonceStr: info.nonceStr,
                            package: info.package,
                            signType: info.signType,
                            paySign: info.paySign,
                            success: function(subres) {

                                if (subres.errMsg == 'requestPayment:ok') {
                                    wx.request({
                                        url: common.config.host + '/index.php/Api/AutoMina/getTransactionID',
                                        data: {
                                            'authorizerId': app.globalData.authorizerId,
                                            'openid': openid,
                                            "ono": ono
                                        },
                                        method: 'POST',
                                        header: {
                                            'content-type': 'application/json'
                                        },
                                        success: function(trres) { //付款成功后才提交订单

                                            trid = trres.data.trid
                                            that.submit(e, ono, trid)
                                        },

                                    });
                                }

                            },
                            fail: function(subres) {
                                wx.hideLoading()
                                //更改可支付状态

                                that.setData({
                                    paystatus: true
                                })

                                if (subres.errMsg == 'requestPayment:fail cancel') {
                                    wx.showToast({
                                        title: '支付已取消',
                                        mask: true
                                    });

                                } else {
                                    wx.showModal({
                                        title: '提示',
                                        content: subres.errMsg,
                                        showCancel: false
                                    });
                                }
                            },

                        });
                    } else {
                        that.setData({
                            paystatus: true
                        })
                        wx.showModal({
                            title: '提示',
                            content: info,
                            showCancel: false
                        });
                    }
                } else {
                    that.setData({
                        paystatus: true
                    })
                    wx.showModal({
                        title: '提示',
                        content: info,
                        showCancel: false
                    });
                }
            }

        });


    },

    /* 选择事件  */
    selectList(e) {
        const id = e.currentTarget.dataset.id; // 获取data- 传进来的ID
        let goods = this.data.goods; // 获取购物车列表
        let pyselected = this.data.pyselected; //获取支付方式
        console.log("pyselected", pyselected);
        if (pyselected > 0 && goods[id].onlycash == 1) {
            wx.showToast({
                icon: "none",
                title: '该商品仅支持微信支付~',
            })
            this.setData({
                paystatus: true
            })
            return false
        }
        const selected = goods[id].selected; // 获取当前商品的选中状态
        goods[id].selected = !selected; // 改变状态

        this.setData({
            goods: goods,

        });
        this.changeSelectAll(); //个项商品 选择改变全选状态
        this.countCart(); // 重新获取总价
    },

    //个项商品 选择改变全选状态
    changeSelectAll: function() {
        let cart = this.data.cart
        let pyselected = this.data.pyselected
        var goods = this.data.goods
        var selectAllStatus = true; // 改变全选状态
        for (var i in cart.list) {
            if (pyselected > 0) {
                if (goods[i].onlycash == 0 && !goods[i].selected) {
                    selectAllStatus = !selectAllStatus
                    break
                }
            } else {
                if (!goods[i].selected) {
                    selectAllStatus = !selectAllStatus
                    break // 改变全选状态
                }
            }
        }
        this.setData({
            selectAllStatus: selectAllStatus
        });
    },

    /*全选  主动全选   受全选标志影响
      全选支持当前支付方式的 商品
      pyselected =0  选择  微信支付
      >0  会员卡支付
    */

    initiativeSelectAll: function() {
        let selectAllStatus = this.data.selectAllStatus; // 是否全选状态
        selectAllStatus = !selectAllStatus;
        let goods = this.data.goods
        let cart = this.data.cart
        let pyselected = this.data.pyselected //当前选择的支付方式
        for (var i in cart.list) {
            if (pyselected > 0) {
                if (goods[i].onlycash == 0)
                    goods[i].selected = selectAllStatus; // 改变所有商品状态
            } else {
                goods[i].selected = selectAllStatus; // 改变所有商品状态
            }
        }
        this.setData({
            selectAllStatus: selectAllStatus,
            goods: goods
        });

        this.countCart(); // 重新获取总价
    },

    //被动型的全选
    passiveSelectAll: function() {
        var selectAllStatus = true
        let goods = this.data.goods
        let cart = this.data.cart
        let pyselected = this.data.pyselected //当前选择的支付方式

        var count = 0;
        for (var i in cart.list) {
            if (pyselected > 0) {
                if (goods[i].onlycash == 0) {
                    goods[i].selected = selectAllStatus; // 改变所有商品状态
                    count++;
                } else {
                    goods[i].selected = !selectAllStatus; // 改变现金商品状态  会员卡状态下现金商品不可选择
                }
            } else {
                goods[i].selected = selectAllStatus; // 改变所有商品状态
                count++;
            }
        }
        if (count == 0) { //没有选择的商品
            selectAllStatus = false
        }
        this.setData({
            selectAllStatus: selectAllStatus,
            goods: goods
        });

        this.countCart(); // 重新获取总价
    },


    /**
     *  处理订单提交后情况
     */
    dealAfterOrder: function(res) {
        var that = this
        var pyselected = that.data.pyselected
        var paystatus = that.data.paystatus
        //更改可支付状态
        if (res.data.status == 0) {
            wx.showToast({
                title: '下单成功！',
                mask: true
            });
            if (pyselected > 0) {
                var Obj = that.data.Obj
                //发送服务通知
                that.test(Obj.orderNO, Obj.orderTime, Obj.store_name, Obj.total, Obj.PayType, Obj.sname)
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '下单失败！' + res.data.info,
                showCancel: false,
                mask: true
            })
            that.setData({
                paystatus: true
            })
            return false
        }
        var goods = this.data.goods
        var cart = this.data.cart
        var goodsnames = '您还有'
        for (var id in cart.list) {
            //去掉已经提交的商品
            if (goods[id].selected) {
                delete cart.list[id]
                continue
            } else {
                //叠加未提交的商品名称
                goodsnames += goods[id].serviceitemname + "、"
            }
        }
        goodsnames = goodsnames.substr(0, goodsnames.length - 1)
        goodsnames += "未结算！"
        //Object.keys(cart.list).length  计算json 长度
        //1  还有未结算商品  那么被动全选  2 无未结算商品  跳转到支付完成界面
        if (Object.keys(cart.list).length > 0) {
            //默认选择为微信支付
            that.setData({
                pyselected: 0,
                paystatus: true
            })
            //被动全选
            that.passiveSelectAll()
            wx.showModal({
                title: '提示',
                content: goodsnames,
                showCancel: false
            })
        } else {
            wx.redirectTo({
                url: '../paycomplete/paycomplete?MutexSign=' + this.data.MutexSign,
            })
        }
    },
    /* 完成 订单  备注*/
    tonote: function() {
        // wx.setStorageSync("noteword", this.data.noteword)
        var goods = this.data.goods
        var cart = this.data.cart
        var notevalues = this.data.notevalues
        var choosegoods = []
        for (var id in cart.list) {
            //去掉已经提交的商品
            if (goods[id].selected) {
                if (notevalues) {
                    goods[id].note = notevalues[id] ? notevalues[id] : ""
                }
                choosegoods.push(goods[id])
            }
        }
        wx.setStorageSync("choosegoods", choosegoods)
        wx.navigateTo({
            url: '../note/note',
        })
    },



    //重新计算购物车数据
    onUnload: function() {
        var cart = this.data.cart
        var goods = this.data.goods
        var count = 0
        var total = 0
        for (var i in cart.list) {
            count += cart.list[i]
            total += goods[i].itembaseprice * cart.list[i]
        }
        total = parseFloat((total).toFixed(2))
        cart.count = count
        cart.total = total
        app.cart = cart

    },



    test: function(ono, otime, ostorename, omoney, opayway, ogoodsinfo) {

        //测试模板消息
        // this.test(orderNO, orderTime, that.data.store['store_name'], cart.total, taskjson.PayType, sname)

        var openid = wx.getStorageSync("openid")
        wx.request({
            url: common.config.host + '/index.php/Api/AutoMina/sendMsg',
            data: {
                'authorizerId': app.globalData.authorizerId,
                'openid': openid,
                'ono': ono,
                'otime': otime,
                'ostorename': ostorename,
                'opayway': opayway,
                'omoney': omoney,
                'ogoodsinfo': ogoodsinfo,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
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
        })
        // var that=this
        // that.setData({paystatus:true})
    },

})