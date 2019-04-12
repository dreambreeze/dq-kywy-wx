var app = getApp();
var common = require('../../../../common.js');
// 引入腾讯地图SDK核心类
const QQMapWX = require('../../../../pages/common/lib/qqmap-wx-jssdk.min.js');
var util = require("../../../../utils/util.js");
var qqmapsdk;
Page({
	/**
	 * 页面的初始数据
	 */
	data:{
		//图片地址前缀
		showImgUrl:common.config.showImgUrl,
		//无会员卡图片的默认会员卡图
		cardPicUrl:common.config.cardPicUrl,
		//app授权吗
		authorizerId:app.globalData.authorizerId,
		//订单信息
		address:null,
		//门店地址
		orderData:null,
		//门店距离
		distance:'未知',
		//在线结账账单唯一标识
		id:'',
		//结账门店标识
		nodeid:'',
		//用户唯一标识
		openid:'',
	},

	/**
	 * 页面加载
	 */
	onLoad(option){
		wx.showLoading({
			title:'加载中',
			mask:true
		});

		// 实例化腾讯地图API核心类
		qqmapsdk = new QQMapWX({
			key:common.config.QQMapWXKey
		});

		let {id,nodeid} = option
		let openid = wx.getStorageSync('openid');
		openid = openid?openid:'omd4W0cMbxQnUkZITcq5ggoWXJtI'
		this.setData({
			id,
			nodeid,
			openid
		})

		//获取账单详情
		this.getOLPDetails()

		//获取小程序广告
		common.getAppletAd().then((data) => {
			this.setData({
				ad:data.info
			});
		}).catch((data) => {
			this.setData({
				ad:false
			});
		});
	},

	/**
	 * 获取在线账单详情
	 */
	getOLPDetails(){
		let {authorizerId,nodeid,openid,id} = this.data
		let params = {
			authorizerId,
			nodeid,
			openid,
			id
		}

		wx.request({
			url:common.config.host + '/index.php/Api/OnLineTasks/getOLPDetails',
			data:JSON.stringify(params),
			method:'POST',
			header:{
				'content-type':'application/json'
			},
			success:(data) => {
				wx.hideLoading()
				let orderData = data.data.info
				//获取地址解析(地址转坐标)
				let address = orderData.storeinfo.province
						+ orderData.storeinfo.city
						+ orderData.storeinfo.area
						+ orderData.storeinfo.address_detail;

				let ckinfos = orderData.amount_info.ckinfos
				for(let item of ckinfos){
					item.Omoney = item.Omoney.toFixed(2)
					item.NeedMoney = (item.Omoney*item.DisCount).toFixed(2)
				}
				orderData.amount_info.ckinfos = ckinfos
				let taskTime = orderData.amount_info.tasktime.replace(/\-/g, "/")
				taskTime = taskTime.substring(0,taskTime.length-4)
				console.log(taskTime)
				orderData.amount_info.tasktime = util.dateFtt('yyyy-MM-dd hh:mm:ss',new Date(taskTime))

				this.setData({
					orderData,
					address,
				})
				//获取门店距离
				if(address){
					this.getDistance()
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
	 * 获取门店距离
	 * @param address
	 */
	getDistance(){
		let {address} = this.data
		common.geocoder(address).then((data) => {
			common.calculateDistance([data]).then((data) => {
				this.setData({
					distance:((data / 1000).toFixed(2)) + 'km'
				})
			}).catch((data) => {
				this.setData({
					distance:'未知'
				})
			});
		}).catch((data) => {
			this.setData({
				distance:'未知'
			})
		});
	},

	/**
	 * 页面跳转
	 */
	jumpPage(ev){
		var url = ev.currentTarget.dataset.url;
		if(typeof url != 'undefined'){
			wx.navigateTo({
				url:url,
			});
		}
	},

	/**
	 * 拨打电话
	 */
	phoneCall(ev){
		var phone = ev.currentTarget.dataset.phone;
		if(! phone){
			wx.showModal({
				title:'提示',
				content:'未设置电话号码',
				showCancel:false
			});
			return false;
		}

		wx.makePhoneCall({
			phoneNumber:phone,
		});
	},

	/**
	 * 打开小程序地图组件展示地址
	 */
	location(){
		if(address){
			wx.showLoading({
				title:'加载中',
				mask:true
			});
			wx.getSetting({
				success(res){
					if(! res.authSetting['scope.userLocation']){
						wx.authorize({
							scope:'scope.userLocation',
							success(res){
								// 用户已经同意
								common.geocoder(address).then((data) => {
									wx.hideLoading()
									wx.openLocation({
										latitude:data.latitude,
										longitude:data.longitude,
										name:this.data.orderData.storeinfo.store_name,
										address:address
									})
								}).catch((data) => {
									wx.hideLoading();
									wx.showModal({
										title:'提示',
										content:data,
										showCancel:false
									});
								})
							},
							fail(){
								wx.hideLoading();
								wx.showModal({
									title:'提示',
									content:'已拒绝使用地理位置，现在去设置允许使用地理位置',
									success:(res) => {
										if(res.confirm){
											wx.openSetting({
												success:(res) => {
													if(res.authSetting['scope.userLocation']){
														wx.showLoading({
															title:'加载中',
															mask:true
														});

														common.geocoder(address).then((data) => {
															wx.hideLoading();
															wx.openLocation({
																latitude:data.latitude,
																longitude:data.longitude,
																name:this.data.orderData.storeinfo.store_name,
																address:address
															});
														}).catch((data) => {
															wx.hideLoading();
															wx.showModal({
																title:'提示',
																content:data,
																showCancel:false
															});
														});
													}
												}
											})
										}
									}
								});
							}
						});
					}else{
						common.geocoder(address).then((data) => {
							wx.hideLoading();
							wx.openLocation({
								latitude:data.latitude,
								longitude:data.longitude,
								name:this.data.orderData.storeinfo.store_name,
								address:address
							});
						}).catch((data) => {
							wx.hideLoading();
							wx.showModal({
								title:'提示',
								content:data,
								showCancel:false
							});
						});
					}
				}
			});
		}else{
			wx.showModal({
				title:'提示',
				content:'未设置地址',
				showCancel:false
			});
		}
	},

	/**
	 * 点击广告跳转链接
	 */
	jumpAd(e){
		let adurl = e.currentTarget.dataset.adurl;
		if(adurl){
			common.jishuzhichi(adurl);
		}
	}
})
