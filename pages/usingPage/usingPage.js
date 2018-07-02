// usingPage.js
var config = require('../../config')

Page({
    data: {
        order: [],

        is_together: null,
        need_update: null,
        all_complete_order: false,
        table_order_id: null,

        dishes_list: [],
        interval: null
    },

    // 获取客户所在桌子的订单ID号
    // 用于后面的加餐
    getTableOrderId: function() {
        var that = this
        let user_id = wx.getStorageSync('user_id')
        var table_id = wx.getStorageSync('table_id')
        
        return new Promise((res, rej) => {
            wx.request({
                url: `${config.service.tablesInfoUrl}/${table_id}?user_id=${user_id}`,
                method: 'GET',
                success: function (getTableOrder_res) {
                    console.log(getTableOrder_res.data)
                    let { order_id } = getTableOrder_res.data
                    if (order_id) {
                        that.setData({
                            all_complete_order: true,
                            table_order_id: order_id
                        })
                    }
                    res()
                },
                fail: function() {
                    rej()
                }
            })
        })
    },

    // 完成用餐触发的回调函数
    finishButtonOnClick: function() {
        var that = this
        this.getTableOrderId().then(() => {
            if (this.data.all_complete_order) {
                clearInterval(that.data.interval)
                wx.navigateTo({
                    url: "../payPage/payPage"
                })
            }
            else {
                wx.showToast({
                    title: '请等待其他伙伴点餐完毕',
                    icon: 'none'
                })
            }
        })
    },

    // 呼叫服务员
    callService: function(e) {
        wx.showToast({
            title: '已呼叫，请稍等',
        })
    },

    // 加餐
    addMeal: function (e) {
        if (this.data.all_complete_order) {
            wx.setStorageSync('addMeal', true)
            wx.navigateTo({
                url: "../menuPage/menuPage"
            })
        }
        else {
            wx.showToast({
                title: '请等待其他伙伴点餐完毕',
                icon: 'none'
            })
        }
        
    },

    // 点击催的按钮变成上菜
    urgeToServe: function(e) {
        var that = this
        var index = e.currentTarget.dataset.index
        var order = that.data.order
        order[index].isServe = true
        that.setData({
            order: order
        })
        wx.showToast({
            title: '已催促'
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
        wx.request({
            url: url,
            method: 'POST',
            data: delta,
            success: function (res) {
                console.log('togetherMenu', res)
                var togetherArr = res.data
                for (var i = 0; i < togetherArr.length; i++) {
                    if (togetherArr[i] > 0) {
                        var temp = {
                            dish_name: dishes_list[i + 1].dish_name,
                            amount: togetherArr[i],
                            isServe: false
                        }
                        console.log('temp', temp)
                        togetherMenu.push(temp)
                    }
                }

                that.setData({
                    order: togetherMenu
                })
            }
        })
    },

    // 获得我的菜单
    getMyOrder: function() {
        var that = this
        var user_id = wx.getStorageSync('user_id')
        var order_id = wx.getStorageSync('order_id')
        var dishes_list = this.data.dishes_list

        wx.request({
            url: `${config.service.postOrderUrl}/${order_id}?user_id=${user_id}`,
            method: 'GET',
            success: function(res) {
                console.log('getMyOrder', res.data)
                var dishes = res.data.dishes
                var myOrder = []
                dishes.forEach(element => {
                    myOrder.push({
                        dish_name: dishes_list[element.dish_id].dish_name,
                        amount: element.amount,
                        isServe: false
                    })
                })
                console.log('myOrder', myOrder)
                that.setData({
                    order: myOrder
                })
            }
        })
    },

    // 取出数据，初始化我的订单
    onLoad: function(options) {

        // 获取菜单
        var dishes_list = wx.getStorageSync('dishes_list')
        this.setData({
            dishes_list: dishes_list
        })

        // 如果不是协同点餐，默认all_complete_order是true
        var is_together = wx.getStorageSync('is_together') ? true : false
        this.setData({
            is_together: is_together,
            need_update: is_together,
            all_complete_order: !is_together
        })

        var that = this
        var interval = 0
        if (is_together) {
            that.getTableOrderId()
            interval = setInterval(() => {
                if (!that.data.need_update) return
                that.getTogetherOrder()
            }, 3000)
            this.setData({
                interval: interval
            })
        }
        else
            this.getMyOrder()
    },

    onShow: function() {
        var is_together = wx.getStorageSync('is_together') ? true : false
        console.log(is_together)
        if (!is_together) this.getMyOrder()
    }
})