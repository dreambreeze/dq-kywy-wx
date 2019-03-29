let app = getApp();
let common = require('../../../../common.js');
Page({
	/**
	 * 页面的初始数据
	 */
	data:{
		//遮罩层显隐
		maskDisplay:'none',
		//商店标识
		ShopNo:'',
		//房间号
		RoomNo:'',
		//功能列表
		functionList:[
			{
				jumpName:'handleScanCode',
				name:"自助点单",
			},
			{
				jumpName:'handleCallService',
				name:"呼叫服务",
			},
			{
				jumpName:'handleSelfCheckout',
				name:"自助结账",
			},
		],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(){
		//获取openid
		let openid = wx.getStorageSync('openid');
		this.setData({
			openid
		})

		//获取功能列表
		this.getFunction()
	},

	/**
	 * 获取服务菜单
	 */
	getFunction(){
		//加载首页后台分配的功能模块
		let fid = common.config.navTabBar[0].id;
		common.getFunction(fid,app.globalData.authorizerId,0,1).then((data) => {
			/*let functionList = data.info
			this.setData({
				functionList
			})*/
		}).catch((data) => {
			this.setData({
				functionList:[],
				info:data
			});
		});
	},

	/**
	 * 扫码下单
	 */
	handleScanCode(){
		wx.navigateTo({
			url:'/pages/automina/pages/detail/detail',
		})
	},

	/**
	 * 呼叫服务
	 */
	handleCallService(){
		this.setData({
			maskDisplay:'block',
			donaldshowIn:'donaldshowIn',
			donaldconshowIn:'donaldconshowIn'
		});
	},

	/**
	 * 点击隐藏呼叫服务
	 */
	hideService(){
		this.setData({
			maskDisplay:'none',
			donaldshowIn:'donaldshowOut',
			donaldconshowIn:'donaldconshowOut'
		});
	},

	/**
	 * 受理呼叫服务
	 */
	serveracceptance(e){
		let {ShopNo,RoomNo,openid} = this.data
		wx.showLoading({
			title:'加载中',
			mask:true
		});
		//获取门店与房间号
		let sceneStr = wx.getStorageSync('ShopNoRoomNo');
		if(!sceneStr){
			wx.hideLoading();
			wx.showModal({
				title: '提示',
				content: '门店与房间信息异常，请重新扫码！',
				showCancel: false,
				success: res => {
					if (res.confirm) {
						wx.navigateBack();
					}
				}
			});
			return
		}
		let sceneArr = sceneStr.split('@');
		ShopNo = sceneArr[0].split('=')[1];
		RoomNo = sceneArr[1].split('=')[1];
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

		//下服务
		wx.request({
			url:common.config.host + '/Api/Requestdata/serveracceptance',
			data:{
				'authorizerId':app.globalData.authorizerId,
				'ShopNo':ShopNo,
				'RoomNo':RoomNo,
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
									this.setData({
										maskDisplay:'none',
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
	 * 自助结账
	 */
	handleSelfCheckout(){
		wx.navigateTo({
			url:'/pages/component/pages/room-scan-code/room-scan-code',
		})
	},
})
