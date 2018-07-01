// confirmOrder.js
var config = require('../../config')

Page({
    // 初始化数据
    data: {
        order: [],
        num: 1,
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

        is_together: null,
        need_update: null
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


    // 导航
    navigateTo: function() {
        var extendStatus = this.data.extendStatus;
        var userNumber = this.data.num;
        
        // 保存数据
        wx.setStorageSync("userNumber", userNumber);

        if (extendStatus === 1) {
            if (this.data.is_together) {
                this.posterOrderTogether()
            }
            else {
                wx.reLaunch({
                    url: "../usingPage/usingPage"
                })
            }
        } 
        else {
            var takeout_info = (this.data.extendStatus == 3) ? this.data.takeout_info : null
            if ((this.data.extendStatus == 3) && takeout_info == undefined) {
                wx.showToast({
                    title: '请补全信息！',
                    icon: 'none'
                })
            }
            else {
                // 提交订单
                this.postOrder()

                // 清空本地数据
                try {
                    wx.removeStorageSync('order')
                    wx.removeStorageSync('userNumber')
                } catch (e) {
                    console.log("Clear storage failed!")
                }
                wx.reLaunch({
                    url: "../menuPage/menuPage"
                })
            }
        }
    },

    // 协同上传订单
    posterOrderTogether: function() {
        var table_id = wx.getStorageSync('table_id')
        var that = this
        wx.request({
            url: `${config.service.host}/orders/together?table_id=`+table_id,
            method: 'POST',
            success: function(res) {
                console.log('posterOrderTogether', res)
                setInterval(() => {
                    that.getTableOrderCount()
                }, 3000)
            }
        })
    },

    // 轮询查剩余的未完成人数
    getTableOrderCount: function() {
        
        var table_id = wx.getStorageSync('table_id')
        var that = this
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table_id}`,
            method: 'GET',
            success: function(res) {
                console.log(res.data)
                let {orderers_count} = res.data
                if (orderers_count == 0) {
                    that.setData({
                        need_update: false
                    })
                    wx.reLaunch({
                        url: "../usingPage/usingPage"
                    })
                }
            }
        })
    },

    // 上传订单
    postOrder: function() {
        var that = this
        var userid = wx.getStorageSync('userid')
        var takeout_info = (this.data.extendStatus == 3) ? this.data.takeout_info : null
        var myDiscount = this.data.myDiscount
        var discountIndex = this.data.pickerIndex
        var discount_id = discountIndex == 0 ? null : myDiscount[discountIndex - 1].id
        var myPostData = {
            user_id: userid,
            dishes: this.data.order,
            people_count: this.data.num,
            dinning_choice: this.data.extendStatus,
            note: this.data.note,
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

    getCoupon: function () {
        var user_id = wx.getStorageSync('userid')
        var pickerArray = this.data.pickerArray
        var myDiscount = this.data.myDiscount
        var that = this
        wx.request({
            url: config.service.discountUrl + '?userid=' + user_id,
            method: 'GET',
            success: function(res) {
                console.log('getCoupon', res)
                var discountArr = res.data
                if (discountArr != null) {
                    console.log('here')
                    myDiscount = discountArr
                    for (var discount in discountArr) {
                        pickerArray.push(discount.money)
                    }
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
    getTogetherOrder: function() {
        var table_id = wx.getStorageSync('table_id')
        var user_id = wx.getStorageSync('userid')
        var url = config.service.tablesInfoUrl + '/' + table_id + '/dishes?userid=' + user_id
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
                    order: togetherMenu
                })
            }
        })
    },

    // 加载本地缓存的菜单
    onLoad: function (options) {
        var order = this.data.order;
        var total = this.data.total;
        var is_together = wx.getStorageSync('is_together') ? true : false
        this.setData({
            is_together: is_together,
            need_update: is_together,
        })

        var that = this
        // 获取优惠券
        this.getCoupon()

        if (is_together) {
            setInterval(() => {
                if (!that.data.need_update) return
                that.getTogetherOrder()
            }, 3000)
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
        }
        
        this.setData({
            order: order,
            total: total
        });
    }
})