Page({
    data: {
        // tab切换  
        currentTab: 0,
        currentMenu: 0,
        sum_money: 0,
        order_view_height: 100,
        show_order: false,
        classListStyle: 'class-list',
        imgUrls: [
            'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        ordermenu:[],
        arr: [
            {
                id: 1,
                menu: 0,
                src: "./image/1.jpg",
                name: "北京烤鸭",
                star: 4,
                num: 0,
                price: 10
            },
            {
                id: 2,
                menu: 1,
                src: "./image/1.jpg",
                name: "广东烤鸭",
                star: 3,
                num: 0,
                price: 8
            },
            {
                id: 3,
                menu: 3,
                src: "./image/1.jpg",
                name: "四川烤鸭",
                star: 2,
                num: 0,
                price: 5
            },
            {
                id: 4,
                menu:4,
                src: "./image/1.jpg",
                name: "湖南烤鸭",
                star: 5,
                num: 0,
                price: 4
            },
            {
                id: 5,
                menu: 5,
                src: "./image/1.jpg",
                name: "浙江烤鸭",
                star: 5,
                num: 0,
                price: 7
            },
            {
                id: 6,
                menu: 1,
                src: "./image/1.jpg",
                name: "潮汕烤鸭",
                star: 5,
                num: 0,
                price: 50
            },
            {
                id: 7,
                menu: 2,
                src: "./image/1.jpg",
                name: "江苏烤鸭",
                star: 5,
                num: 0,
                price: 9
            },
            {
                id: 8,
                menu: 4,
                src: "./image/1.jpg",
                name: "上海烤鸭",
                star: 5,
                num: 0,
                price: 8
            },
            {
                id: 9,
                menu: 3,
                src: "./image/1.jpg",
                name: "天津烤鸭",
                star: 5,
                num: 0,
                price: 6
            }
        ],
        totalStar: 5
    },
    swichNav: function (e) {
        //console.log(e);
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current,
            })
        }
    },
    swiperChange: function (e) {
        console.log(e);
        this.setData({
            currentTab: e.detail.current,
        })
    },

    showOrderMenu: function(e) {
      function orderedItem() {
        this.dish_id = 0;
        this.dish_name = "";
        this.price = 0;
        this.amount = 0;
      }
      var change = false;
      if (!this.data.show_order) {
        change = true;
        this.data.ordermenu.length = 0;
        for (var i = 0; i < this.data.arr.length; i++) {
          if (this.data.arr[i].num > 0) {
            var temp = new orderedItem();
            temp.dish_id = this.data.arr[i].id;
            temp.dish_name = this.data.arr[i].name;
            temp.price = this.data.arr[i].price;
            temp.amount = this.data.arr[i].num;
            this.data.ordermenu.push(temp);
          }
        }
        this.data.order_view_height = this.data.ordermenu.length * 70 + 40;
      }
      this.setData({
        ordermenu: this.data.ordermenu,
        order_view_height: this.data.order_view_height,
        show_order: change,
      })
      //console.log(this.data.ordermenu.length);
    },

    orderMinus: function(e) {
      //struct orderedItem
      function orderedItem() {
        this.dish_id = 0;
        this.dish_name = "";
        this.price = 0;
        this.amount = 0;
      }

      var index = e.target.dataset.id;
      var sum_money = this.data.sum_money
      var count = 0;
      var i;
      for (i = 0; i < this.data.arr.length; i++) {
        if (this.data.arr[i].id == index) {
          count = this.data.arr[i].num;
          if (count >= 1) {
            count--;
            sum_money = sum_money - this.data.arr[i].price;
            this.data.arr[i].num = count;
            this.data.ordermenu.length = 0;

            //change ordermenu
            for (var j = 0; j < this.data.arr.length; j++) {
              if (this.data.arr[j].num > 0) {
                var temp = new orderedItem();
                temp.dish_id = this.data.arr[j].id;
                temp.dish_name = this.data.arr[j].name;
                temp.price = this.data.arr[j].price;
                temp.amount = this.data.arr[j].num;
                this.data.ordermenu.push(temp);
              }
            }
            //change order view height
            this.data.order_view_height = this.data.ordermenu.length * 70 + 40;
          }
          break;
        }
      }

      var minus = "arr[" + i + "].num"
      this.setData({
        [minus]: count,
        sum_money: sum_money,
        ordermenu: this.data.ordermenu,
        order_view_height: this.data.order_view_height,
      })
      //console.log(index);
    },

    orderPlus: function(e) {
      //struct orderedItem
      function orderedItem() {
        this.dish_id = 0;
        this.dish_name = "";
        this.price = 0;
        this.amount = 0;
      }

      var index = e.target.dataset.id;
      var sum_money = this.data.sum_money
      var count = 0;
      var i;
      for (i = 0; i < this.data.arr.length; i++) {
        if (this.data.arr[i].id == index) {
          count = this.data.arr[i].num;
          count++;
          sum_money = sum_money + this.data.arr[i].price;

          //change ordermenu
          this.data.arr[i].num = count;
          this.data.ordermenu.length = 0;
          for (var j = 0; j < this.data.arr.length; j++) {
            if (this.data.arr[j].num > 0) {
              var temp = new orderedItem();
              temp.dish_id = this.data.arr[j].id;
              temp.dish_name = this.data.arr[j].name;
              temp.price = this.data.arr[j].price;
              temp.amount = this.data.arr[j].num;
              this.data.ordermenu.push(temp);
            }
          }
          //change order view height
          this.data.order_view_height = this.data.ordermenu.length * 70 + 40;
          break;
        }
      }
      var minus = "arr[" + i + "].num"
      this.setData({
        [minus]: count,
        sum_money: sum_money,
        ordermenu: this.data.ordermenu,
        order_view_height: this.data.order_view_height,
      })
      //console.log(index);
    },
    // 页面滑动
    scrollPage: function(e) {
        console.log(e.detail.scrollTop)
        var classListStyle = this.data.classListStyle;
        if (e.detail.scrollTop >= 170) {
            if (classListStyle !== 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list-fixed'
                })
            }
            console.log("fixed")
        }
        else if (e.detail.scrollTop < 170) {
            if (classListStyle === 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list'
                })
            }
            console.log("no-fixed")
        }
    },

    swiperMenu: function (e) {
        //console.log(e.target.dataset.currentmenu)
        this.setData({
            currentMenu: e.target.dataset.currentmenu,
        })
    },

    // 减号
    bindMinus: function (e) {
        //struct orderedItem
        function orderedItem() {
          this.dish_id = 0;
          this.dish_name = "";
          this.price = 0;
          this.amount = 0;
        }

        var id = e.target.dataset.id
        var count = this.data.arr[id].num
        var price = this.data.arr[id].price
        var sum_money = this.data.sum_money

        if (count >= 1) {
            count--
            this.data.arr[id].num = count;
            sum_money -= price
        }

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = count < 1 ? 'disabled' : 'normal'

        var minus = "arr[" + id + "].num"

        this.data.ordermenu.length = 0;
        //change ordermenu
        for (var j = 0; j < this.data.arr.length; j++) {
          if (this.data.arr[j].num > 0) {
            var temp = new orderedItem();
            temp.dish_id = this.data.arr[j].id;
            temp.dish_name = this.data.arr[j].name;
            temp.price = this.data.arr[j].price;
            temp.amount = this.data.arr[j].num;
            this.data.ordermenu.push(temp);
          }
        }
        //change order view height
        this.data.order_view_height = this.data.ordermenu.length * 70 + 40;

        this.setData({
            [minus]: count,
            sum_money: sum_money,
            minusStatus: minusStatus,
            ordermenu: this.data.ordermenu,
            order_view_height: this.data.order_view_height,
        })
    },

    // 加号
    bindPlus: function (e) {
        //struct orderedItem
        function orderedItem() {
          this.dish_id = 0;
          this.dish_name = "";
          this.price = 0;
          this.amount = 0;
        }

        var id = e.target.dataset.id
        var minus = "arr[" + id + "].num"
        var count = this.data.arr[id].num
        var sum_money = this.data.sum_money
        var price = this.data.arr[id].price

        count++;
        this.data.arr[id].num = count;
        sum_money += price;

        this.data.ordermenu.length = 0;
        //change ordermenu
        for (var j = 0; j < this.data.arr.length; j++) {
          if (this.data.arr[j].num > 0) {
            var temp = new orderedItem();
            temp.dish_id = this.data.arr[j].id;
            temp.dish_name = this.data.arr[j].name;
            temp.price = this.data.arr[j].price;
            temp.amount = this.data.arr[j].num;
            this.data.ordermenu.push(temp);
          }
        }
        //change order view height
        this.data.order_view_height = this.data.ordermenu.length * 70 + 40;

        this.setData({
            [minus]: count,
            sum_money: sum_money,
            ordermenu: this.data.ordermenu,
            order_view_height: this.data.order_view_height,
        })
    },
    navigateTo: function () {
      //struct orderedItem
      function orderedItem() {
        this.dish_id = 0;
        this.dish_name = "";
        this.price = 0;
        this.amount = 0;
      }
        var order = new Array();
        var order_index = 0;
        for(var i = 0; i < this.data.arr.length; i++){
          if(this.data.arr[i].num > 0) {
            var temp = new orderedItem();
            temp.dish_id = this.data.arr[i].id;
            temp.dish_name = this.data.arr[i].name;
            temp.price = this.data.arr[i].price;
            temp.amount = this.data.arr[i].num;
            order.push(temp);
          }
        }

        console.log(order.length);
        /* testing
        var order = [
            {
                dish_id: 1,
                dish_name: "铁板牛肉",
                price: 10.00,
                amount: 1
            },
            {
                dish_id: 2,
                dish_name: "榴莲披萨",
                price: 20.00,
                amount: 1
            }
        ];
        */
        wx.setStorage({
            key: "order",
            data: order
        });

        wx.navigateTo({
            url: "../confirmOrder/confirmOrder"
        })
    },

    onLoad: function (options) {
        // 生命周期函数--监听页面加载
    },
    onReady: function () {
        // 生命周期函数--监听页面初次渲染完成
    },
    onShow: function () {
        // 生命周期函数--监听页面显示
    },
    onHide: function () {
        // 生命周期函数--监听页面隐藏
    },
    onUnload: function () {
        // 生命周期函数--监听页面卸载
    },
    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
    },
    onShareAppMessage: function () {
        // 用户点击右上角分享
        return {
            title: 'title', // 分享标题
            desc: 'desc', // 分享描述
            path: 'path' // 分享路径
        }
    }
})