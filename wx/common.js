/**
 * 小程序公用Js
 */
// 引入腾讯地图SDK核心类
var QQMapWX = require('/pages/common/lib/qqmap-wx-jssdk.min.js');

var host = "https://iservice.daqisoft.cn"
/**
 * 配置参数
 */
var config = {
  // 下面为公用配置
  //主域名
  host: host,
  //显示图片域名
  showImgUrl: host + '/Uploads/',
  //腾讯地图API KEY
  QQMapWXKey: 'SEABZ-R7CKF-56RJH-NMADQ-ECCZJ-W3FRG',
  //无会员卡图片的默认会员卡图
  cardPicUrl: 'https://note.youdao.com/yws/api/personal/file/WEBb5f7eb3766ee279fc3a8496d7715869b?method=download&shareKey=c969cf0aa8db1957124cbd1f79c86226',
  //默认首页banner图
  bannerImg: host + '/Public/Home/images/home_banner.png',
  //无上传项目图片的默认项目图片
  projectImg: host + '/Public/Home/images/promotions_banner.png',
  //无房间图片的默认房间图片
  roomDefaultImg: host + '/Public/Home/images/room.jpg',
  //导航数据tabBar
  navTabBar: [{
    "fun_name": "首页",
      "fun_img": "https://note.youdao.com/yws/api/personal/file/WEBa8ae747f063959dccfb79236daeb0caa?method=download&shareKey=fc6f4669ead3f7bac33fe6e9ad8ed018",
    "applet_address": "../index/index",
      "notcheck_img": "https://note.youdao.com/yws/api/personal/file/WEBff69204521108f6103560f7e22c14891?method=download&shareKey=fdbee227e26d42402cdaab5293152a60",
    "isTo": true,
    "id": 11
  }, {
    "fun_name": "会员中心",
          "fun_img": "https://note.youdao.com/yws/api/personal/file/WEBf80338360e2ca94d907d7049565db046?method=download&shareKey=84077bafb39fcc2d4256ad368c5a6fba",
    "applet_address": "../vip-center/vip-center",
          "notcheck_img": "https://note.youdao.com/yws/api/personal/file/WEB57b09b32b210cc608401c6cd615efff0?method=download&shareKey=29fc8e5864f0c19abc12cc99a359e7cf",
    "isTo": true,
    "id": 15
  }, {
    "fun_name": "优惠活动",
          "fun_img": "https://note.youdao.com/yws/api/personal/file/WEBec13e85e2dc123b2159b0c92708467e1?method=download&shareKey=358a1eaca2aa0ccd0ad532a60ad4f81b",
    "applet_address": "../promotions/promotions",
          "notcheck_img": "https://note.youdao.com/yws/api/personal/file/WEBff69204521108f6103560f7e22c14891?method=download&shareKey=fdbee227e26d42402cdaab5293152a60",
    "isTo": true,
    "id": 16
  }, {
    "fun_name": "我的",
          "fun_img": "https://note.youdao.com/yws/api/personal/file/WEB1be6a1c5ce01449b6c739ff067dabe05?method=download&shareKey=1fc4d9ea9359573927fff1a14f3b70c2",
    "applet_address": "../ucenter/ucenter",
          "notcheck_img": "https://note.youdao.com/yws/api/personal/file/WEB453fef44f5cda7d7d9ffdf941f16f724?method=download&shareKey=5bd98cc4a1b7ed30f595a7c98a67633a",
    "isTo": true,
    "id": 17
  }]
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
  var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(14[1-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
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

/**
 * 获取小程序功能模块
 * id             一级导航的ID
 * authorizerId   小程序APPID
 * ischunk        是否拆分为每3个一个数组
 */
function getFunction(id, authorizerId, ischunk) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getFunction',
      data: {
        'authorizerId': authorizerId,
        'id': id,
        'ischunk': ischunk
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }

        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 获取所有门店信息
 */
function getStores(authorizerId, geocoder) {
  var p = new Promise(function(resolve, reject) {
    //获取所有门店信息
    wx.request({
      url: host + '/index.php/Api/Base/getStores',
      data: {
        'authorizerId': authorizerId,
        'geocoder': geocoder
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data.info);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 模糊查找
 */
function likeFind(str1, str2) {
  var result = str2.indexOf(str1);
  if (result != -1) {
    return true;
  } else {
    return false;
  }
  return false;
}

/**
 * 获取所有项目信息
 * @param type $authorizerId        小程序APPID
 * @param type $ShopNo               门店节点
 * @param type $currPage             当前第几页
 * @param type $totalPage            一页显示多少条     $currPage==0 && $totalPage==0不分页
 * @param type $autoid              主键ID，0为查询所有
 * @param type $categoryid              分类主键ID，0为查询所有
 * 
 */
function getProjectInfo(authorizerId, ShopNo, currPage, totalPage, autoid, categoryid) {
  var p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getProjectInfo',
      data: {
        'authorizerId': authorizerId,
        'ShopNo': ShopNo,
        'currPage': currPage,
        'totalPage': totalPage,
        'autoid': autoid,
        'categoryid': categoryid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            if (res.data.info) {
              resolve(res.data.info);
            } else {
              reject('无项目信息');
            }

          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 保存prepay_id用于发送小程序模版信息
 */
function savePrepayId(authorizerId, openid, prepay_id) {
  var p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/savePrepayId',
      data: {
        'prepay_id': prepay_id,
        'openid': openid,
        'authorizerId': authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 获取所有房间信息
 * @param type $authorizerId        小程序APPID
 * @param type $ShopNo               门店节点
 * @param type $currPage             当前第几页
 * @param type $totalPage            一页显示多少条     $currPage==0 && $totalPage==0不分页
 * @param type $autoid              主键ID，0为查询所有
 * @param type $categoryid              分类主键ID，0为查询所有
 * 
 */
function getRoomInfo(authorizerId, ShopNo, currPage, totalPage, autoid, categoryid, pnum) {
  var p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getRoomInfo',
      data: {
        'authorizerId': authorizerId,
        'ShopNo': ShopNo,
        'currPage': currPage,
        'totalPage': totalPage,
        'autoid': autoid,
        'categoryid': categoryid,
        'pnum': pnum
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 查询订单
 * @param   guid  当前类型订单的唯一标识号，传空查询所有
 * orderType      订单类型
 */
function checkingOrder(authorizerId, guid, orderType) {
  var p = new Promise(function(resolve, reject) {
    var openid = wx.getStorageSync('openid');

    wx.request({
      url: host + '/index.php/Api/Requestdata/getUserOrder',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
        'guid': guid,
        'orderType': orderType
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 获取腾讯地图地址解析(地址转坐标)
 * address      地址
 * 返回地址精度伟度json
 */
function geocoder(address) {
  var p = new Promise(function(resolve, reject) {
    // 实例化腾讯地图API核心类
    let qqmapsdk = new QQMapWX({
      key: config.QQMapWXKey
    });
    // 调用接口
    qqmapsdk.geocoder({
      address: address,
      success: function(res) {
        if (res.status == 0) {
          resolve({
            'latitude': res.result.location.lat,
            'longitude': res.result.location.lng
          });
        } else {
          reject(res.message);
        }
      },
      fail: function(res) {
        reject('地址转坐标失败');
      }
    });
  });
  return p;
}

/**
 * 腾讯地图地址距离计算
 * latlng    终点坐标地址精度伟度数组json
 * 返回起点到终点的距离，单位：米
 */

function calculateDistance(tolatlng) {
  var p = new Promise(function(resolve, reject) {
    // 实例化腾讯地图API核心类
    let qqmapsdk = new QQMapWX({
      key: config.QQMapWXKey
    });
    // 调用接口
    qqmapsdk.calculateDistance({
      mode: 'driving',
      to: tolatlng,
      success: function(res) {
        if (res.status == 0) {
          resolve(res.result.elements[0].distance);
        } else {
          reject(1);
        }
      },
      fail: function(res) {
        reject(1);
      }
    });
  });

  return p;
}

/**
 * 获取用户信息
 */
function getUInfo(field, authorizerId, openid) {
  var p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Base/getUserInfo',
      data: {
        'openid': openid,
        'field': field,
        'authorizerId': authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 保存用户信息
 */
function saveUserInfo(openid, authorizerId, encryptedData, iv, type) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Base/saveUserInfo',
      data: {
        'openid': openid,
        'authorizerId': authorizerId,
        'encryptedData': encryptedData,
        'iv': iv,
        'type': type
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 数组排序
 */
function compare(prop) {
  return function(obj1, obj2) {
    var val1 = obj1[prop];
    var val2 = obj2[prop];
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
  }
}

/**
 * 微信登录获取openid与sessionKey
 */
function getLogin(authorizerId) {
  var p = new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        wx.request({
          url: host + '/index.php/Api/Base/jscode_session',
          data: {
            'code': res.code,
            'authorizerId': authorizerId
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            if (res.statusCode == 200) {
              if (res.data.status == 1) {
                wx.setStorageSync('openid', res.data.info);
                resolve(res.data.info);
              } else {
                wx.removeStorageSync('openid');
                reject(res.data.info);
              }
            } else {
              wx.removeStorageSync('openid');
              reject('请求失败');
            }
          },
          fail: function(res) {
            if (res.errMsg == 'request:fail timeout') {
              reject('请求超时');
            } else {
              reject('请求失败');
            }
          }
        });
      }
    });
  });

  return p;
}

/**
 * 删除订单
 * authorizerId     小程序链锁店标识
 * guid             订单唯一标识
 */
function delOrder(authorizerId, guid) {
  var p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/delOrder',
      data: {
        'authorizerId': authorizerId,
        'guid': guid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 获取E团购项目
 * authorizerId   小程序APPID
 * nodeid          门店节点标识
 * pid            项目唯一ID
 */
function getProject(authorizerId, nodeid, pid, pname) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getProject',
      data: {
        'authorizerId': authorizerId,
        'nodeid': nodeid,
        'pid': pid,
        'projectname': pname
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 项目加入购物车
 * authorizerId     小程序APPID
 * shopCartArr      加入购物车项目参数
 */

function pushShopCart(authorizerId, shopCartArr) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/pushShopCart',
      data: {
        'authorizerId': authorizerId,
        'shopCartArr': shopCartArr
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 获取购物车项目
 */
function getShopCartNum(authorizerId, shopCartArr) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getShopCartNum',
      data: {
        'authorizerId': authorizerId,
        'shopCartArr': shopCartArr
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 查询用户E团购订单
 * authorizerId     小程序APPID
 * openid           用户openid
 * type             查询订单类型，1查询所有订单，2查询待消费订单，3查询待评价订单
 */
function getEBuyOrder(authorizerId, openid, type) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getEBuyOrder',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
        'type': type
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 查询用户E团购订单详情
 */
function getEBuyDetail(authorizerId, openid, id) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getEBuyDetail',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
        'id': id
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 删除E团购项目订单
 */
function delEBuyItem(authorizerId, id) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/delEBuyItem',
      data: {
        'authorizerId': authorizerId,
        'id': id
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}


/**
 * 删除图片
 */
function delImg(filename) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/delImg',
      data: {
        'filename': filename
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });

  return p;
}

/**
 * 加载评价内容
 * authorizerId     小程序APPID
 * pid              项目ID
 * type             类型，空查询所有，1查询好评，2查询中评，3查询差评
 */
function getAssess(authorizerId, nodeid, pid, type, pageIndex) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getAssess',
      data: {
        'authorizerId': authorizerId,
        'nodeid': nodeid,
        'pid': pid,
        'type': type,
        'pageIndex': pageIndex
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 获取用户已领取的券
 * type 1查询用户有效的券，2查询无效券
 */
function getUserCoupon(authorizerId, openid, type) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getUserCoupon',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
        'type': type
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 用户分享后获取券
 * 
 */
function getShareCoupon(authorizerId, openid) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoBase/getShareCoupon',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 获取门店评价内容
 * authorizerId       小程序APPID
 * openid             用户Openid
 * pageIndex          分页编号
 */
function getStoreAssess(authorizerId, openid, pageIndex, type) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getStoreAssess',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
        'pageIndex': pageIndex,
        'type': type
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 检查功能模块是否开通
 * objectArr      对象数组
 * id             功能ID
 */

function checkFunOpened(objectArr, id) {
  let p = new Promise(function(resolve, reject) {
    for (let i = 0; i < objectArr.length; i++) {
      if (objectArr[i] instanceof Array) {
        for (let j = 0; j < objectArr[i].length; j++) {
          if (objectArr[i][j].id == id) {
            if (objectArr[i][j].is_opened == 0) {
              wx.redirectTo({
                url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=功能暂未开通'
              });
            }
          }
        }
      } else if (objectArr[i] instanceof Object) {
        if (objectArr[i].id == id) {
          if (objectArr[i].is_opened == 0) {
            wx.redirectTo({
              url: '/pages/component/pages/checkPrivilege/checkPrivilege?message=功能暂未开通'
            });
          }
        }
      }
    }
  });
  return p;
}

/**
 * 获取小程序广告
 */
function getAppletAd() {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Requestdata/getAppletAd',
      data: {},
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function(res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 检查小程序使用权限是否过期
 */
function isExpiredTime(authorizerId) {
  let p = new Promise(function(resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Base/isExpired_time',
      data: {
        'authorizerId': authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(1);
          }else{
            reject(1);
          }
        }
      }
    });
  });
  return p;
}


/**
 * 获取小程序名称
 */
function getAppletInfo(authorizerId) {
  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/Base/getAppletInfo',
      data: {
        'authorizerId': authorizerId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}
/**
 * 获取拼团项目
 */
function getGroupShopping(authorizerId, nodeid, pid,openid, orderno, groupno,pstatus) {

  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoBase/getGroupShopping',
      data: {
        'authorizerId': authorizerId,
        'nodeid':nodeid,
        'pid': pid,
        'openid': openid,
        'orderno': orderno,
        'groupno': groupno,
        'pstatus': pstatus
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}
/** 获取拼团订单
    * authorizerId  apid
     * pid  拼团项目id
     * nodeid  适用门店   全国通用  或者当前门店,
     * openid  用户openid,
 
     * orderno  订单号
     * groupno 拼团号
 */
function getGroupOrders(authorizerId, nodeid, pid, openid, orderno, groupno,pstatus) {

  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoBase/getGroupOrders',
      data: {
        'authorizerId': authorizerId,
        'nodeid': nodeid,
        'pid': pid,
        'openid': openid,
        'orderno': orderno,
        'groupno': groupno,
        'pstatus': pstatus
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/** 获取个人 拼团订单   
    * authorizerId  apid
     * pid  拼团项目id
     * nodeid  适用门店   全国通用  或者当前门店,
     * openid  用户openid,
 
     * orderno  订单号
     * groupno 拼团号
 */
function getSinGroupOrders(authorizerId, openid,phone,otype) {
 
  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoBase/getGroupFullOrders',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
        'phone':phone,
        'otype':otype
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data)
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 加载评价内容
 * authorizerId     小程序APPID
 * pid              项目ID
 * type             类型，空查询所有，1查询好评，2查询中评，3查询差评
 */
function getgroupAssess(authorizerId, nodeid, pid, type, pageIndex,tablename) {
  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoMina/getgroupAssess',
      data: {
        'authorizerId': authorizerId,
        'nodeid': nodeid,
        'pid': pid,
        'type': type,
        'pageIndex': pageIndex,
        'tablename': tablename
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/**
 * 获取能给用户发的券
 * type 1
 */
function haveCoupons(authorizerId, openid) {
  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoBase/haveCoupons',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
       
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data.info);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

/** 用户点击事件 触发领券
 * 主动给用户发券
 * type 1
 */
function sendCoupon(authorizerId, openid, has) {
  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoBase/sendCoupon',
      data: {
        'authorizerId': authorizerId,
        'openid': openid,
        'has': has
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}
/** 用户点击事件 跳转到 预约
 
 */
function isVip(authorizerId, phone) {
  let p = new Promise(function (resolve, reject) {
    wx.request({
      url: host + '/index.php/Api/AutoBase/isVip',
      data: {
        'authorizerId': authorizerId,
        'phone': phone,
        
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //返回成功
        if (res.statusCode == 200) {
          
            resolve(res.data);
         
        } else {
          reject('请求失败');
        }
      },
      fail: function (res) {
        if (res.errMsg == 'request:fail timeout') {
          reject('请求超时');
        } else {
          reject('请求失败');
        }
      }
    });
  });
  return p;
}

module.exports.config = config;
module.exports.jishuzhichi = jishuzhichi;
module.exports.ismobile = ismobile;
module.exports.isemail = isemail;
module.exports.istel = istel;
module.exports.isnumber = isnumber;
module.exports.ismoney = ismoney;
module.exports.getFunction = getFunction;
module.exports.getStores = getStores;
module.exports.likeFind = likeFind;
module.exports.getProjectInfo = getProjectInfo;
module.exports.savePrepayId = savePrepayId;
module.exports.getRoomInfo = getRoomInfo;
module.exports.checkingOrder = checkingOrder;
module.exports.geocoder = geocoder;
module.exports.calculateDistance = calculateDistance;
module.exports.getUInfo = getUInfo;
module.exports.compare = compare;
module.exports.getLogin = getLogin;
module.exports.delOrder = delOrder;
module.exports.getProject = getProject;
module.exports.pushShopCart = pushShopCart;
module.exports.getShopCartNum = getShopCartNum;
module.exports.getEBuyOrder = getEBuyOrder;
module.exports.getEBuyDetail = getEBuyDetail;
module.exports.delEBuyItem = delEBuyItem;
module.exports.delImg = delImg;
module.exports.getAssess = getAssess;
module.exports.getUserCoupon = getUserCoupon;
module.exports.getShareCoupon = getShareCoupon;
module.exports.saveUserInfo = saveUserInfo;
module.exports.getStoreAssess = getStoreAssess;
module.exports.checkFunOpened = checkFunOpened;
module.exports.getAppletAd = getAppletAd;
module.exports.isExpiredTime = isExpiredTime;
module.exports.getAppletInfo = getAppletInfo;
module.exports.getGroupShopping = getGroupShopping;
module.exports.getGroupOrders = getGroupOrders;
module.exports.getSinGroupOrders = getSinGroupOrders;
module.exports.getgroupAssess = getgroupAssess;
module.exports.haveCoupons = haveCoupons;
module.exports.sendCoupon = sendCoupon;
module.exports.isVip = isVip;
module.exports.location = location;