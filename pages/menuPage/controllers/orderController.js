var orderController = {

    data: {
        that: null
    },

    setThat: (th) => {
        orderController.data.that = th
    },

    updateOrderMenu: () => {
        var that = orderController.data.that
        var ordermenu = []
        var order_view_height = 0
        var dishes_list = that.data.dishes_list
        var sum_money = 0
        var togetherMenu = that.data.togetherMenu
        var is_together = that.data.is_together

        if (!is_together) {
            // 更新订单信息（将数量大于0的菜品算作订单）
            for (var i = 0; i < dishes_list.length; i++) {
                if (dishes_list[i] == undefined) continue
                if (dishes_list[i].amount > 0) {
                    var temp = {
                        dish_id: dishes_list[i].dish_id,
                        dish_name: dishes_list[i].dish_name,
                        price: dishes_list[i].price,
                        amount: dishes_list[i].amount
                    }
                    ordermenu.push(temp);
                    sum_money += temp.price * temp.amount
                }
            }
        }
        else {
            for (var i = 0; i < togetherMenu.length; i++) {
                sum_money += togetherMenu[i].price * togetherMenu[i].amount
            }
            // 更新订单信息（将数量大于0的菜品算作订单）
            for (var i = 0; i < dishes_list.length; i++) {
                if (dishes_list[i] == undefined) continue
                if (dishes_list[i].amount > 0) {
                    var temp = {
                        dish_id: dishes_list[i].dish_id,
                        dish_name: dishes_list[i].dish_name,
                        price: dishes_list[i].price,
                        amount: dishes_list[i].amount
                    }
                    ordermenu.push(temp);
                }
            }
        }

        // 保存信息
        that.setData({
            ordermenu: ordermenu,
            order_view_height: order_view_height,
            sum_money: sum_money
        })
    },

    // 上传加餐信息
    postAddedMeal: function () {
        var that = orderController.data.that
        var order_id = wx.getStorageSync('order_id')
        var user_id = wx.getStorageSync('user_id')
        var ordermenu = that.data.ordermenu
        var addMealMenu = []
        for (var i = 0; i < ordermenu.length; i++) {
            addMealMenu.push({
                dish_id: ordermenu[i].dish_id,
                amount: ordermenu[i].amount,
                price: ordermenu[i].price
            })
        }
        console.log('addMealMenu', addMealMenu)
        wx.request({
            url: `${config.service.postOrderUrl}/${order_id}?user_id=${user_id}`,
            method: 'PUT',
            data: addMealMenu,
            success: function (res) {
                console.log('Post added meal success!', res)
                wx.removeStorageSync("order")
                wx.reLaunch({
                    url: "../usingPage/usingPage"
                })
            }
        })
    },

}


module.exports = orderController