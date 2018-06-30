var config = require('../../../config')

// 信息上传到服务器
var postDataToServer = function postDataToServer(userInfo, code) {
    // console.log('code:', code)
    // console.log('wechat_name:', userInfo.nickName)
    // console.log('wechat_avatar:', userInfo.avatarUrl)
    // console.log('location:', userInfo.country + ' ' + userInfo.city)
    wx.request({
        url: config.service.loginUrl,
        method: "POST",
        data: {
            code: code,
            wechat_name: userInfo.nickName,
            wechat_avatar: userInfo.avatarUrl,
            location: userInfo.country + ' ' + userInfo.city
        },
        success: function (data) {
            // 储存userid
            wx.setStorageSync('userid', data.data.userid)
            wx.setStorageSync('avatar', userInfo.avatarUrl)
        },
        fail: function(res) {
            wx.showToast({
                title: '登陆失败'
            })
        }
    })
}

// 获取用户信息
var getUserInfo = function getUserInfo(login_res) {
    var code = login_res.code
    wx.getUserInfo({
        success: function (info_res) {
            console.log('获取信息成功')
            postDataToServer(info_res.userInfo, code)
        },
        fail: function(res) {
            console.log('获取信息失败')
            wx.showToast({
                title: '获取用户信息失败'
            })
        }
    })
}

var login = function login(option) {
    wx.login({
        success: function (login_res) {
            if (login_res.code) {
                // 登陆成功，获取用户信息
                getUserInfo(login_res)

                // 储存登陆成功的状态
                try {
                    console.log('储存登录状态')
                    wx.setStorageSync('isLogin', true)
                } catch (e) {
                    console.log(e)
                }
            } else {
                wx.showToast({
                    title: '登陆失败'
                })
            }
        },
        fail: function(err_msg) {
            wx.showToast({
                title: '登陆失败'
            })
            console.log(err_msg)
        }
    })
}

module.exports = login;