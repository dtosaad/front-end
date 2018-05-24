// usingPage.js

Page({
    data: {
        order: []
    },
    
    callService: function(e) {
        console.log("叫服务员？？？")
    },

    addMeal: function (e) {
        wx.navigateTo({
            url: "../menuPage/menuPage"
        })
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
    },

    // 取出数据，初始化我的订单
    onLoad: function(options) {
        var myOrder = [];
        try {
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
        } catch(e) {}
    }
})