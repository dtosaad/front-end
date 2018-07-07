var config = require('../config')

// 信息上传到服务器
var postDataToServer = function postDataToServer(userInfo, code) {
    console.log('code:', code)
    console.log('wechat_name:', userInfo.nickName)
    console.log('wechat_avatar:', userInfo.avatarUrl)
    console.log('location:', userInfo.country + ' ' + userInfo.city)
    
    return new Promise((res, rej) => {
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
                // 储存user_id
                console.log('postDataToServer', data)
                wx.setStorageSync('user_id', data.data.user_id)
                wx.setStorageSync('avatar', userInfo.avatarUrl)
                res()
            },
            fail: function (res) {
                wx.showToast({
                    title: JSON.stringify(res),
                    icon: 'none'
                })
                rej()
            }
        })
    })
    
}

// 获取用户信息
var getUserInfo = function getUserInfo(login_res) {
    return new Promise((res, rej) => {
        var code = login_res.code
        wx.getUserInfo({
            success: function (info_res) {
                console.log('获取信息成功')
                postDataToServer(info_res.userInfo, code).then((data) => { res(); })
            },
            fail: function (res) {
                console.log('获取信息失败')
                wx.showToast({
                    title: '获取用户信息失败',
                    icon: 'none'
                })
                rej()
            }
        })
    })
}

// 登陆接口
var login = function login(option) {
    return new Promise((res, rej) => {
        wx.login({
            success: function (login_res) {
                wx.showToast({
                    title: login_res.code,
                    icon: 'none'
                })
                if (login_res.code) {
                    // 登陆成功，获取用户信息
                    console.log('登陆成功')
                    getUserInfo(login_res).then(() => { res(); })
                }
                else {
                    wx.showToast({
                        title: '登陆失败',
                        icon: 'none'
                    })
                    rej()
                }
            },
            fail: function (err_msg) {
                wx.showToast({
                    title: 'wx.login失败',
                    icon: 'none'
                })
                console.log(err_msg)
                rej()
            }
        })
    })
}

module.exports = {
    login: login
};