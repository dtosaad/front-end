var userController = {
    data: {
        that: null
    },

    setThat: (th) => {
        userController.data.that = th
    },

    // 恢复点单数据
    recoverOrder: function () {
        var that = userController.data.that
        // 如果是加餐就不需要恢复
        if (!that.data.isAddMeal) {
            var order = wx.getStorageSync('order')
            var dishes_list = that.data.dishes_list
            if (dishes_list.length === 0) return
            for (var i = 0; i < order.length; i++) {
                console.log('dishes_list[order[i].dish_id]', dishes_list[order[i].dish_id])
                dishes_list[order[i].dish_id].amount = order[i].amount
            }
            that.setData({
                ordermenu: order,
                dishes_list: dishes_list
            })
        }
        that.updateOrderMenu()
    },

    // 上传我点的菜，拉下一起点的菜
    uploadOrder: function () {
        var that = userController.data.that
        var table_id = wx.getStorageSync('table_id')
        var user_id = wx.getStorageSync('user_id')
        var url = config.service.tablesInfoUrl + '/' + table_id + '/dishes?user_id=' + user_id
        var ordermenu = that.data.ordermenu
        var dishes_list = that.data.dishes_list
        var last_dishes_array = that.data.last_dishes_array
        var delta = new Array(last_dishes_array.length)
        console.log('dishes_list', dishes_list)
        console.log('last_dishes_array.length', last_dishes_array.length)
        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue
            delta[i - 1] = dishes_list[i].amount - last_dishes_array[i - 1]
            last_dishes_array[i - 1] = dishes_list[i].amount
        }

        var togetherMenu = []
        var that = that
        console.log('delta', delta)
        wx.request({
            url: url,
            method: 'POST',
            data: delta,
            success: function (res) {
                console.log('togetherMenu', res)
                var togetherArr = res.data
                var dishes_list = that.data.dishes_list
                for (var i = 0; i < togetherArr.length; i++) {
                    if (togetherArr[i] > 0) {
                        var temp = {
                            dish_id: i + 1,
                            dish_name: dishes_list[i + 1].dish_name,
                            price: dishes_list[i + 1].price,
                            amount: togetherArr[i]
                        }
                        console.log('temp', temp)
                        togetherMenu.push(temp)
                    }
                }

                that.setData({
                    togetherMenu: togetherMenu
                })

                that.updateOrderMenu()
            }
        })
    },
}

module.exports = userController