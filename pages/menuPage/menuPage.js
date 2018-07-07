var config = require('../../config')
var tableController = require('./controllers/tableController')
var userController = require('./controllers/userController')
var togetherController = require('./controllers/togetherController')
var orderController = require('./controllers/orderController')
var menuController = require('./controllers/menuController')

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
        isAddMeal: false,
        
    },

    dishAmountChange(e) {
        // 获得当前点击的行数

        var amount = e.detail.amount
        var dish_id = e.target.dataset.id
        console.log(amount, dish_id, e.target.dataset)
        var data_name = "dishes_list[" + dish_id + "].amount"
        this.setData({
            [data_name]: amount
        })
        this.updateOrderMenu()
    },

    choose_table: tableController.choose_table,

    free_table: tableController.free_table,

    sitdown_or_reserve: tableController.sitdown_or_reserve,

    sitdown: tableController.sitdown,

    reserve: tableController.reserve,

    // 点击桌位头像
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

    // 取消输入
	cancel_input: function() {
        this.setData({
            hidden_modal: true
        });
    },

    // 确认输入
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

    // 取消
    cancel_take: function() {
        this.setData({
            hidden_modal_table: true
        });
    },

    // 确认
    confirm_take: function() {
        if (this.data.sitdown) {
            this.sitdown(this.data.table_index)
        } else {
            this.reserve(this.data.table_index)
        }
        this.setData({
            hidden_modal_table: true
        });
    },

    // 输入桌号
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
    updateOrderMenu: orderController.updateOrderMenu,

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

    // 上传加餐信息
    postAddedMeal: orderController.postAddedMeal,
 
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
    posterOrderTogether: orderController.posterOrderTogether,


    navigateToConfirmOrder: function() {
        var amount = this.data.ordermenu.length
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
        else if (amount != 0) {
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
    getDishes: menuController.getDishes,

    // 获取我吃过的菜谱
    getMyDishes: menuController.getMyDishes,

    // 获取每日推荐的图片链接
    getRecommendedImage: menuController.getRecommendedImage,

    // 恢复点单数据
    recoverOrder: userController.recoverOrder,

    // 获取所有的桌位信息
    getTableInfo: tableController.getTableInfo,

    // 获取单独的桌位信息
    getSingleTableInfo: tableController.getSingleTableInfo,

    // 预订或者坐下
    bookOrTakeTable: function(e) {
        let table_index = e.target.dataset.index
        this.setData({
            table_index,
        })
        this.choose_table(table_index)
    },

    // 确认协同点餐
    orderTogether: togetherController.orderTogether,

    // 上传我点的菜，拉下一起点的菜
    uploadOrder: userController.uploadOrder,

    onLoad: function (options) {
        orderController.setThat(this)
        tableController.setThat(this)
        togetherController.setThat(this)
        menuController.setThat(this)
        userController.setThat(this)

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