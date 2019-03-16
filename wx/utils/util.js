const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year,month,day].map(formatNumber).join('/') + ' ' + [hour,minute,second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1]?n:'0' + n
}

function formatHours(timestamp){
	const myDate = new Date();
	myDate.setTime(timestamp * 1000);
	const fnlTime = myDate.toTimeString().substring(0,5)
	return fnlTime;
}

//内部函数 计算购物车数据  id cart.list
function countCart(id,cart){
	var count = 0,
			total = 0;
	for(var id in cart.list){
		var goods = goods[id];
		count += this.data.cart.list[id];
		total += (goods.itembaseprice * this.data.cart.list[id]) * 1.00;
	}
	total = total.toFixed(2)
	this.data.cart.count = count;
	this.data.cart.total = total;

	this.setData({
		cart:this.data.cart,
	});
}

/**************************************时间格式化处理************************************/
function dateFtt(fmt,date){ //author: meizz
	var o = {
		"M+":date.getMonth() + 1,                 //月份
		"d+":date.getDate(),                    //日
		"h+":date.getHours(),                   //小时
		"m+":date.getMinutes(),                 //分
		"s+":date.getSeconds(),                 //秒
		"q+":Math.floor((date.getMonth() + 3) / 3), //季度
		"S":date.getMilliseconds()             //毫秒
	};
	if(/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1,(date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1,(RegExp.$1.length == 1)?(o[k]):(("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

module.exports = {
	formatTime:formatTime,
	formatHours:formatHours,
	dateFtt:dateFtt
}
