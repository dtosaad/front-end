var config = require('../../../config')

var tableController = {
    data: {
        that: null
    },

    setThat: (th) => {
        tableController.data.that = th
    },

    // 选择桌子
    choose_table: function (table_index) {
        var that = tableController.data.that
        let table_list = that.data.table_list
        if (table_list.length === 0) {
            wx.showToast({
                title: '抱歉，获取桌位信息出错，请稍后再试',
                icon: 'none',
                duration: 3000,
            })
            return
        }
        let user_id = wx.getStorageSync('user_id')
        // 1. 是这个桌子的主人
        let own_table_index = -1
        let chosen_table = table_list[table_index]
        if (chosen_table.user_id === user_id) {
            if (chosen_table.status === 2) {
                that.sitdown(table_index)
            }
            return true
        }
        for (let i = 0; i < table_list.length; ++i) {
            let table = table_list[i]
            // 2. 是其它桌子的主人
            if (table.user_id === user_id) {
                own_table_index = i
                wx.showToast({
                    title: '抱歉，不能重复选择桌子',
                    icon: 'none',
                    duration: 3000,
                })
                return false
            }
        }
        // 3. 不是任一桌子的主人
        if (own_table_index === -1) {
            let table = table_list[table_index]
            // 协同点餐
            if (table.user_id) {
                wx.showModal({
                    title: '提示',
                    content: `该桌子有人了，要进入协同点餐吗？`,
                    success: function (res) {
                        if (res.cancel) return
                        that.orderTogether(table.table_id, user_id)
                    }
                })
            } else {  // 坐下，成为这个桌子的主人
                that.setData({
                    hidden_modal_table: false,
                    table_index,
                });
            }
        }
    },

    // 离开桌子
    free_table: (table_index) => {
        var that = tableController.data.that
        let table = that.data.table_list[table_index]
        let user_id = wx.getStorageSync('user_id')
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table.table_id}?user_id=${user_id}`,
            method: "DELETE",
            success: function (data) {
                let table_list = that.data.table_list;
                table_list[table_index].status_ = '订'
                table_list[table_index].user_avatar = null
                table_list[table_index].status = 0
                table_list[table_index].user_id = null
                that.setData({
                    table_list,
                    is_together: false,
                })
                wx.removeStorageSync('table_id')
                wx.removeStorageSync('is_together')
            },
            fail: function (res) {
                console.log("离开桌子失败", res)
            }
        })
    },

    // 坐下或者预约
    sitdown_or_reserve: (table_index, which, callback) => {
        var that = tableController.data.that
        let table_list = that.data.table_list
        let table = table_list[table_index]
        let user_id = wx.getStorageSync('user_id')
        let status = which === 0 ? 1 : 2
        // 坐下
        wx.setStorageSync("table_id", table.table_id)
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table.table_id}?status=${status}&user_id=${user_id}`,
            method: 'POST',
            success: function () {
                table_list[table_index].status_ = '预'
                table_list[table_index].user_avatar = wx.getStorageSync('avatar')
                table_list[table_index].status = status
                table_list[table_index].user_id = user_id
                that.setData({
                    table_list,
                })
                wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 3000,
                })
                if (callback) callback()
            },
            fail: function (err) {
                console.log(err)
            }
        })
    },

    // 坐下
    sitdown : (table_index) => {
        var that = tableController.data.that
        let { table_id } = that.data.table_list[table_index]
        that.sitdown_or_reserve(table_index, 0, () => {
            setInterval(() => {
                that.getSingleTableInfo(table_id)
            }, config.interval)
        })
    },

    // 预订
    reserve : (table_index) => {
        that.sitdown_or_reserve(table_index, 1)
    },

    // 获取所有的桌位信息
    getTableInfo: function () {
        var table_list = []
        var that = tableController.data.that
        let user_id = wx.getStorageSync('user_id')
        wx.request({
            url: `${config.service.tablesInfoUrl}/all?user_id=${user_id}`,
            method: 'GET',
            success: function (server_res) {
                console.log('tables', server_res)
                var allTables = server_res.data
                let has_table = false
                let get_tables_first = that.data.get_tables_first
                for (var i = 0; i < allTables.length; i++) {
                    var table = {
                        index: i,
                        table_id: allTables[i].table_id,
                        number: allTables[i].number,
                        status_: allTables[i].user_id == null ? '订' : '预',
                        color: allTables[i].number[0] == 'A' ? 1 : allTables[i].number[0] == 'B' ? 2 : 3,
                        user_avatar: allTables[i].user_avatar,
                        status: allTables[i].status,
                        user_id: allTables[i].user_id,
                    };
                    table_list.push(table);
                    if (get_tables_first && table.user_id === user_id) {
                        has_table = true
                        wx.setStorageSync('table_id', table.table_id)
                    }
                }
                if (get_tables_first && !has_table) {
                    that.setData({
                        hidden_modal: false,
                    })
                }
                that.setData({
                    table_list: table_list,
                    get_tables_first: false
                })
            }
        })
    },

    // 获取单独的桌位信息
    getSingleTableInfo: function (table_id) {
        console.log('table_id in getSingleTableInfo()', table_id)
        var that = tableController.data.that
        let user_id = wx.getStorageSync('user_id')
        wx.request({
            url: `${config.service.tablesInfoUrl}/${table_id}?user_id=${user_id}`,
            method: 'GET',
            success: function (res) {
                console.log(res.data)
                let { orderers_total } = res.data
                if (orderers_total > 1) {
                    let is_together = wx.getStorageSync('is_together')
                    console.log('&&&&&&&&&', orderers_total, is_together)
                    if (!is_together) {
                        that.orderTogether(table_id, user_id)
                    }
                } else {
                    wx.setStorageSync('is_together', false)
                    that.setData({
                        is_together: false
                    })
                }
            }
        })
    },
}

module.exports = tableController