
var config = require('../../config')
var login = require('controllers/loginController')
var menuPageData = require('menuPageData')

Page({
    data: {
        // 切换顶部导航栏
        currentTab: 0,
        currentMenu: '我吃过',

        // 订单相关
        sum_money: 0,
        order_view_height: 100,
        show_order: false,
        classListStyle: 'class-list',
        table_list: menuPageData.table_list,
        imgUrls: [],
        ordermenu: [],
        dishes_list: [],
        totalStar: 5,
        minusStatus: 'disabled',
        
        // 协同点单相关
        isTogether: false,
        togetherMenu: []
    },

    // 切换顶部导航栏
    swichNav: function (e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current,
            })
        }
    },

    // 记录变化的顶部导航栏的当前标签
    swiperChange: function (e) {
        this.setData({
            currentTab: e.detail.current,
        })
    },

    // 记录当前访问的菜单
    swiperMenu: function (e) {
        //console.log(e.target.dataset.currentmenu)
        this.setData({
            currentMenu: e.target.dataset.currentmenu,
        })
    },

    // 更新订单
    updateOrderMenu: function () {
        var ordermenu = []
        var order_view_height = 0
        var dishes_list = this.data.dishes_list
        var sum_money = 0

        // 更新订单信息（将数量大于0的菜品算作订单）
        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue
            if (dishes_list[i].num > 0) {
                var temp = {
                    dish_id: dishes_list[i].dish_id,
                    dish_name: dishes_list[i].dish_name,
                    price: dishes_list[i].price,
                    amount: dishes_list[i].num
                }
                ordermenu.push(temp);
                sum_money += temp.price * temp.amount
            }
        }

        // 更新菜单高度
        order_view_height = this.data.ordermenu.length * 70 + 40;

        // 保存信息
        this.setData({
            ordermenu: ordermenu,
            order_view_height: order_view_height,
            sum_money: sum_money
        })
    },

    // 显示订单
    showOrderMenu: function (e) {
        var change = false
        if (!this.data.show_order) {
            change = true;
            this.updateOrderMenu()
        }
        this.setData({
            show_order: change
        })
    },

    // 订单减号
    orderMinus: function (e) {

        // 获得当前点击的行数
        var index = e.target.dataset.id;
        var sum_money = this.data.sum_money
        var dishes_list = this.data.dishes_list
        console.log(dishes_list)
        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue
            if (dishes_list[i].dish_id == index) {
                // 若数量大于0才能减
                if (dishes_list[i].num >= 1) {
                    dishes_list[i].num--;
                    sum_money = sum_money - dishes_list[i].price;

                    // 保存并更新数据
                    var minus = "dishes_list[" + i + "].num"
                    this.setData({
                        [minus]: dishes_list[i].num,
                        sum_money: sum_money
                    })
                    this.updateOrderMenu()
                }
                break;
            }
        }
    },

    // 订单加号
    orderPlus: function (e) {

        // 获得当前点击的行数
        var index = e.target.dataset.id;
        var sum_money = this.data.sum_money
        var dishes_list = this.data.dishes_list

        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue

            if (dishes_list[i].dish_id == index) {
                dishes_list[i].num++;
                sum_money = sum_money + dishes_list[i].price;

                // 保存并更新数据
                var minus = "dishes_list[" + i + "].num"
                this.setData({
                    [minus]: dishes_list[i].num,
                    sum_money: sum_money
                })
                this.updateOrderMenu()
                break;
            }
        }
    },

    // 页面滑动
    scrollPage: function (e) {
        // console.log(e.detail.scrollTop)
        var classListStyle = this.data.classListStyle;
        if (e.detail.scrollTop >= 170) {
            if (classListStyle !== 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list-fixed'
                })
            }
            // console.log("fixed")
        }
        else if (e.detail.scrollTop < 170) {
            if (classListStyle === 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list'
                })
            }
            // console.log("no-fixed")
        }
    },

    // 减号
    bindMinus: function (e) {
        var id = e.target.dataset.id
        var sum_money = this.data.sum_money
        var count = this.data. dishes_list[id].num
        var price = this.data.dishes_list[id].price
        var minus = "dishes_list[" + id + "].num"
        
        if (count >= 1) {
            count--
            sum_money -= price
        }

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = count < 1 ? 'disabled' : 'normal'
        
        // 保存并更新数据
        this.setData({
            [minus]: count,
            sum_money: sum_money,
            minusStatus: minusStatus,
        })
        this.updateOrderMenu()
    },

    // 加号
    bindPlus: function (e) {
        var id = e.target.dataset.id
        var sum_money = this.data.sum_money
        var count = this.data.dishes_list[id].num
        var price = this.data.dishes_list[id].price
        var minus = "dishes_list[" + id + "].num"

        count++
        sum_money += price
        
        // 保存并更新数据
        this.setData({
            [minus]: count,
            sum_money: sum_money,
            minusStatus: 'normal'
        })
        this.updateOrderMenu()
    },

    // 导航到下一页
    navigateTo: function () {
        var that = this
        var res = wx.setStorageSync("order", that.data.ordermenu);
        console.log(res)
        wx.getStorage({
            key: 'addMeal',
            success: function(res) {
                if (res.data) {
                    wx.reLaunch({
                        url: "../usingPage/usingPage"
                    })
                } else {
                    wx.navigateTo({
                        url: "../confirmOrder/confirmOrder"
                    })
                }
            },
            fail: function() {
                wx.navigateTo({
                    url: "../confirmOrder/confirmOrder"
                })
            }
        })
        
    },

    // 获取菜单数据
    getDishes: function () {
        var that = this
        wx.request({
            url: config.service.dishesUrl,
            method: "GET",
            success: function (data) {
                var data_from_server = data.data
                var dishes = new Array(data_from_server.length)
                console.log(dishes)
                for (var i = 0; i < data_from_server.length; i++) {
                    var temp_dishes = {
                        dish_id: data_from_server[i].dish_id,
                        type: [data_from_server[i].type, '没吃过'],
                        image: data_from_server[i].image,
                        dish_name: data_from_server[i].dish_name,
                        ordered_count: data_from_server[i].ordered_count,
                        price: data_from_server[i].price,
                        star_count: Math.round(data_from_server[i].star_count / (data_from_server[i].star_times * 5)),
                        num: 0
                    }
                    dishes[temp_dishes.dish_id] = temp_dishes
                    console.log(temp_dishes)
                }
                console.log(dishes)
                that.setData({
                    dishes_list: dishes
                })
                that.getMyDishes()
            },
            fail: function (res) {
                console.log("Get dishes failed!")
            }
        })
    },

    // 获取我吃过的菜谱
    getMyDishes: function() {
        var that = this
        wx.getStorage({
            key: 'userid',
            success: function(res) {
                var userid = res.data
                wx.request({
                    url: config.service.dishesUrl + '?userid=' + userid,
                    method: 'GET',
                    success: function(server_res) {
                        var myDishes = server_res.data
                        var dishes = that.data.dishes_list
                        for (var i = 0; i < myDishes.length; i++) {
                            dishes[myDishes[i].dish_id].type[1] = '我吃过'
                        }

                        // 恢复我吃过的菜
                        that.recoverOrder()
                    }
                })
            }
        })
    },

    // 获取每日推荐的图片链接(未完成)
    getRecommendedImage: function() {
        console.log('getRecommendedImage')
        var that = this
        wx.request({
            url: config.service.recommendedUrl + '3',
            method: 'GET',
            success: function(server_res) {
                var pic = server_res.data
                for(var i = 0; i < pic.length; i++) {
                    pic[i] = config.service.imageUrl + pic[i]
                }
                that.setData({
                    imgUrls: server_res.data
                })
                console.log(pic)
            }
        })
    },

    // 恢复点单数据
    recoverOrder: function() {
        var order = wx.getStorageSync('order')
        var dishes_list = this.data.dishes_list
        for(var i = 0; i < order.length; i++) {
            console.log('dishes_list[order[i].dish_id]', dishes_list[order[i].dish_id])
            dishes_list[order[i].dish_id].num = order[i].amount
        }
        this.setData({
            ordermenu: order,
            dishes_list: dishes_list
        })
        this.updateOrderMenu()
        console.log(this.data.ordermenu)
        console.log('recover', order)
    },

    // 获取所有的桌位信息
    getTableInfo: function() {
        var table_list = []
        var that = this
        wx.request({
            url: config.service.tablesInfoUrl,
            method: 'GET',
            success: function(server_res) {
                console.log('tables', server_res)
                var allTables = server_res.data
                for (var i = 0; i < allTables.length; i++) {
                    var table = {
                        table_id: allTables[i].table_id,
                        number: allTables[i].number,
                        status: allTables[i].user_id == null ? '订' : '预',
                        color: allTables[i].number[0] == 'A' ? 1 : allTables[i].number[0] == 'B' ? 2 : 3,
                        user_avatar: allTables[i].user_avatar
                    }
                    table_list.push(table)
                }
                //console.log(table_list)
                that.setData({
                    table_list: table_list
                })
            }
        })
    },

    // 预定座位(未完成)
    bookTable: function(e) {
        var table_id = e.target.dataset.id
        console.log(table_id)
        var user_id = wx.getStorageSync('userid')
        var that = this
        var bookTableUrl = config.service.tablesInfoUrl + '/' + table_id + '/reservation?user_id=' + user_id
        console.log('booktableurl', bookTableUrl)
        wx.request({
            url: bookTableUrl,
            method: 'POST',
            success: function(res) {
                that.getTableInfo()
                console.log(res)
            }
        })
    },

    // 扫描桌上二维码(测试)
    scanTable: function() {
        var that = this
        var user_id = wx.getStorageSync('userid')
        var table_id = 13
        wx.setStorageSync('table_id', table_id)
        wx.request({
            url: config.service.tablesInfoUrl + '/' + table_id + '?user_id=' + user_id,
            method: 'GET',
            success: function(res) {
                var table_info = res.data
                console.log(table_info.user_id)
                console.log(user_id)
                if (table_info.user_id != user_id) {
                    wx.showModal({
                        title: '提示',
                        content: '是否进入协同点餐？',
                        success: function() {
                            that.orderTogether(table_id, user_id)
                        }
                    })
                }
                console.log('scan table', res)
            }
        })
    },

    // 确认协同点餐
    orderTogether: function(table_id, user_id) {
        var that = this
        var url = config.service.tablesInfoUrl + '/' + table_id + '/together?userid=' + user_id
        wx.request({
            url: url,
            method: 'POST',
            success: function(res) {
                that.setData({
                    isTogether: true
                })
            },
            fail: function(res) {
                that.setData({
                    isTogether: false
                })
            }
        })
    },

    // 上传我点的菜，拉下一起点的菜？
    uploadOrder: function() {
        var table_id = wx.getStorageSync('table_id')
        var user_id = wx.getStorageSync('userid')
        var url = config.service.tablesInfoUrl + '/' + table_id + '/dishes?userid=' + user_id

        var ordermenu = this.data.ordermenu
        var uploadData = []
        for (var i = 0; i < ordermenu.length; i++) {
            var temp = {
                dish_id: ordermenu[i].dish_id,
                name: ordermenu[i].dish_name,
                ordered_count: ordermenu[i].amount
            }
            uploadData.push(temp)
        }
        console.log(uploadData)
        wx.request({
            url: url,
            method: 'POST',
            data: uploadData,
            success: function(res) {
                console.log('upload', res)
                var togetherOrder = res.data
                
            }
        })
    },

    onLoad: function (options) {
        // 生命周期函数--监听页面加载
        login()
        this.getDishes()
        this.getRecommendedImage()
        this.getTableInfo()
        this.scanTable()
        setInterval(this.uploadOrder, 3000)
    },

    onReady: function () {
        // 生命周期函数--监听页面初次渲染完成
    },
    onShow: function () {
        // 生命周期函数--监听页面显示
    },
    onHide: function () {
        // 生命周期函数--监听页面隐藏
    },
    onUnload: function () {
        // 生命周期函数--监听页面卸载
    },
    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
    },
    onShareAppMessage: function () {
        // 用户点击右上角分享
        return {
            title: 'title', // 分享标题
            desc: 'desc', // 分享描述
            path: 'path' // 分享路径
        }
    }
})