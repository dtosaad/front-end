// reviewPage.js
var config = require("../../config")
Page({
    // 初始化数据
    data: {
        order: [],
        totalStar: 5,
        dishes_list: []
    },

    navigateTo: function () {
        var user_id = wx.getStorageSync('user_id')
        var order = this.data.order
        for (var i = 0 ; i < order.length; i++) {
            wx.request({
                url: config.service.dishesUrl + '/' + order[i].dish_id + '/review?user_id=' + user_id,
                method: 'POST',
                data: {
                    star: order[i].star
                } 
            })
        }

        // 清空本地数据
        try {
            wx.removeStorageSync('userNumber')
            wx.removeStorageSync('order')
            wx.removeStorageSync('addMeal')
            wx.removeStorageSync('table_id')
            wx.removeStorageSync('need_upload')
        } catch (e) {
            console.log("Clear storage failed!")
        }
        wx.reLaunch({
            url: "../menuPage/menuPage"
        })
    },

    // 设置星星
    addStar: function(e) {
        var star_index = e.currentTarget.dataset.index
        var dish_id = e.currentTarget.dataset.id
        var order = this.data.order
        order[dish_id].star += star_index + 1
        this.setData({
            order: order
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
                                dish_id: i + 1,
                                dish_name: dishes_list[i + 1].dish_name,
                                star: 0
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
                fail: function () {
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
                            dish_id: element.dish_id,
                            dish_name: dishes_list[element.dish_id].dish_name,
                            star: 0
                        })
                    })
                    console.log('myOrder', myOrder)
                    that.setData({
                        order: myOrder
                    })
                    res()
                },
                fail: function () {
                    rej()
                }
            })
        })

    },



    // 删除星星
    deleteStar: function(e) {
        var star_index = e.currentTarget.dataset.index
        var dish_id = e.currentTarget.dataset.id
        var order = this.data.order
        order[dish_id].star = star_index + 1
        this.setData({
            order: order
        })
    },

    // 加载本地缓存的菜单
    onLoad: function (options) {
        var that = this
        var is_together = wx.getStorageSync('is_together') ? true : false
        // 获取菜单
        var dishes_list = wx.getStorageSync('dishes_list')
        this.setData({
            dishes_list: dishes_list
        })

        if (is_together) {
            this.getTogetherOrder()
        }
        else {
            this.getMyOrder()
        }
    }
})