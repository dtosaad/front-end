var config = require('../../config')
var menuPageData = require('menuPageData')

Page({
    data: {
        hidden_modal: true,
        sitdown: true,
        table_no: '',
        hidden_modal_table: true,
        get_tables_first: true,
        table_index: -1,

        // 切换顶部导航栏
        currentTab: 0,
        currentMenu: '默认',

        // 订单相关
        sum_money: 0,
        show_order: false,
        classListStyle: 'class-list',
        table_list: [],
        imgUrls: [],
        ordermenu: [],
        type_list: [],
        dishes_list: [],
        totalStar: 5,
        minusStatus: 'disabled',
        
        // 协同点单相关
        is_together: false,
        togetherMenu: [],
        last_dishes_array: [],

        // 加餐相关
        isAddMeal: false
    },

    get_table_index(table_id) {
        let tables = this.data.table_list
        for (let i = 0; i < tables.length; ++i) {
            if (tables[i].table_id === table_id) {
                return i
            }
        }
        return -1
    },

    choose_table(table_index) {
        let table_list = this.data.table_list
        if (table_list.length === 0) {
            wx.showToast({
                title: '抱歉，获取桌位信息出错，请稍后再试',
                icon: 'none',
                duration: 3000,
            })
            return
        }
        let user_id = wx.getStorageSync('user_id')
        // 1. 是这个桌子的主人
        let own_table_index = -1
        let chosen_table = table_list[table_index]
        if (chosen_table.user_id === user_id) {
            if (chosen_table.status === 2) {
                this.sitdown(table_index)
            }
            return true
        }
        for (let i = 0; i < table_list.length; ++i) {
            let table = table_list[i]
            // 2. 是其它桌子的主人
            if (table.user_id === user_id) {
                own_table_index = i
                wx.showToast({
                    title: '抱歉，不能重复选择桌子',
                    icon: 'none',
                    duration: 3000,
                })
                return false
            }
        }
        // 3. 不是任一桌子的主人
        if (own_table_index === -1) {
            let table = table_list[table_index]
            // 协同点餐
            if (table.user_id) {
                let that = this
                wx.showModal({
                    title: '提示',
                    content: `该桌子有人了，要进入协同点餐吗？`,
                    success: function(res) {
                        if (res.cancel) return
                        that.orderTogether(table.table_id, user_id)
                    }
                })
            } else {  // 坐下，成为这个桌子的主人
                this.setData({
                    hidden_modal_table: false,
                    table_index,
                });
            }
        }
    },

    free_table(table_index) {
        let table = this.data.table_list[table_index]
        let user_id = wx.getStorageSync('user_id')
        let that = this
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table.table_id}?user_id=${user_id}`,
            method: "DELETE",
            success: function(data) {
                let table_list = that.data.table_list;
                table_list[table_index].status_ = '订'
                table_list[table_index].user_avatar = null
                table_list[table_index].status = 0
                table_list[table_index].user_id = null
                that.setData({
                    table_list,
                    is_together: false,
                })
                wx.removeStorageSync('table_id')
                wx.removeStorageSync('is_together')
            },
            fail: function(res) {
                console.log("离开桌子失败", res)
            }
        })
    },

    sitdown_or_reserve(table_index, which, callback) {
        let table_list = this.data.table_list
        let table = table_list[table_index]
        let user_id = wx.getStorageSync('user_id')
        let status = which === 0 ? 1 : 2
        let that = this
        // 坐下
        console.log('user_id', user_id)
        console.log(33333333333333333, table)
        wx.setStorageSync("table_id", table.table_id)
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table.table_id}?status=${status}&user_id=${user_id}`,
            method: 'POST',
            success: function() {
                table_list[table_index].status_ = '预'
                table_list[table_index].user_avatar = wx.getStorageSync('avatar')
                table_list[table_index].status = status
                table_list[table_index].user_id = user_id
                console.log('new table_list', table_list)
                that.setData({
                    table_list,
                })
                wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 3000,
                })
                if (callback) callback()
            },
            fail: function (err) {
                console.log(err)
            }
        })
    },

    sitdown(table_index) {
        var that = this
        let { table_id } = this.data.table_list[table_index]
        this.sitdown_or_reserve(table_index, 0, () => {
            setInterval(() => {
                that.getSingleTableInfo(table_id)
            }, config.interval)
        })
    },

    reserve(table_index) {
        this.sitdown_or_reserve(table_index, 1)
    },

    table_avatar_click(e) {
        let table_index = e.target.dataset.index
        let table = this.data.table_list[table_index]
        let user_id = wx.getStorageSync('user_id')
        // 这个桌子的主人是他
        if (table.user_id === user_id) {
            let hint = table.status === 1 ? '离开' : '取消预订'
            let that = this
            wx.showModal({
                title: '提示',
                content: `您要${hint}这张桌子吗？`,
                success: function(res) {
                    if (res.cancel) return
                    that.free_table(table_index)
                }
            })
        }
        this.choose_table(table_index)
    },

	cancel_input: function() {
        this.setData({
            hidden_modal: true
        });
    },

    confirm_input: function() {
        let number = this.data.table_no.toUpperCase()
        let table_index = -1
        for (let i = 0; i < this.data.table_list.length; ++i) {
            if (this.data.table_list[i].number === number) {
                table_index = i
                break
            }
        }
        if (table_index === -1) {
            wx.showToast({
                title: '桌号输入有误，再来',
                icon: 'none',
                duration: 3000,
            })
        } else {
            this.choose_table(table_index)
            this.setData({
                hidden_modal: true
            });
        }
    },

    cancel_take: function() {
        this.setData({
            hidden_modal_table: true
        });
    },

    confirm_take: function() {
        if (this.data.sitdown) {
            console.log(111111111111111)
            this.sitdown(this.data.table_index)
        } else {
            console.log(222222222222222)
            this.reserve(this.data.table_index)
        }
        this.setData({
            hidden_modal_table: true
        });
    },

    input_table_no: function(e) {
        this.setData({
            table_no: e.detail.value
        });
    },

    bindchange: function(e) {
        let value = e.detail.value
        if (value === 'sitdown') return
        this.setData({
            sitdown: false,
        })
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
        var togetherMenu = this.data.togetherMenu
        var is_together = this.data.is_together

        if (!is_together) {
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
        }
        else {
            for (var i = 0; i < togetherMenu.length; i++) {
                sum_money += togetherMenu[i].price * togetherMenu[i].amount
            }
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
                }
            }
        }
        
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
        var dishes_list = this.data.dishes_list
        console.log(dishes_list)
        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue
            if (dishes_list[i].dish_id == index) {
                // 若数量大于0才能减
                if (dishes_list[i].num >= 1) {
                    dishes_list[i].num--;

                    // 保存并更新数据
                    var minus = "dishes_list[" + i + "].num"
                    this.setData({
                        [minus]: dishes_list[i].num,
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
        var dishes_list = this.data.dishes_list

        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue

            if (dishes_list[i].dish_id == index) {
                dishes_list[i].num++;

                // 保存并更新数据
                var minus = "dishes_list[" + i + "].num"
                this.setData({
                    [minus]: dishes_list[i].num,
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
        var count = this.data. dishes_list[id].num
        var price = this.data.dishes_list[id].price
        var minus = "dishes_list[" + id + "].num"
        
        if (count >= 1) {
            count--
        }

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = count < 1 ? 'disabled' : 'normal'
        
        // 保存并更新数据
        this.setData({
            [minus]: count,
            minusStatus: minusStatus,
        })
        this.updateOrderMenu()
    },

    // 加号
    bindPlus: function (e) {
        var id = e.target.dataset.id
        var count = this.data.dishes_list[id].num
        var price = this.data.dishes_list[id].price
        var minus = "dishes_list[" + id + "].num"

        count++
        
        // 保存并更新数据
        this.setData({
            [minus]: count,
            minusStatus: 'normal'
        })
        this.updateOrderMenu()
    },

    // 上传加餐信息
    postAddedMeal: function() {
        var order_id = wx.getStorageSync('order_id')
        var user_id = wx.getStorageSync('user_id')
        var ordermenu = this.data.ordermenu
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
            success: function(res) {
                console.log('Post added meal success!', res)
                wx.removeStorageSync("order")
                wx.reLaunch({
                    url: "../usingPage/usingPage"
                })
            }
        })
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
                    that.postAddedMeal()
                } else {
                    that.navigateToConfirmOrder()
                }
            },
            fail: function() {
                that.navigateToConfirmOrder()
            }
        })
    },

    // 协同告诉后台我点完单了
    posterOrderTogether: function () {
        var user_id = wx.getStorageSync('user_id')
        var table_id = wx.getStorageSync('table_id')
        var that = this
        wx.request({
            url: `${config.service.host}/weapp/tables/${table_id}/commit?user_id=${user_id}`,
            method: 'POST',
            success: function (res) {
                console.log('posterOrderTogether', res)
                that.uploadOrder()
                var isLastOne = res.data.orderers_count == 0 ? true : false
                console.log('If the customer is the last one?', isLastOne)
                if (isLastOne) {
                    wx.reLaunch({
                        url: "../confirmOrder/confirmOrder"
                    })
                } else {
                    wx.reLaunch({
                        url: "../usingPage/usingPage"
                    })
                }
            }
        })
    },


    navigateToConfirmOrder: function() {
        var num = this.data.ordermenu.length
        var is_together = this.data.is_together
        var that = this
        console.log('is_together', is_together)
        if (is_together) {
            wx.showModal({
                title: '提示',
                content: '点餐完毕后无法修改订单，是否确认提交？',
                success: function(res) {
                    if (res.cancel) return
                    that.posterOrderTogether()
                }
            })
        }
        else if (num != 0) {
            wx.navigateTo({
                url: "../confirmOrder/confirmOrder"
            })
        }
        else {
            wx.showToast({
                title: '请先点餐',
                icon: 'none'
            })
        }
    },

    // 获取菜单数据
    getDishes: function () {
        var that = this
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
                        num: 0
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
                console.log('this.getMyDishes');
                wx.setStorageSync('dishes_list', dishes)

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
        console.log('carry getMyDishes')
        let user_id = wx.getStorageSync('user_id')
        wx.request({
            url: config.service.dishesUrl + '?user_id=' + user_id,
            method: 'GET',
            success: function(server_res) {
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
    getRecommendedImage: function() {
        console.log('getRecommendedImage')
        var that = this
        var user_id = wx.getStorageSync('user_id')
        wx.request({
            url: `${config.service.recommendedUrl}?number=3&user_id=${user_id}`,
            method: 'GET',
            success: function(server_res) {
                console.log(server_res)
                var pic = server_res.data
                for(var i = 0; i < pic.length; i++) {
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

    // 恢复点单数据
    recoverOrder: function() {
        // 如果是加餐就不需要恢复
        if (!this.data.isAddMeal) {
            var order = wx.getStorageSync('order')
            var dishes_list = this.data.dishes_list
            if (dishes_list.length === 0) return
            for (var i = 0; i < order.length; i++) {
                console.log('dishes_list[order[i].dish_id]', dishes_list[order[i].dish_id])
                dishes_list[order[i].dish_id].num = order[i].amount
            }
            this.setData({
                ordermenu: order,
                dishes_list: dishes_list
            })
        }
        this.updateOrderMenu()
        console.log(this.data.ordermenu)
        console.log('recover', order)
    },

    // 获取所有的桌位信息
    getTableInfo: function() {
        var table_list = []
        var that = this
        let user_id = wx.getStorageSync('user_id')
        wx.request({
            url:`${config.service.tablesInfoUrl}/all?user_id=${user_id}`,
            method: 'GET',
            success: function(server_res) {
                console.log('tables', server_res)
                var allTables = server_res.data
                let has_table = false
                let get_tables_first = that.data.get_tables_first
                for (var i = 0; i < allTables.length; i++) {
                    var table = {
                        index: i,
                        table_id: allTables[i].table_id,
                        number: allTables[i].number,
                        status_: allTables[i].user_id == null ? '订' : '预',
                        color: allTables[i].number[0] == 'A' ? 1 : allTables[i].number[0] == 'B' ? 2 : 3,
                        user_avatar: allTables[i].user_avatar,
                        status: allTables[i].status,
                        user_id: allTables[i].user_id,
                    };
                    table_list.push(table);
                    if (get_tables_first && table.user_id === user_id) {
                        has_table = true
                        wx.setStorageSync('table_id', table.table_id)
                    }
                }
                if (get_tables_first && !has_table) {
                    that.setData({
                        hidden_modal: false,
                    })
                }
                that.setData({
                    table_list: table_list,
                    get_tables_first: false
                })
            }
        })
    },

    // 获取单独的桌位信息
    getSingleTableInfo: function(table_id) {
        console.log('table_id in getSingleTableInfo()', table_id)
        var that = this
        let user_id = wx.getStorageSync('user_id')
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table_id}?user_id=${user_id}`,
            method: 'GET',
            success: function(res) {
                console.log(res.data)
                let { orderers_total } = res.data
                if (orderers_total > 1) {
                    let is_together = wx.getStorageSync('is_together')
                    console.log('&&&&&&&&&', orderers_total, is_together)
                    if (!is_together) {
                        that.orderTogether(table_id, user_id)
                    }
                } else {
                    wx.setStorageSync('is_together', false)
                    that.setData({
                        is_together: false
                    })
                }
            }
        })
    },

    // 预订或者坐下
    bookOrTakeTable: function(e) {
        let table_index = e.target.dataset.index
        this.setData({
            table_index,
        })
        this.choose_table(table_index)
    },

    // 确认协同点餐
    orderTogether: function(table_id, user_id) {
        var that = this
        var url = config.service.tablesInfoUrl + '/' + table_id + '/together?user_id=' + user_id
        wx.request({
            url: url,
            method: 'POST',
            success: function(res) {
                wx.setStorageSync('table_id', table_id)
                wx.setStorageSync('is_together', true)
                wx.setStorageSync('need_upload', true)
                that.setData({
                    is_together: true
                })
                setInterval(() => {
                    let need_upload = wx.getStorageSync('need_upload')
                    if (!need_upload || that.data.currentTab === 1) return
                    that.uploadOrder()
                }, config.interval)
            },
            fail: function(res) {
                that.setData({
                    is_together: false
                })
            }
        })
    },

    // 上传我点的菜，拉下一起点的菜
    uploadOrder: function() {
        var table_id = wx.getStorageSync('table_id')
        var user_id = wx.getStorageSync('user_id')
        var url = config.service.tablesInfoUrl + '/' + table_id + '/dishes?user_id=' + user_id
        console.log(4444444444444, table_id, url)
        var ordermenu = this.data.ordermenu
        var dishes_list = this.data.dishes_list
        var last_dishes_array = this.data.last_dishes_array
        var delta = new Array(last_dishes_array.length)
        console.log('dishes_list', dishes_list)
        console.log('last_dishes_array.length', last_dishes_array.length)
        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue
            delta[i - 1] = dishes_list[i].num - last_dishes_array[i - 1]
            last_dishes_array[i - 1] = dishes_list[i].num
        }

        var togetherMenu = []
        var that = this
        console.log('delta', delta)
        wx.request({
            url: url,
            method: 'POST',
            data: delta,
            success: function(res) {
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
            }
        })
    },

    onLoad: function (options) {
        let table_id = wx.getStorageSync('table_id')
        this.getDishes()
        this.getRecommendedImage()
        this.getTableInfo()
        let that = this
        setInterval(() => {
            if (that.data.currentTab !== 1) return
            that.getTableInfo()
        }, config.interval)
        if (table_id) {
            this.getSingleTableInfo(table_id)
        }
    },

    onHide: function () {
        if (this.data.is_together)
            wx.setStorageSync('need_upload', false)
    },

    onShow: function () {
        if (this.data.is_together)
            wx.setStorageSync('need_upload', true)
    },
})