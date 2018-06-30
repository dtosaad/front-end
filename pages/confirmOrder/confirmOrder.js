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
        takeout_info: undefined
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
            wx.reLaunch({
                url:"../usingPage/usingPage"
            })
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

    postOrder: function() {
        var that = this
        var userid = wx.getStorageSync('userid')
        var takeout_info = (this.data.extendStatus == 3) ? this.data.takeout_info : null
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

    // 加载本地缓存的菜单
    onLoad: function (options) {
        var order = this.data.order;
        var total = this.data.total;

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
        console.log(order)
        this.setData({
            order: order,
            total: total
        });
    }
})