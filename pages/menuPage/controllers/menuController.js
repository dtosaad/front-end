var config = require('../../../config')

var menuController = {
    data: {
        that: null
    },

    setThat: (th) => {
        menuController.data.that = th
    },

    // 获取菜单数据
    getDishes: function () {
        var that = menuController.data.that
        var user_id = wx.getStorageSync('user_id')
        console.log('getDishes', user_id)
        wx.request({
            url: `${config.service.dishesUrl}/all?user_id=${user_id}`,
            method: "GET",
            success: function (data) {
                var data_from_server = data.data
                var dishes = new Array(data_from_server.length)
                var last_dishes_array = new Array(data_from_server.length)
                for (var i = 0; i < data_from_server.length; i++) {
                    last_dishes_array[i] = 0
                }

                console.log('all dishes', dishes)
                for (var i = 0; i < data_from_server.length; i++) {
                    var temp_dishes = {
                        dish_id: data_from_server[i].dish_id,
                        type: [data_from_server[i].type, '没吃过'],
                        image: `${config.service.host}/images/dishes_tiny/${data_from_server[i].dish_id}.jpeg`,
                        dish_name: data_from_server[i].dish_name,
                        ordered_count: data_from_server[i].ordered_count,
                        price: data_from_server[i].price,
                        star_count: Math.round(data_from_server[i].star_count / data_from_server[i].star_times),
                        amount: 0
                    }
                    dishes[temp_dishes.dish_id] = temp_dishes
                }
                let type_list = ["我吃过"]
                for (let dish of dishes) {
                    if (dish == undefined) continue
                    if (type_list.indexOf(dish.type[0]) == -1) {
                        type_list.push(dish.type[0]);
                    }
                }
                console.log('type_list', type_list)
                that.setData({
                    type_list: type_list,
                    dishes_list: dishes,
                    currentMenu: type_list[1],
                    last_dishes_array: last_dishes_array
                });
                wx.setStorageSync('dishes_list', dishes)

                that.getMyDishes()
            },
            fail: function (res) {
                console.log("Get dishes failed!")
            }
        })
    },

    // 获取我吃过的菜谱
    getMyDishes: function () {
        var that = menuController.data.that
        console.log('carry getMyDishes')
        let user_id = wx.getStorageSync('user_id')
        wx.request({
            url: config.service.dishesUrl + '?user_id=' + user_id,
            method: 'GET',
            success: function (server_res) {
                var myDishes = server_res.data
                var dishes = that.data.dishes_list
                for (var i = 0; i < myDishes.length; i++) {
                    dishes[myDishes[i].dish_id].type[1] = '我吃过'
                }
                console.log('getMyDishes', myDishes)
                // 恢复我吃过的菜
                that.recoverOrder()
            }
        })
    },

    // 获取每日推荐的图片链接
    getRecommendedImage: function () {
        console.log('getRecommendedImage')
        var that = menuController.data.that
        var user_id = wx.getStorageSync('user_id')
        wx.request({
            url: `${config.service.recommendedUrl}?number=3&user_id=${user_id}`,
            method: 'GET',
            success: function (server_res) {
                console.log(server_res)
                var pic = server_res.data
                for (var i = 0; i < pic.length; i++) {
                    pic[i] = `${config.service.host}/${pic[i]}`
                    console.log('******', pic[i])
                    // pic[i] = config.service.host + pic[i]
                }
                that.setData({
                    imgUrls: server_res.data
                })
                console.log(pic)
            },
            fail: (err) => {
                console.log('******', err)
            }
        })

    },
}

module.exports = menuController