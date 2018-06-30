// payPage.js
var config = require('../../config')

Page({
    // 初始化数据
    data: {
        order: [],
        num: 1,
        minusStatus: 'disabled',
        total: 0,

        couponStatus: 'coupon-unchanged',
        coupon: "暂无可用",
        pickerIndex: 0,
        pickerArray: ['不使用'],
        myDiscount: []
    },

    /* 点击减号 */
    bindMinus: function () {
        var num = this.data.num;
        var total = this.data.total;

        // 如果大于1时，才可以减  
        if (num > 1) {
            num--;
            total--;
        }

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = num <= 1 ? 'disabled' : 'normal';

        // 将数值与状态写回  
        this.setData({
            num: num,
            minusStatus: minusStatus,
            total: total
        });
    },


    /* 点击加号 */
    bindPlus: function () {
        var num = this.data.num;
        var total = this.data.total;

        // 人数和总价都自增1
        num++;
        total++;

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = num < 1 ? 'disabled' : 'normal';

        // 将数值与状态写回  
        this.setData({
            num: num,
            minusStatus: minusStatus,
            total: total
        });
    },

    postOrder: function () {
        var that = this
        var userid = wx.getStorageSync('userid')
        var takeout_info = null
        var myDiscount = this.data.myDiscount
        var discountIndex = this.data.pickerIndex
        var discount_id = discountIndex == 0 ? null : myDiscount[discountIndex - 1].id
        var myPostData = {
            user_id: userid,
            dishes: this.data.order,
            people_count: this.data.num,
            dinning_choice: 0,
            note: null,
            takeout_info: takeout_info,
            discount_id: null
        }
        wx.request({
            url: config.service.postOrderUrl,
            method: 'POST',
            data: myPostData,
            success: function (postOrder_res) {
                console.log(postOrder_res)
            }
        })
    },

    // 选择优惠券
    bindCasPickerChange: function (e) {
        console.log('乔丹选的是', this.data.pickerArray[e.detail.value])
        this.setData({
            pickerIndex: e.detail.value
        })

    },

    navigateTo: function () {
        // 提交订单
        this.postOrder()

        wx.reLaunch({
            url: "../reviewPage/reviewPage"
        })
    },

    getCoupon: function () {
        var user_id = wx.getStorageSync('userid')
        var pickerArray = this.data.pickerArray
        var myDiscount = this.data.myDiscount
        var that = this
        wx.request({
            url: config.service.discountUrl + '?userid=' + user_id,
            method: 'GET',
            success: function (res) {
                console.log('getCoupon', res)
                var discountArr = res.data
                if (discountArr != null) {
                    console.log('here')
                    myDiscount = discountArr
                    for (var discount in discountArr) {
                        pickerArray.push(discount.discount)
                    }
                    that.setData({
                        pickerArray: pickerArray,
                        myDiscount: myDiscount
                    })
                }
            },
            fail: function (res) {
                console.log(res)
            }
        })
    },


    // 加载本地缓存的菜单
    onLoad: function (options) {
        var order = this.data.order;
        var total = this.data.total;

        // 获取优惠券
        this.getCoupon()

        // 从本地缓存中同步取出order数组
        try {
            var value = wx.getStorageSync('order')
            var userNumber = wx.getStorageSync('userNumber')
            if (value) {
                order = value;
                order.forEach(item => {
                    total += item.amount * item.price;
                });
            }
        } catch (e) {
            console.log("Get local data failed!");
        }

        // 计算总价
        total += userNumber

        // 更新减号的状态
        var minusStatus = this.data.minusStatus
        if (userNumber > 1) minusStatus = "normal"
        
        this.setData({
            order: order,
            total: total,
            num: userNumber,
            minusStatus: minusStatus
        });
    }
})