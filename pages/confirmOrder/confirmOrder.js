// confirmOrder.js
var config = require('../../config')

Page({
    // 初始化数据
    data: {
        order: [],
        amount: 1,
        minusStatus: 'disabled',
        items: [
            { name: 'TS', value: '堂食', checked: true },
            { name: 'WD', value: '外带', checked: false },
            { name: 'WM', value: '外卖', checked: false },
        ],
        noteStatus: 'note-unchanged',
        note: "口味偏好等",
        extendStatus: 1,
        couponStatus: 'coupon-unchanged',
        coupon: "暂无可用",
        addressStatus: 'address-unchanged',
        address: "请填写配送地址",
        addressDetail: "",
        phone: "",
        name: "",
        buttonWord: "提交订单",
        total: 1,
        takeout_info: undefined,
        pickerIndex: 0,
        pickerArray: ['不使用'],
        myDiscount: [],

        is_together: false,
        order_id: 0
    },


    /* 点击减号 */
    bindMinus: function () {
        var amount = this.data.amount;
        var total = this.data.total;

        // 如果大于1时，才可以减  
        if (amount > 1) {
            amount--;
            total--;
        }

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = amount <= 1 ? 'disabled' : 'normal';

        // 将数值与状态写回  
        this.setData({
            amount: amount,
            minusStatus: minusStatus,
            total: total
        });
    },


    /* 点击加号 */
    bindPlus: function () {
        var amount = this.data.amount;
        var total = this.data.total;

        // 人数和总价都自增1
        amount++;
        total++;

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = amount < 1 ? 'disabled' : 'normal';

        // 将数值与状态写回  
        this.setData({
            amount: amount,
            minusStatus: minusStatus,
            total: total
        });
    },

    /* 改变单选框 */
    radioChange: function (e) {
        var extendStatus = this.data.extendStatus;
        switch (e.detail.value) {
            case 'TS':
                extendStatus = 1;
                this.setData({
                    buttonWord: "提交订单"
                });
                break;
            case 'WD':
                extendStatus = 2;
                this.setData({
                    buttonWord: "支付订单"
                });
                break;
            case 'WM':
                extendStatus = 3;
                this.setData({
                    buttonWord: "支付订单"
                });
                break;
        };
        this.setData({
            extendStatus: extendStatus
        });
    },

    payOrder: function() {
        var user_id = wx.getStorageSync('user_id')
        var order_id = this.data.order_id
        var table_id = wx.getStorageSync('table_id')
        console.log('payOrder table_id', table_id, typeof(table_id))
        console.log('payOrder order_id', order_id, typeof (order_id))
        console.log('payOrder user_id', user_id, typeof (user_id))
        wx.request({
            url: `${config.service.payUrl}/${order_id}/pay?user_id=${user_id}`,
            method: 'POST',
            data: {
                table_id: table_id
            },
            success: function(res) {
                console.log('Normal pay success!', res)
            }
        })
    },

    // 导航
    navigateTo: function() {
        var that = this
        var extendStatus = this.data.extendStatus;
        var userNumber = this.data.amount;
        var is_together = this.data.is_together
        var table_id = wx.getStorageSync('table_id')
        // 保存数据
        wx.setStorageSync("userNumber", userNumber);

        if (extendStatus === 1) {
            if (!table_id) {
                wx.showToast({
                    title: '请先选择一张桌子~',
                    icon: 'none'
                })
            }
            else {
                this.postOrder().then(() => {
                    wx.removeStorageSync('order')
                    wx.reLaunch({
                        url: "../usingPage/usingPage"
                    })
                })
            }
        } 
        else {
            var takeout_info = (extendStatus == 3) ? this.data.takeout_info : undefined
            if ((extendStatus == 3) && takeout_info == undefined) {
                wx.showToast({
                    title: '请补全信息！',
                    icon: 'none'
                })
            }
            else {
                // 提交订单
                this.postOrder().then(() => {
                    that.payOrder()
                    // 清除部分本地缓存数据
                    try {
                        wx.removeStorageSync('order')
                        wx.removeStorageSync('userNumber')
                    } catch (e) {
                        console.log("Clear storage failed!")
                    }
                    wx.reLaunch({
                        url: "../menuPage/menuPage"
                    })
                })
            }
        }
    },

    // 上传订单
    postOrder: function() {
        var that = this
        var user_id = wx.getStorageSync('user_id')
        var table_id = wx.getStorageSync('table_id')
        var takeout_info = (this.data.extendStatus == 3) ? this.data.takeout_info : null
        var myDiscount = this.data.myDiscount
        var discountIndex = this.data.pickerIndex
        var discount_id = discountIndex == 0 ? null : myDiscount[discountIndex - 1].id
        
        var myPostData = {
            table_id: table_id,
            dishes: this.data.order,
            people_count: this.data.amount,
            dinning_choice: this.data.extendStatus,
            note: this.data.note,
            takeout_info: takeout_info,
            discount_id: null
        }

        return new Promise((res, rej) => {
            wx.request({
                url: `${config.service.postOrderUrl}?user_id=${user_id}`,
                method: 'POST',
                data: myPostData,
                success: function (postOrder_res) {
                    console.log('postOrder_res', postOrder_res)
                    let {order_id} = postOrder_res.data
                    that.setData({
                        order_id: order_id
                    })
                    wx.setStorageSync('order_id', order_id)
                    res()
                },
                fail: function() { rej(); }
            })
        })
    },

    // 选择优惠券
    bindPickerChange: function (e) {
        console.log('乔丹选的是', this.data.pickerArray[e.detail.value])
        var total = this.data.total
        var myDiscount = this.data.myDiscount
        if (e.detail.value > 0) {
            total -= myDiscount[e.detail.value - 1].money
        }
        this.setData({
            pickerIndex: e.detail.value,
            total: total
        })

    },

    getCoupon: function () {
        var user_id = wx.getStorageSync('user_id')
        var pickerArray = this.data.pickerArray
        var myDiscount = this.data.myDiscount
        var that = this
        wx.request({
            url: config.service.discountUrl + '?user_id=' + user_id,
            method: 'GET',
            success: function(res) {
                console.log('getCoupon', res)
                var discountArr = res.data
                if (discountArr != null) {
                    console.log('here')
                    myDiscount = discountArr
                    for (var discount of discountArr) {
                        pickerArray.push(discount.money + '元抵用券')
                    }
                    console.log(pickerArray)
                    that.setData({
                        pickerArray: pickerArray,
                        myDiscount: myDiscount
                    })
                }
            },
            fail: function(res) {
                console.log(res)
            }
        })
    },

    // 获取协同菜单
    getTogetherOrder: function () {
        var table_id = wx.getStorageSync('table_id')
        var user_id = wx.getStorageSync('user_id')
        var url = config.service.tablesInfoUrl + '/' + table_id + '/dishes?user_id=' + user_id
        var dishes_list = wx.getStorageSync('dishes_list')
        var delta = new Array(dishes_list.length)
        for (var i = 0; i < dishes_list.length - 1; i++) {
            delta[i] = 0
        }

        var togetherMenu = []
        var that = this
        wx.request({
            url: url,
            method: 'POST',
            data: delta,
            success: function (res) {
                console.log('togetherMenu', res)
                var togetherArr = res.data
                var total = that.data.total;
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
                        total += temp.price * temp.amount
                    }
                }

                that.setData({
                    order: togetherMenu,
                    total: total
                })
            }
        })
    },

    // 加载本地缓存的菜单
    onLoad: function (options) {
        var order = this.data.order;
        var total = this.data.total;
        var is_together = wx.getStorageSync('is_together')
        this.setData({
            is_together: is_together
        })
        if (is_together) {
            this.getTogetherOrder()
        }
        else {
            // 从本地缓存中同步取出order数组
            try {
                var value = wx.getStorageSync('order')
                if (value) {
                    order = value;
                    order.forEach(item => {
                        total += item.amount * item.price;
                    });
                }
            } catch (e) {
                console.log("Get local data failed!");
            }

            this.setData({
                order: order,
                total: total
            });
        }

        // 获取优惠券
        this.getCoupon()
    }
})