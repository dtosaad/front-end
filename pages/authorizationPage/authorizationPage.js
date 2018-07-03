// authorizationPage.js
var loginTool = require('../../utils/login')

Page({
    data: {
        eye: true
    },

    onShow: function (options) {
        this.getUserInfoFun()
    },

    // 认证后在成功的回调函数中登陆并跳转
    getUserInfoFun: function () {
        var S = this;
        wx.getUserInfo({
            success: function (res) {
                loginTool.login().then(() => {
                    console.log('authorizationPage.js 登陆成功')
                    wx.reLaunch({
                        url: "../menuPage/menuPage"
                    })
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