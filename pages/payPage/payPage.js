// payPage.js
var config = require('../../config')

Page({
    // 初始化数据
    data: {
        order: [],
        num: 1,
        minusStatus: 'disabled',
        total: 0,

        couponStatus: 'coupon-unchanged',
        coupon: "暂无可用",
        pickerIndex: 0,
        pickerArray: ['不使用'],
        myDiscount: []
    },

    // 选择优惠券
    bindCasPickerChange: function (e) {
        console.log('乔丹选的是', this.data.pickerArray[e.detail.value])
        this.setData({
            pickerIndex: e.detail.value
        })

    },

    navigateTo: function () {
        // 提交订单
        var is_together = wx.getStorageSync('is_together')
        if (is_together) this.payOrderTogether
        else this.payOrderNormal
    },

    getCoupon: function () {
        var user_id = wx.getStorageSync('user_id')
        var pickerArray = this.data.pickerArray
        var myDiscount = this.data.myDiscount
        var that = this
        wx.request({
            url: config.service.discountUrl + '?user_id=' + user_id,
            method: 'GET',
            success: function (res) {
                console.log('getCoupon', res)
                var discountArr = res.data
                if (discountArr != null) {
                    console.log('here')
                    myDiscount = discountArr
                    for (var discount in discountArr) {
                        pickerArray.push(discount.discount)
                    }
                    that.setData({
                        pickerArray: pickerArray,
                        myDiscount: myDiscount
                    })
                }
            },
            fail: function (res) {
                console.log(res)
            }
        })
    },
    
    payOrderNormal: function() {
        var order_id = wx.getStorageSync('order_id')
        var user_id = wx.getStorageSync('user_id')
        var table_id = wx.getStorageSync('table_id')

        wx.request({
            url: `${config.service.payUrl}/${order_id}/pay?user_id=${user_id}`,
            method: 'POST',
            data: {
                table_id: table_id
            },
            success: function(res) {
                that.navigateToReviewPage()
            }
        })
    },

    payOrderTogether: function() {
        var order_id = wx.getStorageSync('order_id')
        var user_id = wx.getStorageSync('user_id')
        var table_id = wx.getStorageSync('table_id')

        wx.request({
            url: `${config.service.payUrl}/${order_id}/pay/together?user_id=${user_id}`,
            method: 'POST',
            data: {
                table_id: table_id
            },
            success: function (res) {
                that.navigateToReviewPage()
            }
        })
    },

    checkIfPayed: function() {
        var that = this
        var user_id = wx.getStorageSync('user_id')
        var table_id = wx.getStorageSync('table_id')

        wx.request({
            url: `${config.service.tablesInfoUrl}/${table_id}?user_id=${user_id}`,
            method: 'GET',
            success: function(res) {
                let { status } = res.data
                if (status == 0) {
                    that.navigateToReviewPage()
                }
            }
        })
    },

    navigateToReviewPage: function() {
        wx.reLaunch({
            url: "../reviewPage/reviewPage"
        })
    },

    // 加载本地缓存的菜单
    onLoad: function (options) {
        var that = this
        var order = this.data.order;
        var total = this.data.total;

        var is_together = wx.getStorageSync('is_together')
        if (is_together) {
            setInterval(() => {
                that.checkIfPayed()
            }, 3000)
        }

        // 获取优惠券
        this.getCoupon()

        // 从本地缓存中同步取出order数组
        try {
            var value = wx.getStorageSync('order')
            var userNumber = wx.getStorageSync('userNumber')
            if (value) {
                order = value;
                order.forEach(item => {
                    total += item.amount * item.price;
                });
            }
        } catch (e) {
            console.log("Get local data failed!");
        }

        // 计算总价
        total += userNumber

        // 更新减号的状态
        var minusStatus = this.data.minusStatus
        if (userNumber > 1) minusStatus = "normal"
        
        this.setData({
            order: order,
            total: total,
            num: userNumber,
            minusStatus: minusStatus
        });
    }
})