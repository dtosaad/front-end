var togetherController = {
    data: {
        that: null
    },

    setThat: (th) => {
        togetherController.data.that = th
    },

    // 协同告诉后台我点完单了
    posterOrderTogether: function () {
        var user_id = wx.getStorageSync('user_id')
        var table_id = wx.getStorageSync('table_id')
        var that = togetherController.data.that
        wx.request({
            url: `${config.service.host}/weapp/tables/${table_id}/commit?user_id=${user_id}`,
            method: 'POST',
            success: function (res) {
                console.log('posterOrderTogether', res)
                that.uploadOrder()
                var isLastOne = res.data.orderers_count == 0 ? true : false
                console.log('If the customer is the last one?', isLastOne)
                if (isLastOne) {
                    wx.reLaunch({
                        url: "../confirmOrder/confirmOrder"
                    })
                } else {
                    wx.reLaunch({
                        url: "../usingPage/usingPage"
                    })
                }
            }
        })
    },

    // 确认协同点餐
    orderTogether: function (table_id, user_id) {
        var that = togetherController.data.that
        var url = config.service.tablesInfoUrl + '/' + table_id + '/together?user_id=' + user_id
        wx.request({
            url: url,
            method: 'POST',
            success: function (res) {
                wx.setStorageSync('table_id', table_id)
                wx.setStorageSync('is_together', true)
                wx.setStorageSync('need_upload', true)
                that.setData({
                    is_together: true
                })
                setInterval(() => {
                    let need_upload = wx.getStorageSync('need_upload')
                    if (!need_upload || that.data.currentTab === 1) return
                    that.uploadOrder()
                }, config.interval)
            },
            fail: function (res) {
                that.setData({
                    is_together: false
                })
            }
        })
    },
}

module.exports = togetherController