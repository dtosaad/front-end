Page({
    data: {
        // tab切换  
        currentTab: 0,
        currentMenu: 0,
        sum_money: 0,
        classListStyle: 'class-list',
        imgUrls: [
            'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        arr: [
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 4,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 3,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 2,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 5,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 5,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 5,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 5,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 5,
                num: 0,
                price: 10
            },
            {
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 5,
                num: 0,
                price: 10
            }
        ],
        totalStar: 5
    },
    swichNav: function (e) {
        //console.log(e);
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current,
            })
        }
    },
    swiperChange: function (e) {
        console.log(e);
        this.setData({
            currentTab: e.detail.current,
        })
    },

    // 页面滑动
    scrollPage: function(e) {
        console.log(e.detail.scrollTop)
        var classListStyle = this.data.classListStyle;
        if (e.detail.scrollTop >= 170) {
            if (classListStyle !== 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list-fixed'
                })
            }
            console.log("fixed")
        }
        else if (e.detail.scrollTop < 170) {
            if (classListStyle === 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list'
                })
            }
            console.log("no-fixed")
        }
    },

    swiperMenu: function (e) {
        console.log(e.target.dataset.currentmenu)
        this.setData({
            currentMenu: e.target.dataset.currentmenu,
        })
    },

    // 减号
    bindMinus: function (e) {
        var id = e.target.dataset.id
        var count = this.data.arr[id].num
        var price = this.data.arr[id].price
        var sum_money = this.data.sum_money

        if (count >= 1) {
            count--
            sum_money -= price
        }

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = count < 1 ? 'disabled' : 'normal'

        var minus = "arr[" + id + "].num"
        this.setData({
            [minus]: count,
            sum_money: sum_money,
            minusStatus: minusStatus
        })
    },

    // 加号
    bindPlus: function (e) {
        var id = e.target.dataset.id
        var minus = "arr[" + id + "].num"
        var count = this.data.arr[id].num
        var sum_money = this.data.sum_money
        var price = this.data.arr[id].price

        count++
        sum_money += price

        this.setData({
            [minus]: count,
            sum_money: sum_money
        })
    },

    navigateTo: function () {

        // testing
        var order = [
            {
                dish_id: 1,
                dish_name: "铁板牛肉",
                price: 10.00,
                amount: 2
            },
            {
                dish_id: 1,
                dish_name: "榴莲披萨",
                price: 20.00,
                amount: 1
            }
        ];

        wx.setStorage({
            key: "order",
            data: order
        });

        wx.navigateTo({
            url: "../confirmOrder/confirmOrder"
        })
    },

    onLoad: function (options) {
        // 生命周期函数--监听页面加载
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