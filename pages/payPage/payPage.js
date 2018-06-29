// payPage.js

Page({
    // 初始化数据
    data: {
        order: [],
        num: 1,
        minusStatus: 'disabled',
        total: 0    
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

    navigateTo: function () {
        wx.reLaunch({
            url: "../reviewPage/reviewPage"
        })
    },

    // 加载本地缓存的菜单
    onLoad: function (options) {
        var order = this.data.order;
        var total = this.data.total;

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