var app = getApp();
var common = require('../../../../common.js');
Page({

    data: {
        myorder: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/myorder.png',
        my: "我的订单",
        mode: 'aspectFit',
        bespeak: '预约',
        addrimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/addr.png',
        searchimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/search.png',
        noticeimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/msg.png',
        text: '欢迎光临',
        cartimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/cart.png',
        warnimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/warn.png',
        addr: '',
        addimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/add.png',
        reduceimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/reduce.png',
        clearimg: 'https://iservice.daqisoft.cn/Public/Home/images/amimgs/clear.png',
        classifySeleted: '',
        goods: {},
        goodsList: [{}],
        cart: {
            count: 0,
            total: 0,
            list: {}
        },
        projects: {},
        projectsList: [],
        showMask: false, //公告查看
        showCartDetail: false,
        knowproject: false,
        fooddefpic: 'https://iservice.daqisoft.cn/Public/Home/images/fooddef.png',
        topNum: 0,
        //无项目图片的默认项目图
        projectImg: common.config.projectImg,
        showImgUrl: '',
    },
    onLoad: function(options) {

        var that = this
        //获取手机信息
        var openid = wx.getStorageSync('openid')


        //判断是否存在 店铺号房间号 ? wx.getStorageSync("ShopNoRoomNo"):"ShopNo=DQT01@RoomNo=101"

        var ShopNoRoomNo = wx.getStorageSync("ShopNoRoomNo")
        //console.log(ShopNoRoomNo)
        if (ShopNoRoomNo) {
            let sceneArr = ShopNoRoomNo.split('@');
            var ShopNo = sceneArr[0].split('=')[1];
            var RoomNo = sceneArr[1].split('=')[1];
            wx.setNavigationBarTitle({
                title: RoomNo+'房',
            })

            if (ShopNo && RoomNo) {
                wx.showLoading({
                    title: '加载中...',
                })
                wx.request({
                    url: common.config.host + '/index.php/Api/AutoMina/index',
                    data: {
                        "authorizer_appid": app.globalData.authorizerId,
                        "shopno": ShopNo,
                        "roomno": RoomNo
                    },
                    method: 'POST',
                    header: {
                        'content-type': 'application/json'
                    },
                    success: function(res) {
                        // wx.showLoading({
                        //   title: '加载中...',
                        // })
                        if (res.data.status == 1) {
                            var goods = res.data.data
                            for (var i in goods) {
                                goods[i].itembaseprice = parseFloat(goods[i].itembaseprice)
                            }
                            var projects = res.data.projectdata
                            for (var i in projects) {
                                projects[i].pturn = parseFloat(projects[i].pturn)
                            }

                            //再来一单
                            if (app.cart) {
                                var cart = app.cart
                                cart.total = 0;
                                cart.count = 0;
                                for (var i in cart.list) {
                                    if (goods[i]) {
                                        cart.count += cart.list[i];
                                        cart.total += (goods[i].itembaseprice * cart.list[i]) * 1.00
                                    }
                                    if (!goods[i]) {
                                        delete cart.list[i]
                                    }
                                }
                                cart.total = parseFloat((cart.total).toFixed(2))
                                if (cart.list) {
                                    that.setData({
                                        cart: cart
                                    })
                                }
                            }

                            that.setData({
                                goodsList: res.data.category,
                                goods: goods,
                                classifySeleted: res.data.category[0].id,
                                showImgUrl: common.config.showImgUrl,
                                addr: RoomNo,
                                projects: projects,
                                projectsList: res.data.dealprodata
                            })

                            wx.setStorageSync('store', res.data.store)
                            wx.hideLoading()
                        } else {
                            wx.showModal({
                                title: '提示',
                                content: res.data.info + "，请检查是否设置客源无忧商品",
                                showCancel: false,
                                success: function(res) {
                                    if (res.confirm) {
										wx.navigateBack();
                                    }
                                    wx.hideLoading()
                                }

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
                                content: '网络连接失败，请检查您的网络',
                                showCancel: false
                            });
                        }

                    }

                });
            } else {
                wx.showModal({
                    title: '提示',
                    content: '未获取到门店与房间信息',
                    showCancel: false,
                    success: function(res) {
                        if (res.confirm) {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    },
                    fail: function(res) {

                    }
                })
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '未获取当前房间或位置，请扫描二维码后重新进入！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        that.scancode()
                    } else {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                }
            })

        }




        //设置默认商品图片
        wx.setStorageSync("fooddefpic", that.data.fooddefpic)


        //获取房间信息   [门店标识+房号]=>房间名称  键值对 json
        if (ShopNo) {
            wx.request({
                url: common.config.host + '/index.php/Api/AutoBase/getRoomInfo',
                data: {
                    "authorizerId": app.globalData.authorizerId,
                    "shopno": ShopNo,
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function(res) {
                    if (res.data.status == 0) {
                        var roomnameinfo = res.data.info
                        var roomkey = ShopNo + "" + RoomNo
                        var roomname = roomnameinfo[roomkey]
                        wx.setStorageSync("roomname", roomname)
                        that.setData({
                            roomnameinfo: roomnameinfo,
                            roomname: roomname
                        })
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

        if (!openid) {
            //调用获取openid
            common.getLogin(app.globalData.authorizerId).then(function(data) {
                that.getPhoneInfo(data)
            })
        } else {
            that.getPhoneInfo(openid)
        }
    },


    scancode: function() {
        wx.scanCode({
            onlyFromCamera: true,
            scanType: [],
            success: function(res) {
                if (res.path) {
                    console.log(res.path)
                    try {
                        var path = decodeURIComponent(res.path).split("?")
                        var newpath = path[0]
                        console.log(path)
                        var ShopNoRoomNo = path[1].substr(6, path[1].length - 1)
                        wx.setStorageSync("ShopNoRoomNo", ShopNoRoomNo)
                        wx.redirectTo({
                            url: '/pages/automina/pages/detail/detail',
                        })

                        // wx.reLaunch({
                        //   url: '/' + res.path,
                        // });
                    } catch (e) {
                        wx.showModal({
                            title: '提示',
                            content: '获取地址失败，无法跳转',
                            showCancel: false
                        });
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '获取地址失败，无法跳转',
                        showCancel: false
                    });
                }
                // var path = decodeURIComponent(res.path).split("?")
                // var newpath = path[0]
                // console.log(path)
                // var ShopNoRoomNo = path[1].substr(6, path[1].length-1)
                // wx.setStorageSync("ShopNoRoomNo", ShopNoRoomNo)
                // wx.reLaunch({
                //   url: "../../../../" + newpath,
                // })
            },
            fail: function(res) {
                wx.navigateBack({
                    delta: 1
                })
            },
            complete: function(res) {},
        })
    },
    //设置默认选择项
    onShow: function() {
        var that = this

        //订单提交页  点击返回
        if (app.cart) {
            var cart = app.cart
            if (cart.list) {
                that.setData({
                    cart: cart
                })
            }
        }



    },



    //   添加购物车
    tapAddCart: function(e) {
        var id = e.target.dataset.id;

        var goods = this.data.goods[id];

        var num = this.data.cart.list[id] || 0;

        if (num > 8 && goods.onlycash == 0) {
            wx.showToast({
                title: '达到限定数量了',
                image: '../../imgs/warn.png',
                duration: 2000
            })
            return false;

        } else {
            this.addCart(id);
        }


    },
    //从购物车减去
    tapReduceCart: function(e) {
        this.reduceCart(e.target.dataset.id);
    },

    // 内部函数 购物车操作 获取原始信息
    addCart: function(id) {
        var num = this.data.cart.list[id] || 0;
        this.data.cart.list[id] = num + 1;
        this.countCart();

    },
    //内部函数  ，减去商品
    reduceCart: function(id) {
        var num = this.data.cart.list[id] || 0;
        if (num <= 1) {
            delete this.data.cart.list[id];
        } else {
            this.data.cart.list[id] = num - 1;
        }
        this.countCart();
    },
    //内部函数 计算购物车数据
    countCart: function() {
        var count = 0,
            total = 0;

        for (var id in this.data.cart.list) {

            var goods = this.data.goods[id];

            count += this.data.cart.list[id];
            total += (goods.itembaseprice * this.data.cart.list[id]) * 1.00;
        }
        total = parseFloat((total).toFixed(2))
        this.data.cart.count = count;
        this.data.cart.total = total;
        //防止将购物车的商品减空之后，再次加入时出现 购物车详情
        if (count < 1) {
            this.setData({
                showCartDetail: false,
            });
        }
        this.setData({
            cart: this.data.cart,
        });
    },
    //清空购物车
    clear: function() {
        var shopcart = this;
        wx.showModal({
            // title: '提示',
            content: '清空购物车?',
            confirmText: '清空',
            success: function(res) {
                if (res.confirm) {
                    shopcart.setData({
                        cart: {
                            count: 0,
                            total: 0,
                            list: {}
                        },
                        showCartDetail: false,
                    });
                } else if (res.cancel) {
                    return false;

                }
            }
        })


    },
    myorder: function() {
        var phoneinfo = wx.getStorageSync("phoneinfo")
        var that = this
        if (phoneinfo.phone) {
            var goods = this.data.goods
            wx.setStorageSync("goods", goods)
            wx.navigateTo({
                url: '/pages/ucentermodel/pages/orders/orders',
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '您未绑定手机号，请前往绑定',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        app.cart = that.data.cart
                        wx.redirectTo({
                            url: '../../../../pages/ucentermodel/pages/infobind/infobind?returnway=1',
                        })
                    }
                }
            })
        }

    },
    goodsdetail: function(e) {
        var id = e.currentTarget.dataset.id;
        console.log(this.data.goods[id]);
        wx.setStorageSync("good", this.data.goods[id])
        wx.setStorageSync("goods", this.data.goods)
        app.cart = this.data.cart;
        app.addr = this.data.addr;
        app.roomname = this.data.roomname;
        wx.navigateTo({
            url: '../gooddetail/gooddetail',
        })
    },




    onGoodsScroll: function(e) {
        var kp = this.data.knowproject;
        if (!kp) {
            if (e.detail.scrollTop > 10 && !this.data.scrollDown) {
                this.setData({
                    scrollDown: true
                });
            } else if (e.detail.scrollTop < 10 && this.data.scrollDown) {
                this.setData({
                    scrollDown: false
                });
            }

            var scale = e.detail.scrollWidth / 570,
                scrollTop = e.detail.scrollTop / scale,
                h = 0,
                classifySeleted = this.data.goodsList[0].id,
                len = this.data.goodsList.length;
            this.data.goodsList.forEach(function(classify, i) {
                var _h = 70 + classify.goods.length * (46 * 3 + 20 * 2);
                if (scrollTop >= h - 100 / scale) {
                    //if (scrollTop >= (h - 100 / scale)+240) {
                    classifySeleted = classify.id;
                    console.log(classify)
                    console.log(classify.id)
                }
                h += _h;
            });
            this.setData({
                classifySeleted: classifySeleted
                //classifySeleted: this.data.classifyViewed
            });
        }
    },
    tapClassify: function(e) {
        wx.showLoading({
            title: '加载中...',
        })
        var id = e.currentTarget.dataset.id;
        if (id != 'xm') {
            this.setData({
                knowproject: false,
            })
        } else {
            this.setData({
                knowproject: true,
            })
        }

        this.setData({
            classifyViewed: id
        });

        var self = this;
        setTimeout(function() {
            self.setData({
                classifySeleted: id,
                topNum: 0
            });
        }, 10);
        wx.hideLoading()
    },
    showCartDetail: function() {
        //改进展示购物车的方法
        var num = this.data.cart.count;
        if (num > 0) {
            this.setData({
                showCartDetail: !this.data.showCartDetail
            });
        }
    },
    hideCartDetail: function() {
        this.setData({
            showCartDetail: false
        });
    },

    selsize: function(e) {
        console.log(e.currentTarget.dataset.id);
        var that = this;
        var gname = that.data.goods[e.currentTarget.dataset.id].name;

        wx.showModal({
            title: '',
            content: gname,
            showCancel: false,
            confirmText: '',
        })
    },

    submit: function(e) {
        var that = this
        //提交订单必须绑定手机号码
        var phoneinfo = wx.getStorageSync("phoneinfo")
        if (phoneinfo.phone) {
            app.goodsList = that.data.goodsList;
            app.goods = that.data.goods;
            app.cart = that.data.cart;
            app.addr = that.data.addr;
            wx.setStorageSync("goods", that.data.goods)
            wx.navigateTo({
                url: '../commit/commit',
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '您未绑定手机号，请前往绑定',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        app.cart = that.data.cart
                        wx.redirectTo({
                            url: '../../../../pages/ucentermodel/pages/infobind/infobind?returnway=1',
                        })
                    }
                }
            })
        }



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


    //项目预约
    toyy: function() {
        wx.navigateTo({
            url: '../../../reserve/pages/reserve-project/reserve-project',
        })
    },


    /**
     * 点击查看办卡细则
     */
    rules: function() {
        this.setData({
            showMask: true
        });
    },
    /**
     * 关闭办卡细则
     */
    closeRules: function() {
        this.setData({
            showMask: false
        });
    },

})
