// notePage.js

Page({
    data: {
        cur_words_num: 0,
        cur_words: ''
    },

    noteInput: function(e) {
        this.setData({
            cur_words_num: e.detail.value.length,
            cur_words: e.detail.value
        })
    },

    navigateBack: function(e) {
        var self = this;
        var note = self.data.cur_words;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        
        prevPage.setData({
            note: note,
            noteStatus: 'note-changed'
        });
        wx.navigateBack();
    },

    onLoad: function (options) {
        if (options.note) {
            this.setData({
                cur_words: options.note,
                cur_words_num: options.note.length
            });
        }
    },
})