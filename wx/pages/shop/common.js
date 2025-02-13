/**
 * 小程序公用Js
 */

var host = "https://shop.daqisoft.cn"
/**
 * 配置参数
 */
var config = {
  // 下面为公用配置
  showImgUrl: host,
  host: host + '/index',
  
};

/**
 * 技术支持跳转
 */
function jishuzhichi(url) {
  let jumpurl = '';
  if (arguments.length > 0) {
    jumpurl = arguments[0];
  } else {
    jumpurl = 'https://m.daqisoft.cn/index.php/Mobile';
  }
  wx.navigateTo({
    url: '/pages/webView/webView?url=' + encodeURIComponent(jumpurl),
  });
}

/**
 * 验证手机号码是否合法
 **/
function ismobile(value) {
  var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(14[1-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  return mobile.test(value);
}
/**
 * 验证邮箱是否合法
 **/
function isemail(value) {
  var email = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  return email.test(value);
}
//验证是否是座机号
function istel(tel) {
  var telReg = /^\d{3,4}[-]\d{7,8}$/g;
  return telReg.test(tel);
}
//验证是否是数字
function isnumber(a) {
  var reg = /^\d+$/g;
  return (reg.test(a));
}
//验证金额是否正确
function ismoney(money) {
  var reg = /^\d+[\.]?\d+$|\d+$/;
  return reg.test(money);
}

function viewNext(e) {
  var id = e.currentTarget.dataset.id
  wx.navigateTo({
    url: '../goodsdetail/goodsdetail?id=' + id,
  })
}
module.exports.viewNext = viewNext;
module.exports.config = config;
module.exports.jishuzhichi = jishuzhichi;
module.exports.ismobile = ismobile;
module.exports.isemail = isemail;
module.exports.istel = istel;
module.exports.isnumber = isnumber;
module.exports.ismoney = ismoney;
