// addressPage.js

Page({
    data: {
        items: [
            { name: "M", value: '男士', checked: true },
            { name: "F", value: '女士', checked: false }
        ],
        address: "",
        addressDetail: "",
        name: "",
        phone: "",
        gender: "M"
    },

    radioChange: function (e) {
        this.setData({
            gender: e.detail.value
        });
    },

    addressInput: function (e) {
        this.setData({
            address: e.detail.value
        })
    },

    addressDetailInput: function (e) {
        this.setData({
            addressDetail: e.detail.value
        })
    },

    nameInput: function (e) {
        this.setData({
            name: e.detail.value
        })
    },

    phoneInput: function (e) {
        this.setData({
            phone: e.detail.value
        })
    },

    navigateBack: function (e) {
        var self = this;
        var note = self.data.cur_words;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        
        var address = self.data.address;
        var addressDetail = self.data.addressDetail;
        var addressStatus = "address-changed";
        if (address === "") {
            addressStatus = "address-unchanged";
            address = "请填写配送地址";
        }

        if (address == "请填写配送信息" || address == "" ||
            addressDetail == "" || addressStatus == "address-unchanged"||
            self.data.name == "" || self.data.phone == "") {
            wx.showToast({
                title: '请补全信息'
            })
        } else {
            prevPage.setData({
                address: address,
                addressDetail: addressDetail,
                addressStatus: addressStatus,
                name: self.data.name,
                phone: self.data.phone,
                takeout_info: {
                    name: self.data.name,
                    phone: self.data.phone,
                    location: address + ' ' + addressDetail
                }
            });
            wx.navigateBack();
        }

        
    },

    onLoad: function (options) {
        console.log(options.address);
        console.log(options.addressDetail);
        if (options.addressStatus != 'address-unchanged') {
            this.setData({
                address: options.address,
                addressDetail: options.addressDetail,
                name: options.name,
                phone: options.phone
            });
        }
    },
})