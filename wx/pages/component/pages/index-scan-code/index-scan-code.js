let app = getApp();
let common = require('../../../../common.js');
Page({
	/**
	 * 页面的初始数据
	 */
	data:{
		//功能列表
		functionList:[
			{
				jumpName:'handleScanCode',
				bgsrc:'https://iservice.daqisoft.cn/Public/Home/images/newimages/self-order-bg.png',
				name:"自助点单",
			},
			{
				jumpName:'handleCallService',
				bgsrc:'https://iservice.daqisoft.cn/Public/Home/images/newimages/call-service-bg.png',
				name:"呼叫服务",
			},
			{
				jumpName:'handleSelfCheckout',
				bgsrc:'https://iservice.daqisoft.cn/Public/Home/images/newimages/self-checkout-bg.png',
				name:"自助结账",
			},
		],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad:function(){
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
		}).catch(function(data){
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
		wx.reLaunch({
			url:'/pages/index/index?maskDisplay=block',
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
