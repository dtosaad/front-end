// reviewPage.js

Page({
    // 初始化数据
    data: {
        testData: {
            data: [
                {
                    id: 1,
                    name: "铁板牛肉aaa",
                    star: 5
                },
                {
                    id: 2,
                    name: "铁板牛肉",
                    star: 0
                }
            ]
        },
        num: 1,
        minusStatus: 'disabled'
    },

    navigateTo: function () {
        wx.redirectTo({
            url: "../menuPage/menuPage"
        })
    },
})