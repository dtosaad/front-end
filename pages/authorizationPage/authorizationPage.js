Page({
    data: {
        eye: true
    },
    onLoad: function () {

    },
    onShow: function (options) {
        this.getUserInfoFun()
    },
    getUserInfoFun: function () {
        var S = this;
        wx.getUserInfo({
            success: function (res) {
                console.log("userInfo:" + res)
                wx.reLaunch({
                    url: "../menuPage/menuPage"
                })
            },
            fail: S.showPrePage
        })
    },
    showPrePage: function () {
        this.setData({
            eye: false
        })
    }
})