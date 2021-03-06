//app.js
var config = require('./config')
var loginTool = require('./utils/login')
App({
    onLaunch: function () {
        console.log('App onLaunch')
    },

    onLoad: function () {
        // 生命周期函数--监听页面加载
        console.log('App onLoad')
    },

    onReady: function () {
        // 生命周期函数--监听页面初次渲染完成
        console.log('App onReady')
    },

    onShow: function () {
        // 生命周期函数--监听页面显示
        console.log('App onShow')
    },

    onHide: function () {
        // 生命周期函数--监听页面隐藏
        console.log('App onHide')
    },

    onUnload: function () {
        // 生命周期函数--监听页面卸载
        console.log('App onUnload')
    },

    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
        console.log('App onPullDownRefresh')
    },

    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
        console.log('App onReachBottom')
    },

    onShareAppMessage: function () {
        console.log('App onShareAppMessage')
        // 用户点击右上角分享
        return {
            title: 'title', // 分享标题
            desc: 'desc', // 分享描述
            path: 'path' // 分享路径
        }
    }
})