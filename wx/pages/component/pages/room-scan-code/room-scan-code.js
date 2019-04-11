let app = getApp();
let common = require('../../../../common.js');
//html 转义
let WxParse = require('../../../../wxParse/wxParse.js');
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
		//合计需付
		totalPrice:0,
		//门店编号
		shopNo:'',
		//账单编号
		businessNo:'',
		//房间号
		roomNo:'',
		//手牌号
		handNo:'',
		//门店名称
		bsname:'',
		//账单信息
		billingInfo:null,
		//用户微信Id
		openid:'',
		//功能列表
		functionList:[
			{
				jumpName:'handleScanCode',
				src:'https://iservice.daqisoft.cn/Public/Home/images/newimages/scan-code.png',
				name:"扫一扫",
			},
			{
				jumpName:'handleScanCode',
				src:'https://iservice.daqisoft.cn/Public/Home/images/newimages/self-order.png',
				name:"自助点单",
			},
			{
				jumpName:'handleCallService',
				src:'https://iservice.daqisoft.cn/Public/Home/images/newimages/index_features_02@2x.png',
				name:"呼叫服务",
			},
			{
				jumpName:'reserveTech',
				src:'https://iservice.daqisoft.cn/Public/Home/images/newimages/index_features_03@2x.png',
				name:"预约理疗师",
				url:'/pages/technician/pages/techindex/techindex'
			},
			{
				jumpName:'reserveRoom',
				src:'https://iservice.daqisoft.cn/Public/Home/images/newimages/index_features_04@2x.png',
				name:"房间预约",
				url:'/pages/reserve/pages/reserve-room/reserve-room'
			},
			{
				jumpName:'storeAssess',
				src:'https://iservice.daqisoft.cn/Public/Home/images/newimages/index_features_05@2x.png',
				name:"店面评价",
				url:'/pages/reserve/pages/store-assess/store-assess'
			},
		],
		//资讯列表
		noticeList:[],
		//资讯弹窗显隐标识
		showNotice:false,
		//呼叫服务弹窗显隐标识
		isShowService:false,
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow:function(){
		//二维码参数
		let ShopNoRoomNo = wx.getStorageSync('ShopNoRoomNo')
		let ShopNoRoomNoArr = ShopNoRoomNo.split('@')
		let shopNo = 'DQH02'
		let roomNo = '333'
		if('undefined' !== ShopNoRoomNoArr[0]){
			shopNo = ShopNoRoomNoArr[0].split('=')[1]
			if('RoomNo' == ShopNoRoomNoArr[1].split('=')[0]){
				roomNo = ShopNoRoomNoArr[1].split('=')[1]
			}
		}
		if(! shopNo || ! roomNo){
			wx.showModal({
				title:'提示',
				content:'房间号不存在，获取账单信息失败',
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
		if(! openid || openid == ""){
			common.getLogin(app.globalData.authorizerId).then((data) => {
				openid = data;
			}).catch((data) => {
				this.hideBillLoading()
				wx.showModal({
					title:'提示',
					content:'获取账单信息失败',
					showCancel:false
				});
				return false;
			})
		}
		this.setData({
			isShowBillLoading:true,
			shopNo:shopNo + '',
			roomNo:roomNo + '',
			openid:openid,
		})
		this.getFunction()
		this.loadInitData()
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(){

	},
	//获取菜单列表
	getFunction(){
		//加载首页后台分配的功能模块
		let fid = common.config.navTabBar[0].id;
		common.getFunction(fid,app.globalData.authorizerId,0,1).then((data) => {
			/*let functionList = data.info
			this.setData({
				functionList
			})*/
		}).catch(function(data){
			this.setData({
				functionList:[],
				info:data
			});
		});
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
		//获取账单信息
		this.loadBillInfo()
		//获取资讯列表
		this.getNoticeList()
	},
	/**
	 * 获得资讯列表
	 */
	getNoticeList(){
		common.getNotice(app.globalData.authorizerId,1).then((data) => {
			let noticeList = data.info
			for(let i = 0; i < noticeList.length; i ++){
				noticeList[i].textDesc = noticeList[i].desc.replace(/<[^>]+>|&[^>]+;/g,"").replace(/\s/g,"")
			}
			this.setData({
				noticeList:noticeList
			})
		}).catch((data) => {

		});
	},
	/**
	 * 显示资讯详情
	 * @param e
	 */
	showNotice(e){
		let noticeMsg = e.currentTarget.dataset.desc
		this.setData({
			showNotice:true,
			noticeMsg:noticeMsg
		})
		WxParse.wxParse('noticeMsg','html',noticeMsg,this);
	},

	/**
	 * 隐藏资讯详情
	 * @param e
	 */
	handleNotice(){
		this.setData({
			showNotice:false
		})
	},

	/**
	 * 自助点单
	 */
	handleScanCode(){
		wx.navigateTo({
			url:'/pages/automina/pages/detail/detail',
		})
	},

	/**
	 * 点击显示呼叫服务
	 */
	handleCallService(){
		let ShopNoRoomNo = wx.getStorageSync('ShopNoRoomNo');
		if(! ShopNoRoomNo){
			wx.showModal({
				title:'提示',
				content:'门店标识与房号不存在，请扫描桌面二维码',
				showCancel:true,
				success:(re) => {
					if(re.confirm){
						wx.scanCode({
							onlyFromCamera:true,
							success:(res) => {
								if(res.path){
									try{
										let path = decodeURIComponent(res.path).split("?")
										let newpath = path[0]
										let ShopNoRoomNo = path[1].substr(6,path[1].length - 1)
										wx.setStorageSync("ShopNoRoomNo",ShopNoRoomNo)
										wx.reLaunch({
											url:'/' + res.path + '&isShowService=true',
										});
									}catch(e){
										wx.showModal({
											title:'提示',
											content:'获取地址失败，无法跳转',
											showCancel:false
										});
									}
								}else{
									wx.showModal({
										title:'提示',
										content:'获取地址失败，无法跳转',
										showCancel:false
									});
								}
							},
							fail:(res) => {
								wx.showModal({
									title:'提示',
									content:'调起客户端扫码界面失败',
									showCancel:false
								})
							}
						});
					}
				}
			});

		}else{
			this.setData({
				isShowService:true,
				donaldshowIn:'donaldshowIn',
				donaldconshowIn:'donaldconshowIn'
			});
		}
	},

	/**
	 * 隐藏呼叫服务
	 */
	hideService(){
		this.setData({
			isShowService:false,
			donaldshowIn:'donaldshowOut',
			donaldconshowIn:'donaldconshowOut'
		});
	},

	/**
	 * 加载处理账单数据
	 */
	loadBillInfo(){
		let p = new Promise((resolve,reject) => {
			//查询账单信息
			this.getBillingInfo().then((data) => {
				let {need} = data
				let info = data.info?data.info:''
				//计算该账单 每种商品 的 价格
				if(info){
					for(let bill of info){
						let billPrice = (bill.PaySinglePrice * bill.ServiceNum).toFixed(2)
						bill.billPrice = billPrice
					}
				}
				this.setData({
					billingInfo:info,
					totalPrice:need,
				})
				resolve(info)
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
				url:common.config.host + '/index.php/Api/OnLineTasks/billInfo',
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
						let {bsname} = res.data
						wx.setNavigationBarTitle({
							title:bsname
						})
						this.setData({
							bsname:bsname
						})
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
	 * 受理呼叫服务
	 */
	serveracceptance(e){
		let _this = this;
		//门店与房间号是否存在
		let sceneStr = wx.getStorageSync('ShopNoRoomNo');
		if(! sceneStr){
			wx.showModal({
				title:'提示',
				content:'门店标识与房号不存在，请扫描桌面二维码',
				showCancel:true,
				success:(re) => {
					if(re.confirm){
						wx.scanCode({
							onlyFromCamera:true,
							success:(res) => {
								if(res.path){
									try{
										let path = decodeURIComponent(res.path).split("?")
										let newpath = path[0]
										let ShopNoRoomNo = path[1].substr(6,path[1].length - 1)
										wx.setStorageSync("ShopNoRoomNo",ShopNoRoomNo)
										wx.reLaunch({
											url:'/' + res.path,
										});
									}catch(e){
										wx.showModal({
											title:'提示',
											content:'获取地址失败，无法跳转',
											showCancel:false
										});
									}
								}else{
									wx.showModal({
										title:'提示',
										content:'获取地址失败，无法跳转',
										showCancel:false
									});
								}
							},
							fail:(res) => {
								wx.showModal({
									title:'提示',
									content:'调起客户端扫码界面失败',
									showCancel:false
								})
							}
						});
					}
				}
			});
			return false;
		}

		wx.showLoading({
			title:'加载中',
			mask:true
		});

		let sceneArr = sceneStr.split('@');
		let {shopNo,roomNo} = this.data
		shopNo = sceneArr[0].split('=')[1];
		roomNo = sceneArr[1].split('=')[1];

		//服务名称
		let voiceName = e.currentTarget.dataset.voice;

		//获取手机设备信息
		let systemInfo = '';
		try{
			let res = wx.getSystemInfoSync();
			systemInfo = res.model;
		}catch(e){
			systemInfo = '未知（获取失败）'
		}

		//获取openid
		let openid = wx.getStorageSync('openid');

		//下服务
		wx.request({
			url:common.config.host + '/Api/Requestdata/serveracceptance',
			data:{
				'authorizerId':app.globalData.authorizerId,
				'ShopNo':shopNo,
				'RoomNo':roomNo,
				'voiceName':voiceName,
				'systemInfo':systemInfo,
				'openid':openid
			},
			method:'POST',
			header:{
				'content-type':'application/json'
			},
			success:(res) => {
				if(res.statusCode == 200){
					wx.hideLoading();
					if(res.data.status == 1){
						wx.showModal({
							title:'提示',
							content:'您呼叫的服务已受理成功，请稍等',
							showCancel:false,
							success:(r) => {
								if(r.confirm){
									_this.setData({
										isShowService:false,
										donaldshowIn:'donaldshowOut',
										donaldconshowIn:'donaldconshowOut'
									});
								}
							}
						});
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
						content:'请求失败',
						showCancel:false
					});
				}
			},
			fail:(res) => {
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
	handlerBillPlease(){
		if(! this.data.billingInfo || this.data.billingInfo.length == 0){
			wx.showModal({
				title:'提示',
				content:'暂无账单需要结账',
				showCancel:false
			})
			return
		}
		wx.navigateTo({
			url:'/pages/component/pages/historycons/historycons',
		});
	},
})
