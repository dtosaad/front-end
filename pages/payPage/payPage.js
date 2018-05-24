// payPage.js

Page({
    // 初始化数据
    data: {
        testData: {
            "data": [
                {
                    "id": 1,
                    "name": "铁板牛肉aaa",
                    "number": 1,
                    "money": 10
                },
                {
                    "id": 2,
                    "name": "铁板牛肉",
                    "number": 1,
                    "money": 10
                }
            ]
        },
        num: 1,
        minusStatus: 'disabled'
    },

    /* 点击减号 */
    bindMinus: function () {
        var num = this.data.num;
        // 如果大于1时，才可以减  
        if (num > 1) {
            num--;
        }
        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = num <= 1 ? 'disabled' : 'normal';
        // 将数值与状态写回  
        this.setData({
            num: num,
            minusStatus: minusStatus
        });
    },
    /* 点击加号 */
    bindPlus: function () {
        var num = this.data.num;
        // 不作过多考虑自增1  
        num++;
        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = num < 1 ? 'disabled' : 'normal';
        // 将数值与状态写回  
        this.setData({
            num: num,
            minusStatus: minusStatus
        });
    },
    /* 输入框事件 */
    bindManual: function (e) {
        var num = e.detail.value;
        // 将数值与状态写回  
        this.setData({
            num: num
        });
    },

    navigateTo: function () {
        wx.reLaunch({
            url: "../reviewPage/reviewPage"
        })
    },
})