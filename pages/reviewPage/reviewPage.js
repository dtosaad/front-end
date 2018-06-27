// reviewPage.js
var config = require("../../config")
Page({
    // 初始化数据
    data: {
        order: [],
        totalStar: 5
    },

    navigateTo: function () {
        var user_id = wx.getStorageSync('userid')
        var order = this.data.order
        for (var i = 0 ; i < order.length; i++) {
            wx.request({
                url: config.service.dishesUrl + '/:' + order[i].dish_id + '/review?user_id=' + user_id,
                method: 'POST',
                data: {
                    star: order[i].star
                } 
            })
        }

        // 清空本地数据
        try {
            wx.clearStorageSync()
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
        var myOrder = [];
        try {
            var order = wx.getStorageSync('order');
            if (order) {
                order.forEach(element => {
                    console.log(element.dish_id)
                    var temp = {
                        dish_id: element.dish_id,
                        dish_name: element.dish_name,
                        star: 0
                    }
                    myOrder.push(temp)
                });
                this.setData({
                    order: myOrder
                })
            }
        } catch (e) { }
    }
})