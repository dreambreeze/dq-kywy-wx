let app = getApp();
let common = require('../../../../common.js');


Page({

    /**
     * 页面的初始数据
     */
    data: {
        historySearch: false,
        //搜索值
        inputVal:'',
    },
    /**
     * 生命周期函数--监听页面展示
     */
    onShow(){
        //获取历史搜索
        let historySearch = wx.getStorageSync('historySearch');
        this.setData({
            historySearch: historySearch
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this;
        //加载热门推荐搜索项目
        wx.request({
            url: common.config.host + '/index.php/Api/Requestdata/getProjectSearchHot',
            data: {
                'authorizerId': app.globalData.authorizerId
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                //返回成功
                if (res.statusCode == 200) {
                    if (res.data.status == 1 && res.data.info) {
                        _this.setData({
                            searchHot: res.data.info
                        });
                    }
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
                        content: '请求失败',
                        showCancel: false
                    });
                }
            }
        });
    },
    /**
     * 更新输入框输入值
     */
    changeInputVal(e) {
        this.setData({
            inputVal: e.detail.value
        });
    },

    /**
     * 点击搜索按钮时触发
     */
    pSearch: function(e) {
        let _val = e.detail.value != null ? e.detail.value : e.currentTarget.dataset.inputval ;
        //保存至本地历史搜索
        let historySearch = wx.getStorageSync('historySearch');
        if (historySearch) {
            historySearch.push(_val);
            wx.setStorageSync('historySearch', historySearch);
        } else {
            wx.setStorageSync('historySearch', [_val]);
        }
        wx.navigateTo({
            url: '../group-buy/group-buy?search=' + _val,
        });
    },
    /**
     * 页面跳转
     */
    jumpPage: function(ev) {
        var url = ev.currentTarget.dataset.url;
        if (typeof url != 'undefined') {
            wx.navigateTo({
                url: url,
            });
        }
    },
})