var app = getApp();
var common = require('../../../../common.js');
var util = require("../../../../utils/util.js");
//所有卡类型
var cardType;
//当前要结账的卡
var checkoutCard;
//需付金额
var need = 0;
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
		//账单信息
		billingInfo:{},
		//可用优惠券显隐标识
		isShowDiscount:false,
		//账单加载图 显隐标识
		isShowBillLoading:false,
		//不可用 优惠券显隐标识
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
		//门店编号
		shopNo:'',
		//账单编号
		businessNo:'',
		//房间号
		roomNo:'',
		//手牌号
		handNo:'',
		//用户微信Id
		openId:'',
		//手机型号
		terminal:'',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options){
		//记录打开页面时间
		openPageTime = new Date().getTime();
		//二维码参数
		let option = decodeURIComponent(options.scene)
		let optionArr = option.split('@')
		let businessNo = '201903130001'
		let shopNo = 'DQH01'
		let roomNo = ''
		let handNo = ''
		if('undefined' !== optionArr[0]){
			shopNo = optionArr[0].split('=')[1]
			if('businessNo' == optionArr[1].split('=')[0]){
				businessNo = optionArr[1].split('=')[1]
			}
			if('RoomNo' == optionArr[1].split('=')[0]){
				roomNo = optionArr[1].split('=')[1]
			}
			if('handNo' == optionArr[1].split('=')[0]){
				handNo = optionArr[1].split('=')[1]
			}
		}
		if(! shopNo || ! businessNo){
			wx.showModal({
				title:'提示',
				content:'账单编号不存在，获取账单信息失败',
				showCancel:false,
				success:(res) => {
					if(res.confirm){
						wx.navigateBack();
					}
				}
			});
			return false;
		}
		//获取用户openid
		let openid = wx.getStorageSync('openid');
		if(! openid){
			common.getLogin(app.globalData.authorizerId).then((data) => {
				openid = data;
				this.setData({
					openid:openid
				})
			}).catch((data) => {
				this.hideBillLoading()
				wx.showModal({
					title:'提示',
					content:'获取账单信息失败',
					showCancel:false
				});
				return false;
			});
		}else{
			this.setData({
				openid:openid
			})
		}

		//获取手机设备信息
		let systemInfo = '';
		try{
			let res = wx.getSystemInfoSync();
			systemInfo = res.model;
		}catch(e){
			systemInfo = '未知（获取失败）';
		}

		this.setData({
			isShowBillLoading:true,
			shopNo:shopNo,
			businessNo:businessNo,
			roomNo:roomNo,
			handNo:handNo,
			terminal:systemInfo
		})

		this.lockOrderAndGetBillInfo()
	},

	/**
	 * 页面初始化时 定时器锁单 成功后获取账单信息
	 */
	lockOrderAndGetBillInfo(){
		//定时器
		let openidTime = null;
		clearInterval(openidTime);
		openidTime = setInterval(() => {
			clearInterval(openidTime);
			//锁单
			this.lockOrder().then((data) => {
				if(0 == data.status){ //账单状态处于不可结账状态
					this.hideBillLoading()
					wx.showModal({
						title:'提示',
						content:data.info,
						showCancel:false,
						success:(res) => {
							if(res.confirm){
								wx.navigateBack();
							}
						}
					})
				}else if(1 == data.status){ //锁单请求发起成功，等待锁单成功
					//2秒后再次请锁单状态
					setTimeout(() => {
						this.lockOrder().then((data) => {
							if(1 == data.status){
								//0.5s请求一次锁单是否成功
								let lockInterval = setInterval(() => {
									this.lockOrder().then((data) => {
										if(2 == data.status){
											clearInterval(lockInterval)
											this.loadInitData()
										}
									}).catch((data) => {
										this.hideBillLoading()
										wx.showModal({
											title:'提示',
											content:data,
											showCancel:false,
											success:(res) => {
												if(res.confirm){
													wx.navigateBack();
												}
											}
										});
									});
								},500)
							}else if(2 == data.status){
								this.loadInitData()
							}
						}).catch((data) => {
							this.hideBillLoading()
							wx.showModal({
								title:'提示',
								content:data,
								showCancel:false,
								success:(res) => {
									if(res.confirm){
										wx.navigateBack();
									}
								}
							});
						});
					},2000)
				}else if(2 == data.status){
					this.loadInitData()
				}
			}).catch((data) => {
				this.hideBillLoading()
				wx.showModal({
					title:'提示',
					content:data,
					showCancel:false,
					success:(res) => {
						if(res.confirm){
							wx.navigateBack();
						}
					}
				});
			});
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
		//获取用户会员卡
		this.getOpenCardType().then((data) => {
			//过滤无效会员卡
			if(1 < data.info.length){
				cardType = [];
				for(let i = 0; i < data.info.length; i ++){
					if(0 == data.info[i].CardState){
						cardType.push(data.info[i]);
					}
				}
			}else{
				cardType = data.info;
			}
			if(0 == cardType.length){
				wx.showModal({
					title:'提示',
					content:'会员卡非正常状态，无法结账',
					showCancel:false,
					success:(res) => {
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
				AutoID:'-1',
				MembershipTypeName:'微信支付',
				pic:'icon-aui-icon-weichat'
			}]

			for(let i in cardType){
				payWayList.push(cardType[i])
				//当拥有当前门店会员卡时默认支付方式为当前门店第一张卡 否则 微信支付
				if(0 == this.data.pyselected && cardType[i].shopNo == this.data.shopNo){
					checkoutCard = cardType[i]
					this.setData({
						pyselected:(parseInt(i) + 1),
					})
				}else{
					checkoutCard = payWayList[0]
				}
			}
			this.setData({
				cardType:cardType,
				checkoutCard:checkoutCard,
				payWayList:payWayList,
			});
			//查询账单信息
			this.loadBillInfo()
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
		wx.showLoading({
			title:'加载中',
		})
		//查询账单信息
		this.loadBillInfo().then(() => {
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
		let {discountList,selectCouponsNum,billingInfo,maxCouponsNum} = this.data
		for(let discount of discountList){
			if(discount.id == discountNo){ //当前优惠券
				if(1 != discount.selected){ //确认使用当前优惠券
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
					discount.selected = 0 == discount.selected?1:0
				}
				break
			}
		}
		let offerAmount = this.getInitOfferAmount(discountList,billingInfo)
		this.setData({
			discountList:discountList,
			selectCouponsNum:selectCouponsNum,
			offerAmount:offerAmount,
		})
		this.calculatePrice()
	},

	/**
	 * 计算 微信支付、会员卡支付 金额
	 * need:合计需付
	 * offerAmount:优惠金额
	 * checkoutCard:当前付款方式
	 * billingInfo:账单列表
	 */
	calculatePrice(){
		let {need,offerAmount,checkoutCard,billingInfo} = this.data
		let cardNeedAmount = 0
		let weChatNeedAmount = 0
		let onlyCashAmount = 0
		for(let bill of billingInfo){
			if(1 == bill.OnlyCash){ //限现金支付
				onlyCashAmount += parseFloat(bill.PaySinglePrice) * parseFloat(bill.ServiceNum)
			}
		}
		if(checkoutCard.AutoID == '-1'){ //微信支付
			weChatNeedAmount = need - offerAmount
			cardNeedAmount = 0
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
	getSelectCouponsNum(){
		let selectCouponsNum = 0
		let maxCouponsNum = 0
		let discountList = this.data.discountList
		for(let index in discountList){
			let item = discountList[index]
			if(1 == item.selected){
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
	getInitOfferAmount(discountList,billingInfo){
		let offerAmount = 0
		for(let index in discountList){
			let item = discountList[index]
			if(item.selected && 1 == item.selected){
				if('coupons' == item.cpstype){ //现金券
					offerAmount += parseFloat(item.amount)
				}else{ //项目券
					for(let bill of billingInfo){
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
	getOpenCardType(){
		let p = new Promise((resolve,reject) => {
			wx.request({
				url:common.config.host + '/index.php/Api/Base/getVipCard',
				data:{
					'authorizerId':app.globalData.authorizerId,
					'openid':this.data.openid,
					'type':2
				},
				method:'POST',
				header:{
					'content-type':'application/json'
				},
				success:(res) => {
					wx.hideLoading();
					if(200 == res.statusCode){
						if(1 == res.data.status){
							if('' == res.data.info){
								wx.showModal({
									title:'提示',
									content:'您还没有会员卡，现在去办卡',
									success:(e) => {
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
				fail:(res) => {
					wx.hideLoading();
					if('request:fail timeout' == res.errMsg){
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
	showPayWay(){
		this.setData({
			isShowPayWay:true
		})
	},

	hidePayWay(){
		this.setData({
			isShowPayWay:false
		})
	},

	/**
	 * 加载处理账单数据
	 */
	loadBillInfo(){
		let p = new Promise((resolve,reject) => {
			//查询账单信息
			this.getBillingInfo().then((data) => {
				let {allcan,bsname,cannotuse,need} = data
				let info = data.info?data.info:''
				let offerAmount = this.getInitOfferAmount(allcan,info)
				//计算该账单 每种商品 的 价格
				if(info){
					for(let bill of info){
						let billPrice = (bill.PaySinglePrice * bill.ServiceNum).toFixed(2)
						bill.billPrice = billPrice
					}
				}

				for(let coupon of allcan){
					if(coupon.create_time){
						let d = new Date(parseInt(coupon.create_time) * 1000)
						coupon.create_time = util.dateFtt('yyyy-MM-dd hh:mm:ss',d)
					}
				}

				for(let coupon of cannotuse){
					if(coupon.create_time){
						let d = new Date(parseInt(coupon.create_time) * 1000)
						coupon.create_time = util.dateFtt('yyyy-MM-dd hh:mm:ss',d)
					}
				}

				this.setData({
					billingInfo:info,
					need:need,
					bsname:bsname,
					discountList:allcan,
					offerAmount:offerAmount,
					disabledDiscountList:cannotuse
				});
				this.calculatePrice()
				this.getSelectCouponsNum()
				resolve(info)
			}).catch((data) => {
				wx.showModal({
					title:'提示',
					content:data,
					showCancel:false,
					success:(res) => {
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
	getBillingInfo(){
		let {openid,checkoutCard,shopNo,businessNo,roomNo,handNo} = this.data
		let p = new Promise((resolve,reject) => {
			wx.request({
				url:common.config.host + '/index.php/Api/OnLineTasks/getBillingInfo',
				data:{
					'authorizerId':app.globalData.authorizerId,
					'openid':openid,
					'checkoutCard':checkoutCard,
					'shopNo':shopNo,
					'businessNo':businessNo,
					'roomNo':roomNo,
					'handNo':handNo,
				},
				method:'POST',
				header:{
					'content-type':'application/json'
				},
				success:(res) => {
					wx.hideLoading();
					if(200 == res.statusCode){
						if(1 == res.data.status){
							if('' == res.data.info){
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
				fail:(res) => {
					wx.hideLoading();
					if('request:fail timeout' == res.errMsg){
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
	jumpurl(e){
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
		let currentTima = new Date().getTime();
		if((openPageTime + 300000) < currentTima){
			wx.showModal({
				title:'提示',
				content:'当前页面超过5分钟未操作，请重新进入',
				showCancel:false,
				success:(res) => {
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
				let {checkoutCard,cardNeedAmount} = this.data
				if(res.confirm){
					//卡内余额是否足够买单
					if(checkoutCard.AutoID != '-1' && checkoutCard.Balance < cardNeedAmount){
						if((checkoutCard.Balance + checkoutCard.AuthMoney) < cardNeedAmount){
							wx.showModal({
								title:'提示',
								content:'会员卡内余额不足，请充值',
								success:(res) => {
									if(res.confirm){
										wx.navigateTo({
											url:'/pages/component/pages/recharge-amount/recharge-amount?cardno=' + checkoutCard.CardNo + '&shopNo=' + checkoutCard.shopNo + '&jumpback=1',
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

					//结账请求
					if(0 < this.data.weChatNeedAmount){ //存在微信支付
						this.weChatCheckout()
					}else{
						this.memberCheckout()
					}
				}
			}
		});
	},

	/**
	 * 确认结账时 - 获取结账单与优惠券绑定信息
	 */
	getConsumerdetails(){
		let selectedCoupons = this.getSelectDiscount()
		let {billingInfo} = this.data
		let consumerdetails = []
		for(let conpons of selectedCoupons){
			if(conpons.cpstype == 'coupons'){
				let consumer = {}
				consumer.RecNo = ''
				consumer.ServiceItemNo = ''
				consumer.ServiceNum = ''
				consumer.Omoney = ''
				consumer.PaySinglePrice = ''
				consumer.DisCount = ''
				consumer.PaySinglePrice = ''
				consumer.Nmoney = ''
				consumer.ConsumeNo = ''
				consumer.ServiceItemName = ''
				consumer.StaffWorkNo = ''
				consumer.ServiceNum = ''
				consumer.CouponNo = conpons.CouponNo
				consumer.CouponType = conpons.cpstype
				consumer.CouponNum = conpons.CouponValue
				consumer.CouponName = conpons.cpstype == 'coupons'?'代金券':'项目券'
				consumer.CouponValue = conpons.CouponValue
				consumerdetails.push(consumer)
			}
		}

		for(let bill of billingInfo){
			let consumer = {}
			consumer.RecNo = bill.RecNo
			consumer.ServiceItemNo = bill.ServiceItemNo
			consumer.ServiceNum = bill.ServiceNum
			consumer.Omoney = bill.OMoney
			consumer.PaySinglePrice = bill.PaySinglePrice
			consumer.DisCount = (bill.PaySinglePrice / bill.OPrice).toFixed(2)
			consumer.PaySinglePrice = bill.PaySinglePrice
			consumer.Nmoney = bill.NMoney
			consumer.ConsumeNo = bill.ConsumeNo
			consumer.CouponNum = bill.PaySinglePrice
			consumer.ServiceItemName = bill.ServiceItemName
			consumer.StaffWorkNo = bill.StaffWorkNo
			consumer.ServiceNum = bill.ServiceNum
			consumer.CouponNo = ''
			consumer.CouponType = ''
			consumer.CouponName = ''
			consumer.CouponValue = ''
			//返回第一张匹配项目券
			let index = selectedCoupons.findIndex(value => value.ServiceItemNo && value.ServiceItemNo.indexOf(bill.ServiceItemNo) != '-1')
			if(index != '-1' && selectedCoupons[index].cpstype != 'coupons'){
				consumer.CouponNo = selectedCoupons[index].CouponNo
				consumer.CouponType = selectedCoupons[index].cpstype
				consumer.CouponName = selectedCoupons[index].cpstype == 'coupons'?'代金券':'项目券'
				consumer.CouponValue = selectedCoupons[index].CouponValue
				//选中项目券删除
				selectedCoupons = selectedCoupons.splice(index,1)
			}
			consumerdetails.push(consumer)
		}

		return consumerdetails
	},

	/**
	 * 获取结账参数
	 */
	getCheckoutParam(){
		let selectedCoupons = this.getSelectDiscount()
		let {cardNeedAmount,weChatNeedAmount,openid,shopNo,businessNo,checkoutCard,terminal} = this.data
		let consumerdetails = this.getConsumerdetails()
		let params = {
			authorizerId:app.globalData.authorizerId,
			openid:openid,
			shopNo:shopNo,
			businessNo:businessNo,
			checkoutCard:checkoutCard,
			coupon_info:selectedCoupons,
			cardPayAmount:cardNeedAmount,
			weChatPayAmount:weChatNeedAmount,
			terminal,
			consumerdetails:consumerdetails,
		}
		return params
	},

	/**
	 * 含微信支付的账单支付
	 */
	weChatCheckout(){
		let params = this.getCheckoutParam()
		wx.request({
			url:common.config.host + '/index.php/Api/OnLineTasks/onLinePay',
			data:params,
			method:'POST',
			header:{
				'content-type':'application/json'
			},
			success:(data) => {
				let info = data.info
				wx.hideLoading();
				wx.requestPayment({
					timeStamp:info.timeStamp,
					nonceStr:info.nonceStr,
					package:info.package,
					signType:info.signType,
					paySign:info.paySign,
					success:(res) => {
						if('requestPayment:ok' == res.errMsg){
							//保存prepay_id用于发送小程序模版信息
							common.savePrepayId(app.globalData.authorizerId,openid,info.package);

							if(0 < cardNeedAmount){
								this.memberCheckout(openid,shopNo,businessNo)
							}else{
								this.paySuccess()
							}
						}
					},
					fail:(res) => {
						if('requestPayment:fail cancel' == res.errMsg){
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
			fail:(res) => {
				wx.hideLoading();
				if('request:fail timeout' == res.errMsg){
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
	memberCheckout(){
		let params = this.getCheckoutParam()
		wx.request({
			url:common.config.host + '/index.php/Api/OnLineTasks/memberCheckout',
			data:params,
			method:'POST',
			header:{
				'content-type':'application/json'
			},
			success:(res) => {
				wx.hideLoading();
				if(200 == res.statusCode){
					if(1 == res.data.status){
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
			fail:(res) => {
				wx.hideLoading();
				if('request:fail timeout' == res.errMsg){
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
			success:(res) => {
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
			if(1 == discount.selected){
				selectedCoupons.push(discount)
			}
		}
		return selectedCoupons
	},
	/**
	 * 锁单请求
	 */
	lockOrder(){
		let {shopNo,businessNo,roomNo,handNo} = this.data
		let p = new Promise((resolve,reject) => {
			//锁单请求
			wx.request({
				url:common.config.host + '/index.php/Api/Requestdata/lockOrder',
				data:{
					authorizerId:app.globalData.authorizerId,
					shopNo:shopNo,
					businessNo:businessNo,
					roomNo:roomNo,
					handNo:handNo,
				},
				method:'POST',
				header:{
					'content-type':'application/json'
				},
				success:(res) => {
					wx.hideLoading();
					if(200 == res.statusCode){
						if(1 == res.data.status || 2 == res.data.status){
							resolve(res.data);
						}else{
							reject(res.data.info);
						}
					}else{
						reject('请求失败，服务器错误');
					}
				},
				fail:(res) => {
					wx.hideLoading();
					if('request:fail timeout' == res.errMsg){
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
