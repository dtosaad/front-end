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
        myDiscount: [],

        dishes_list: []
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
        if (is_together) this.payOrderTogether()
        else this.payOrderNormal()
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
        var that = this
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
                wx.showToast({
                    title: '付款完成'
                })
                that.navigateToReviewPage()
            }
        })
    },

    payOrderTogether: function() {
        var that = this
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
                wx.showToast({
                    title: '付款完成'
                })
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

    // 获取协同菜单
    getTogetherOrder: function () {
        var table_id = wx.getStorageSync('table_id')
        var user_id = wx.getStorageSync('user_id')
        var url = config.service.tablesInfoUrl + '/' + table_id + '/dishes?user_id=' + user_id
        var dishes_list = wx.getStorageSync('dishes_list')
        var delta = new Array(dishes_list.length)
        for (var i = 0; i < dishes_list.length - 1; i++) {
            delta[i] = 0
        }

        var togetherMenu = []
        var that = this

        return new Promise((res, rej) => {
            wx.request({
                url: url,
                method: 'POST',
                data: delta,
                success: function (order_res) {
                    console.log('togetherMenu', order_res)
                    var togetherArr = order_res.data
                    for (var i = 0; i < togetherArr.length; i++) {
                        if (togetherArr[i] > 0) {
                            var temp = {
                                dish_name: dishes_list[i + 1].dish_name,
                                price: dishes_list[i + 1].price,
                                amount: togetherArr[i]
                            }
                            console.log('temp', temp)
                            togetherMenu.push(temp)
                        }
                    }

                    that.setData({
                        order: togetherMenu
                    })
                    res()
                },
                fail: function() {
                    rej()
                }
            })
        })
        
    },


    getMyOrder: function () {
        var that = this
        var user_id = wx.getStorageSync('user_id')
        var order_id = wx.getStorageSync('order_id')
        var dishes_list = this.data.dishes_list

        return new Promise((res, rej) => {
            wx.request({
                url: `${config.service.postOrderUrl}/${order_id}?user_id=${user_id}`,
                method: 'GET',
                success: function (order_res) {
                    console.log('getMyOrder', order_res.data)
                    var dishes = order_res.data.dishes
                    var myOrder = []
                    dishes.forEach(element => {
                        myOrder.push({
                            dish_name: dishes_list[element.dish_id].dish_name,
                            amount: element.amount,
                            price: dishes_list[element.dish_id].price
                        })
                    })
                    console.log('myOrder', myOrder)
                    that.setData({
                        order: myOrder
                    })
                    res()
                },
                fail: function() {
                    rej()
                }
            })
        })
        
    },

    updateData: function() {
        var total = this.data.total;
        var userNumber = wx.getStorageSync('userNumber')
        var order = this.data.order
        console.log(order)
        order.forEach(item => {
            total += item.amount * item.price
        })

        // 计算总价
        total += userNumber

        this.setData({
            total: total,
            num: userNumber
        });
    },

    // 加载本地缓存的菜单
    onLoad: function (options) {
        var that = this
        var is_together = wx.getStorageSync('is_together') ? true : false
        if (is_together) {
            setInterval(() => {
                that.checkIfPayed()
            }, config.interval)
        }

        // 获取优惠券
        this.getCoupon()

        // 获取菜单
        var dishes_list = wx.getStorageSync('dishes_list')
        this.setData({
            dishes_list: dishes_list
        })

       

        if (is_together) {
            this.getTogetherOrder().then(() => {
                that.updateData()
            })
        }
        else {
            this.getMyOrder().then(() => {
                that.updateData()
            })
        }
    }
})