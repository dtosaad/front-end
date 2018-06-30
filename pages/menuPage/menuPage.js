var config = require('../../config')
var login = require('controllers/loginController')
var menuPageData = require('menuPageData')

Page({
    data: {
        hidden_modal: false,
        sitdown: true,
        table_no: '',
        hidden_modal_table: true,
        table_index: null,
        table_id: null,

        // 切换顶部导航栏
        currentTab: 0,
        currentMenu: '我吃过',

        // 订单相关
        sum_money: 0,
        order_view_height: 100,
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
        isTogether: false,
        togetherMenu: []
    },

    sitdown_or_reserve(table_index, which) {
        let table_list = this.data.table_list
        let table = table_list[table_index]
        let user_id = wx.getStorageSync('userid')
        let status = which === 0 ? 1 : 2
        let that = this
        // 坐下
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
            },
            fail: function (err) {
                console.log(err)
            }
        })
    },

    sitdown(table_index) {
        this.sitdown_or_reserve(table_index, 0)
    },

    reserve(table_index) {
        this.sitdown_or_reserve(table_index, 1)
    },

	cancel: function() {
        this.setData({
            hidden_modal: true
        });
    },

    confirm: function() {
        console.log('table_no:', this.data.table_no);
        let number = this.data.table_no.toUpperCase()
        let table_list = this.data.table_list
        let status = this.data.sitdown ? 1 : 2
        if (table_list.length === 0) {
            wx.showToast({
                title: '抱歉，获取桌位信息出错，请稍后再试',
                icon: 'none',
                duration: 3000,
            })
            this.setData({
                hidden_modal: true
            });
            return
        }
        let user_id = wx.getStorageSync('userid')
        let index = 0
        let matched = false
        for (let table of table_list) {
            if (table.number === number) {
                matched = true
                if (table.status === 0) {
                    this.sitdown(index)
                } else if (table.user_id === user_id) {
                    if (table.status === 2) {  // 如果是预订则坐下
                        this.sitdown()
                        wx.showToast({
                            title: 'OK，开始点餐吧',
                            icon: 'success',
                            duration: 3000,
                        })
                    } else {
                        wx.showToast({
                            title: '您已经在这张桌子上啦，直接点餐吧',
                            icon: 'success',
                            duration: 3000,
                        })
                    }
                } else {
                    wx.showToast({
                        title: '抱歉，这张桌子有人了',
                        icon: 'none',
                        duration: 3000,
                    })
                }
                break
            }
            ++index
        }
        if (!matched) {
            wx.showToast({
                title: '桌号输入有误，再来',
                icon: 'none',
                duration: 3000,
            })
        } else {
            this.setData({
                hidden_modal: true
            });
        }
    },

    cancel_table: function() {
        this.setData({
            hidden_modal_table: true
        });
    },

    confirm_table: function() {
        this.setData({
            hidden_modal_table: true
        });
        let status = this.data.sitdown ? 1 : 2;
        let index = this.data.table_index
        let table_id = this.data.table_id
        let that = this
        let user_id = wx.getStorageSync('userid')
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table_id}?status=${status}&user_id=${user_id}`,
            method: "POST",
            success: function(data) {
                let table_list = that.data.table_list;
                table_list[index].status_ = '预'
                table_list[index].user_avatar = wx.getStorageSync('avatar')
                table_list[index].status = status
                table_list[index].user_id = user_id
                that.setData({
                    table_list,
                })
                let title = that.data.sitdown ? '成功' : '预订成功'
                wx.showToast({
                    title,
                    icon: 'success',
                    duration: 3000,
                })
            },
            fail: function (res) {
                console.log(res)
            }
        })
    },

    free_table: function(e) {
        let index = e.target.dataset.index
        let table = this.data.table_list[index]
        let user_id = wx.getStorageSync('userid')
        let that = this
        if (user_id === table.user_id) {
            let status = table.status
            let hint = status === 1 ? '离开' : '取消预订'
            wx.showModal({
                title: '提示',
                content: `您要${hint}这张桌子吗？`,
                success: function(res) {
                    if (res.cancel) return
                    wx.request({
                        url: `${config.service.tablesInfoUrl}/${table.table_id}?user_id=${user_id}`,
                        method: "DELETE",
                        success: function(data) {
                            let table_list = that.data.table_list;
                            table_list[index].status_ = '订'
                            table_list[index].user_avatar = null
                            table_list[index].status = 0
                            table_list[index].user_id = null
                            that.setData({
                                table_list,
                            })
                        },
                        fail: function (res) {
                            console.log("离开桌子失败：", table)
                        }
                    })
                }
            })
        }
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
        console.log('radio 发生 change 事件，携带 value 值为：', e.detail.value)
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
        console.log('getDishes')
        var that = this
        wx.request({
            url: config.service.dishesUrl,
            method: "GET",
            success: function (data) {
                var data_from_server = data.data
                var dishes = new Array(data_from_server.length)
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
                    dishes_list: dishes
                });
                console.log('this.getMyDishes');
                
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
                        console.log('getMyDishes', myDishes)
                        // 恢复我吃过的菜
                        that.recoverOrder()
                    }
                })
            },
            fail: function(res) {
                console.log('getUserid fail')
            }
        })
    },

    // 获取每日推荐的图片链接
    getRecommendedImage: function() {
        console.log('getRecommendedImage')
        var that = this
        wx.request({
            url: config.service.recommendedUrl + '3',
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
        var order = wx.getStorageSync('order')
        var dishes_list = this.data.dishes_list
        if (dishes_list.length === 0) return
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
                }
                that.setData({
                    table_list: table_list
                })
            }
        })
    },

    bookOrTakeTable: function(e) {
        let table_index = e.target.dataset.index
        let table_id = e.target.dataset.id
        this.setData({
            hidden_modal_table: false,
            table_index,
            table_id,
        });
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

        try {
            var isLogin = wx.getStorageSync('isLogin')
            if (!isLogin) login()
        } catch(e) {
            console.log('Get isLogin fail!')
        }

        this.getDishes()
        this.getRecommendedImage()
        this.getTableInfo()
        // this.scanTable()
        // setInterval(this.uploadOrder, 3000)
    }
})