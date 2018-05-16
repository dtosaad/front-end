// confirmOrder.js

Page({
    // 初始化数据
    data: {
        testData: {
            "data" : [
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
        minusStatus: 'disabled',
        items: [
            { name: 'TS', value: '堂食', checked: 'true' },
            { name: 'WD', value: '外带', checked: 'false' },
            { name: 'WM', value: '外卖', checked: 'false'},
        ]
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

    /* 改变单选框 */
    radioChange: function (e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value)
    },

    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: "确认订单"
        })
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
})