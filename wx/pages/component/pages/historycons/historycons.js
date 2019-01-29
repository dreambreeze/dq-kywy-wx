var app = getApp();
var common = require('../../../../common.js');
//所有卡类型
var cardType;
//当前要结账的卡
var checkoutCard;
//需付金额
var need = 0;
//账单门店标识，账单号
var ShopNo,BusinessNo;
//记录打开页面时间
let openPageTime = 0;
Page({
	/**
	 * 页面的初始数据
	 */
	data:{
		//图片地址前缀
		showImgUrl:common.config.showImgUrl,
		//2018-12版本默认图片地址前缀,
		newDefaultImg:common.config.newDefaultImg,
		//无会员卡图片的默认会员卡图
		cardPicUrl:common.config.cardPicUrl,
		//所有卡类型
		cardType:cardType,
		isShowPayWay:false,
		checkoutCard:checkoutCard,
		//付款方式
		payWayList:[],
		pyselected:0,
		BillingInfo:{},
		isShowDiscount:false,
		isShowBillLoading:false,
		isShowDisableDiscount:false,
		//可用优惠券列表
		discountList:[],
		//不可用优惠券列表
		disabledDiscountList:[],
		//合计需付
		need:0,
		//优惠金额
		offerAmount:0,
		//卡券支付
		cardNeedAmount:0,
		//微信支付
		weChatNeedAmount:0,
		//当前使用的优惠券数量
		selectCouponsNum:0,
		//最大优惠券使用数量
		maxCouponsNum:0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad:function(options){
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

		if(! ShopNo || ! BusinessNo){
			wx.showModal({
				title:'提示',
				content:'账单编号不存在，获取账单信息失败',
				showCancel:false,
				success:function(res){
					if(res.confirm){
						wx.navigateBack();
					}
				}
			});
			return false;
		}

		//获取用户openid
		var openid = wx.getStorageSync('openid');
		if(! openid){
			openidState = false;
			common.getLogin(app.globalData.authorizerId).then(function(data){
				openidState = true;
				openid = data;
			}).catch(function(data){
				openidState = false;
				wx.showModal({
					title:'提示',
					content:'获取账单信息失败',
					showCancel:false
				});
				return false;
			});
		}

		this.setData({
			isShowBillLoading:true
		})

		clearInterval(openidTime);
		openidTime = setInterval(() => {
			if(openidState){
				clearInterval(openidTime);
				//锁单
				_this.lockOrder(ShopNo,BusinessNo).then((data) => {
					if(data.status == 0){//账单状态处于不可结账状态
						this.hideBillLoading()
						wx.showModal({
							title:'提示',
							content:data.info,
							showCancel:false,
							success:function(res){
								if(res.confirm){
									wx.navigateBack();
								}
							}
						})
					}else if(data.status == 1){ //锁单请求发起成功，等待锁单成功
						//2秒后再次请锁单状态
						setTimeout(() => {
							this.lockOrder(ShopNo,BusinessNo).then((data) => {
								if(data.status == 1){
									//0.5s请求一次锁单是否成功
									let lockInterval = setInterval(() => {
                                        console.log(data)
										this.lockOrder(ShopNo,BusinessNo).then((data) => {
											if(data.status == 2){
												clearInterval(lockInterval)
												this.loadInitData()
											}
										}).catch(function(data){
											this.hideBillLoading()
											wx.showModal({
												title:'提示',
												content:data,
												showCancel:false,
												success:function(res){
													if(res.confirm){
														wx.navigateBack();
													}
												}
											});
										});
									},500)
								}else if(data.status == 2){
									this.loadInitData()
								}
							}).catch(function(data){
								this.hideBillLoading()
								wx.showModal({
									title:'提示',
									content:data,
									showCancel:false,
									success:function(res){
										if(res.confirm){
											wx.navigateBack();
										}
									}
								});
							});
						},2000)
					}else if(data.status == 2){
						this.loadInitData()
					}
				}).catch(function(data){
					this.hideBillLoading()
					wx.showModal({
						title:'提示',
						content:data,
						showCancel:false,
						success:function(res){
							if(res.confirm){
								wx.navigateBack();
							}
						}
					});
				});
			}
		},800);
	},
	/**
	 * 关闭账单loading
	 */
	hideBillLoading(){
		this.setData({
			isShowBillLoading:false
		})
	},
	/**
	 * 初始化 账单 、 优惠券 、 会员卡 数据
	 */
	loadInitData(){
		this.hideBillLoading()
		let _this = this
		//获取用户会员卡
		_this.getOpenCardType().then((data) => {
			//过滤无效会员卡
			if(data.info.length > 1){
				cardType = [];
				for(var i = 0; i < data.info.length; i ++){
					if(data.info[i].CardState == 0){
						cardType.push(data.info[i]);
					}
				}
			}else{
				cardType = data.info;
			}

			if(cardType.length == 0){
				wx.showModal({
					title:'提示',
					content:'会员卡非正常状态，无法结账',
					showCancel:false,
					success:function(res){
						if(res.confirm){
							wx.navigateBack();
						}
					}
				});
				return false;
			}

			//充值金额与充值赠送金额合计成余额
			for(let i = 0; i < cardType.length; i ++){
				cardType[i]['Balance'] = (parseFloat(cardType[i].CardNum) + parseFloat(cardType[i].SendNum));
				cardType[i]['AuthMoney'] = parseFloat(cardType[i].AuthMoney);
			}

			//初始付款方式
			let payWayList = [{
				AutoID:- 1,
				MembershipTypeName:'微信支付',
				pic:'icon-aui-icon-weichat'
			}]

			for(let i in cardType){
				payWayList.push(cardType[i])
				//当拥有当前门店会员卡时默认支付方式为当前门店第一张卡
				if(_this.data.pyselected == 0 && cardType[i].ShopNo == ShopNo){
					checkoutCard = cardType[i]
					_this.setData({
						pyselected:(parseInt(i) + 1),
					})
				}else{
					checkoutCard = payWayList[0]
				}
			}
			_this.setData({
				cardType:cardType,
				checkoutCard:checkoutCard,
				payWayList:payWayList,
			});
			let checkoutParam = checkoutCard.AutoID == - 1?[]:checkoutCard
			//查询账单信息
			this.loadBillInfo(checkoutParam,ShopNo,BusinessNo)
		});
	},

	/**
	 * 选择支付方法
	 * @param e
	 */
	selectPayWay(e){
		let paywayindex = e.currentTarget.dataset.autoid;
		let checkoutCard = this.data.payWayList[paywayindex]
		this.setData({
			pyselected:paywayindex,
			checkoutCard:checkoutCard
		})
		let checkoutParam = checkoutCard.AutoID == - 1?[]:checkoutCard
		//查询账单信息
		this.loadBillInfo(checkoutParam,ShopNo,BusinessNo).then(() => {
			this.setData({
				isShowPayWay:false,
			})
		})
	},

	/**
	 * 选择优惠券
	 */
	selectDiscount(e){
		let discountNo = e.currentTarget.dataset.discountno
		let discountList = this.data.discountList
		let need = this.data.need
		let selectCouponsNum = this.data.selectCouponsNum
		let checkoutCard = this.data.checkoutCard
		let BillingInfo = this.data.BillingInfo
		let maxCouponsNum = this.data.maxCouponsNum

		for(let discount of discountList){
			if(discount.id == discountNo){ //当前优惠券
				if(discount.selected != 1){ //确认使用当前优惠券
					selectCouponsNum ++
				}else{ //取消使用
					selectCouponsNum --
				}
				if(selectCouponsNum > maxCouponsNum){
					wx.showModal({
						title:'提示',
						content:'当前账单最多可选' + maxCouponsNum + '张优惠券',
						showCancel:false
					});
					selectCouponsNum = maxCouponsNum
				}else{
					discount.selected = discount.selected == 0?1:0
				}
				break
			}
		}
		let offerAmount = this.getInitOfferAmount(discountList,BillingInfo)
		this.setData({
			discountList:discountList,
			selectCouponsNum:selectCouponsNum,
			offerAmount:offerAmount,
		})
		this.calculatePrice(need,offerAmount,checkoutCard,BillingInfo)
	},

	/**
	 * 计算 微信支付、会员卡支付 金额
	 * need:合计需付
	 * offerAmount:优惠金额
	 * checkoutCard:当前付款方式
	 * BillingInfo:账单列表
	 */
	calculatePrice(need,offerAmount,checkoutCard,BillingInfo){
		let cardNeedAmount = 0
		let weChatNeedAmount = 0
		let onlyCashAmount = 0
		for(let bill of BillingInfo){
			if(bill.OnlyCash == 1){ //限现金支付
				onlyCashAmount += parseFloat(bill.PaySinglePrice) * parseFloat(bill.ServiceNum)
			}
		}
		if(checkoutCard.AutoId == - 1){ //微信支付
			weChatNeedAmount = (need - offerAmount) < onlyCashAmount?onlyCashAmount:(need - offerAmount)
		}else{ //卡券支付
			cardNeedAmount = parseFloat(need) - parseFloat(offerAmount) - parseFloat(onlyCashAmount)
			cardNeedAmount = cardNeedAmount < 0?0:cardNeedAmount
			weChatNeedAmount = onlyCashAmount
		}
		this.setData({
			cardNeedAmount:cardNeedAmount,
			weChatNeedAmount:weChatNeedAmount,
		})
	},
	/**
	 * 获取初始化选择优惠券张数
	 */
	getSelectCouponsNum(discountList){
		let selectCouponsNum = 0
		let maxCouponsNum = 0
		for(let index in discountList){
			let item = discountList[index]
			if(item.selected == 1){
				selectCouponsNum ++
			}
		}
		this.setData({
			selectCouponsNum:selectCouponsNum,
			maxCouponsNum:selectCouponsNum,
		})
	},
	/**
	 * 获取初始化优惠金额
	 */
	getInitOfferAmount(discountList,BillingInfo){
		let offerAmount = 0
		for(let index in discountList){
			let item = discountList[index]
			if(item.selected && item.selected == 1){
				if(item.cpstype == 'coupons'){ //现金券
					offerAmount += parseFloat(item.amount)
				}else{ //项目券
					for(let bill of BillingInfo){
						if(item.project == bill.ServiceItemName){
							offerAmount += parseFloat(bill.PaySinglePrice)
							break
						}
					}
				}
			}
		}
		return offerAmount
	},
	/**
	 * 显示优惠券弹窗
	 */
	showDiscount(){
		this.setData({
			isShowDiscount:true
		})
	},
	/**
	 * 关闭优惠券弹窗
	 */
	hideDiscount(){
		this.setData({
			isShowDiscount:false
		})
	},
	/**
	 * 获取当前用户所有卡类型
	 */
	getOpenCardType:function(){
		var p = new Promise(function(resolve,reject){
			var openid = wx.getStorageSync('openid'),
					_this = this;

			wx.request({
				url:common.config.host + '/index.php/Api/Base/getVipCard',
				data:{
					'authorizerId':app.globalData.authorizerId,
					'openid':openid,
					'type':2
				},
				method:'POST',
				header:{
					'content-type':'application/json'
				},
				success:function(res){
					wx.hideLoading();
					if(res.statusCode == 200){
						if(res.data.status == 1){
							if(res.data.info == ''){
								wx.showModal({
									title:'提示',
									content:'您还没有会员卡，现在去办卡',
									success:function(e){
										if(e.confirm){
											wx.redirectTo({
												url:'../docard/docard?id=3',
											});
										}else{
											resolve(res.data);
										}
									}
								});
							}
							resolve(res.data);
						}else{
							wx.showModal({
								title:'提示',
								content:res.data.info,
								showCancel:false
							});
						}
					}else{
						wx.showModal({
							title:'提示',
							content:'请求失败，服务器错误',
							showCancel:false
						});
					}
				},
				fail:function(res){
					wx.hideLoading();
					if(res.errMsg == 'request:fail timeout'){
						wx.showModal({
							title:'提示',
							content:'请求超时',
							showCancel:false
						});
					}else{
						wx.showModal({
							title:'提示',
							content:'请求失败',
							showCancel:false
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
	showPayWay:function(){
		this.setData({
			isShowPayWay:true
		})
	},
	hidePayWay:function(){
		this.setData({
			isShowPayWay:false
		})
	},
	/**
	 * 加载处理账单数据
	 */
	loadBillInfo(checkoutParam,ShopNo,BusinessNo){
		var p = new Promise((resolve,reject) => {
			//查询账单信息
			this.getBillingInfo(checkoutParam,ShopNo,BusinessNo).then((data) => {
				wx.hideLoading();
				let BillInfo = data.info
				let offerAmount = this.getInitOfferAmount(data.allcan,BillInfo)
				need = data.need;
				this.calculatePrice(need,offerAmount,checkoutCard,BillInfo)
				//计算该账单 每种商品 的 价格
				for(let bill of BillInfo){
					let billPrice = (bill.PaySinglePrice * bill.ServiceNum).toFixed(2)
					bill.billPrice = billPrice
				}
				this.setData({
					BillingInfo:BillInfo,
					BusinessNo:BusinessNo,
					need:need,
					bsname:data.bsname,
					discountList:data.allcan,
					offerAmount:offerAmount,
					disabledDiscountList:data.cannotuse
				});
				this.getSelectCouponsNum(data.allcan)
				resolve(data.info)
			}).catch(function(data){
				wx.hideLoading();
				wx.showModal({
					title:'提示',
					content:data,
					showCancel:false,
					success:function(res){
						if(res.confirm){
							wx.navigateBack();
						}
					}
				})
				return false
			})
		})
		return p
	},
	/**
	 * 获取账单信息接口调用
	 */
	getBillingInfo:function(checkoutCard,shopNo,businessNo){
		var p = new Promise(function(resolve,reject){
			var openid = wx.getStorageSync('openid');
			wx.request({
				url:common.config.host + '/index.php/Api/Base/getBillingInfo',
				data:{
					'authorizerId':app.globalData.authorizerId,
					'openid':openid,
					'checkoutCard':checkoutCard,
					'shopNo':shopNo,
					'businessNo':businessNo
				},
				method:'POST',
				header:{
					'content-type':'application/json'
				},
				success:function(res){
					wx.hideLoading();
					if(res.statusCode == 200){
						if(res.data.status == 1){
							if(res.data.info == ''){
								reject('没有查询到账单信息');
							}else{
								resolve(res.data);
							}
						}else{
							reject(res.data.info);
						}
					}else{
						reject('请求失败，服务器错误');
					}
				},
				fail:function(res){
					wx.hideLoading();
					if(res.errMsg == 'request:fail timeout'){
						wx.showModal({
							title:'提示',
							content:'请求超时',
							showCancel:false
						});
					}else{
						wx.showModal({
							title:'提示',
							content:'请求失败',
							showCancel:false
						});
					}
				}
			});
		});
		return p;
	},

	/**
	 * 点击跳转至充值页面
	 */
	jumpurl:function(e){
		wx.navigateTo({
			url:e.currentTarget.dataset.url,
		});
	},
	/**
	 * 点击跳转至办卡页面
	 */
	toApplyCard(){
		wx.navigateTo({
			url:"/pages/component/pages/docard/docard",
		});
	},
	/**
	 * 切换显示可用券、不可用券
	 */
	tabDiscount(){
		this.setData({
			isShowDisableDiscount:! this.data.isShowDisableDiscount
		})
	},
	/**
	 * 确定付款
	 */
	nowPay(){
		//审核页面打开时间是否大于5分钟
		var currentTima = new Date().getTime();
		if((openPageTime + 300000) < currentTima){
			wx.showModal({
				title:'提示',
				content:'当前页面超过5分钟未操作，请重新进入',
				showCancel:false,
				success:function(res){
					if(res.confirm){
						wx.navigateBack();
					}
				}
			});
			return false;
		}

		wx.showModal({
			title:'提示',
			content:'确定要付款吗？',
			success:(res) => {
				let checkoutCard = this.data.checkoutCard
				let cardNeedAmount = this.data.cardNeedAmount
				if(res.confirm){
					//卡内余额是否足够买单
					if(checkoutCard.Balance < cardNeedAmount){
						if((checkoutCard.Balance + checkoutCard.AuthMoney) < cardNeedAmount){
							wx.showModal({
								title:'提示',
								content:'会员卡内余额不足，请充值',
								success:function(res){
									if(res.confirm){
										wx.navigateTo({
											url:'/pages/component/pages/recharge-amount/recharge-amount?cardno=' + checkoutCard.CardNo + '&shopno=' + checkoutCard.ShopNo + '&jumpback=1',
										});
									}
								}
							});
							return false;
						}else{
							wx.showModal({
								title:'提示',
								content:'会员卡内余额不足，将使用授信金额',
								showCancel:false
							});
						}
					}
					wx.showLoading({
						title:'加载中',
						mask:true
					});

					//获取手机设备信息
					var systemInfo = '';
					try{
						var res = wx.getSystemInfoSync();
						systemInfo = res.model;
					}catch(e){
						systemInfo = '未知（获取失败）';
					}

					checkoutCard['systemInfo'] = systemInfo;

					//结账请求
					var openid = wx.getStorageSync('openid');

					if(weChatNeedAmount > 0){//存在微信支付
						this.weChatCheckout(openid,ShopNo,BusinessNo)
					}else{
						this.memberCheckout(openid,ShopNo,BusinessNo)
					}
				}
			}
		});
	},

	/**
	 * 含微信支付的账单支付
	 */
	weChatCheckout(openid,ShopNo,BusinessNo){
		let cardNeedAmount = this.data.cardNeedAmount
		let weChatNeedAmount = this.data.weChatNeedAmount
		let selectedCoupons = this.getSelectDiscount()
		wx.request({
			url:common.config.host + '/index.php/Api/Requestdata/weChatCheckout',
			data:{
				'authorizerId':app.globalData.authorizerId,
				'openid':openid,
				'shopNo':ShopNo,
				'businessNo':BusinessNo,
				'checkoutCard':checkoutCard,
				'selectedCoupons':selectedCoupons,
				'cardPayAmount':cardNeedAmount,
				'weChatPayAmount':weChatNeedAmount,
			},
			method:'POST',
			header:{
				'content-type':'application/json'
			},
			success:(data)=>{
				let info = data.info
				wx.hideLoading();
				wx.requestPayment({
					timeStamp:info.timeStamp,
					nonceStr:info.nonceStr,
					package:info.package,
					signType:info.signType,
					paySign:info.paySign,
					success:(res) => {
						if(res.errMsg == 'requestPayment:ok'){
							//保存prepay_id用于发送小程序模版信息
							common.savePrepayId(app.globalData.authorizerId,openid,info.package);

							if(cardNeedAmount > 0){
								this.memberCheckout(openid,ShopNo,BusinessNo)
							}else{
								this.paySuccess()
							}
						}
					},
					fail:(res) => {
						if(res.errMsg == 'requestPayment:fail cancel'){
							wx.showToast({
								title:'支付已取消',
								mask:true
							});
						}else{
							wx.showModal({
								title:'提示',
								content:res.errMsg,
								showCancel:false
							});
						}
					}
				});
			},
			fail:function(res){
				wx.hideLoading();
				if(res.errMsg == 'request:fail timeout'){
					wx.showModal({
						title:'提示',
						content:'请求超时',
						showCancel:false
					});
				}else{
					wx.showModal({
						title:'提示',
						content:'请求失败',
						showCancel:false
					});
				}
			}
		});

	},

	/**
	 * 会员卡支付
	 */
	memberCheckout(openid,ShopNo,BusinessNo){
		let cardNeedAmount = this.data.cardNeedAmount
		let selectedCoupons = this.getSelectDiscount()
		wx.request({
			url:common.config.host + '/index.php/Api/Requestdata/memberCheckout',
			data:{
				'authorizerId':app.globalData.authorizerId,
				'openid':openid,
				'shopNo':ShopNo,
				'businessNo':BusinessNo,
				'checkoutCard':checkoutCard,
				'selectedCoupons':selectedCoupons,
				'payAmount':cardNeedAmount,
			},
			method:'POST',
			header:{
				'content-type':'application/json'
			},
			success:function(res){
				wx.hideLoading();
				if(res.statusCode == 200){
					if(res.data.status == 1){
						this.paySuccess()
					}else{
						wx.showModal({
							title:'提示',
							content:res.data.info,
							showCancel:false
						});
					}
				}else{
					wx.showModal({
						title:'提示',
						content:'请求失败，服务器错误',
						showCancel:false
					});
				}
			},
			fail:function(res){
				wx.hideLoading();
				if(res.errMsg == 'request:fail timeout'){
					wx.showModal({
						title:'提示',
						content:'请求超时',
						showCancel:false
					});
				}else{
					wx.showModal({
						title:'提示',
						content:'请求失败',
						showCancel:false
					});
				}
			}
		});
	},
	/**
	 * 账单支付成功
	 */
	paySuccess(){
		wx.showToast({
			title:'支付成功，跳转中...',
			icon:'success',
			mask:true,
			duration:2000,
			success:function(res){
				wx.navigateTo({
					url:'/pages/ucentermodel/pages/orders/orders',
				});
			}
		});
	},
	/**
	 * 获取已选择优惠券
	 */
	getSelectDiscount(){
		let discountList = this.data.discountList
		let selectedCoupons = []
		for(let discount of discountList){
			if(discount.selected == 1){
				selectedCoupons.push(discount)
			}
		}
		return selectedCoupons
	},
	/**
	 * 锁单请求
	 */
	lockOrder:function(shopNo,businessNo){
		var p = new Promise(function(resolve,reject){
			//锁单请求
			wx.request({
				url:common.config.host + '/index.php/Api/Requestdata/lockOrder',
				data:{
					'authorizerId':app.globalData.authorizerId,
					'shopNo':shopNo,
					'businessNo':businessNo
				},
				method:'POST',
				header:{
					'content-type':'application/json'
				},
				success:function(res){
					wx.hideLoading();
					if(res.statusCode == 200){
						if(res.data.status == 1 || res.data.status == 2){
							resolve(res.data);
						}else{
							reject(res.data.info);
						}
					}else{
						reject('请求失败，服务器错误');
					}
				},
				fail:function(res){
					wx.hideLoading();
					if(res.errMsg == 'request:fail timeout'){
						wx.showModal({
							title:'提示',
							content:'请求超时',
							showCancel:false
						});
					}else{
						wx.showModal({
							title:'提示',
							content:'请求失败',
							showCancel:false
						});
					}
				}
			});
		});
		return p;
	}
})
