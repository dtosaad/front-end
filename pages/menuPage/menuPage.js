Page({
  data: {
    // tab切换  
    currentTab: 0,
    currentMenu: 0,
    sum_money: 0,
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    arr: [{
      src:"./image/1.jpg",
      name:"北京烤鸭",
      good:4,
      bad:1,
      num:0,
      price:10
    },{
        src: "./image/1.jpg",
        name: "北京烤鸭",
        good:3,
        bad:2,
        num:0,
        price: 10
    },{
        src: "./image/1.jpg",
        name: "北京烤鸭",
        good:2,
        bad:3,
        num:0,
        price: 10
    },{
        src: "./image/1.jpg",
        name: "北京烤鸭",
        good:5,
        bad:0,
        num:0,
        price: 10
    }]
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
    //console.log(e);
    this.setData({
      currentTab: e.detail.current,
    })

  },
  swiperMenu: function (e) {
    this.setData({
      currentMenu: e.target.dataset.currentmenu,
    })
  },
  bindMinus: function(e) {
    var id = e.target.dataset.id;
    var minus = "arr[" + 0 +"].num"
    var count = this.data.arr[id].num;
    if(count < 1) {
      return false;
    }
    else {
      count--;
    }
    var sum_money = this.data.sum_money - this.data.arr[id].price;
    console.log(sum_money);
    this.setData({
      [minus]: count,
      sum_money: sum_money,
    })
  },
  bindPlus: function(e) {
    var id = e.target.dataset.id;
    var minus = "arr[" + id + "].num"
    var count = this.data.arr[id].num;
    count++;
    var sum_money = this.data.sum_money + this.data.arr[id].price;
    console.log(sum_money);
    this.setData({
      [minus]: count,
      sum_money: sum_money,
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