// usingPage.js

Page({
    data: {
        order: [],

        is_together: null,
        need_update: null,
        all_complete_order: false,
        table_order_id: null
    },

    // 获取客户所在桌子的订单ID号
    // 用于后面的加餐
    getTableOrderId: function() {
        var that = this
        let user_id = wx.getStorageSync('user_id')
        
        return Promise((res, rej) => {
            wx.request({
                url: `${config.service.tablesInfoUrl}/${table_id}?user_id=${user_id}`,
                method: 'GET',
                success: function (res) {
                    console.log(res.data)
                    let { order_id } = res.data
                    if (order_id) {
                        that.setData({
                            all_complete_order: true,
                            table_order_id: order_id
                        })
                    }
                }
            })
        })
    },

    // 完成用餐触发的回调函数
    finishButtonOnClick: function() {
        this.getTableOrderId().then(() => {
            if (this.data.all_complete_order) {
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

    callService: function(e) {
        wx.showToast({
            title: '已呼叫，请稍等',
        })
    },

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

    // 取出数据，初始化我的订单
    onLoad: function(options) {

        // 如果不是协同点餐，默认all_complete_order是true
        var is_together = wx.getStorageSync('is_together') ? true : false
        this.setData({
            is_together: is_together,
            need_update: is_together,
            all_complete_order: !is_together
        })

        var that = this

        if (is_together) {
            setInterval(() => {
                if (!that.data.need_update) return
                that.getTogetherOrder()
            }, 3000)
        }
        else {
            try {
                var myOrder = [];
                var order = wx.getStorageSync('order');
                if (order) {
                    order.forEach(element => {
                        var temp = {
                            dish_name: element.dish_name,
                            amount: element.amount,
                            isServe: false
                        }
                        myOrder.push(temp)
                    });
                    this.setData({
                        order: myOrder
                    })
                }
            } catch (e) { }
        }
        
    }
})