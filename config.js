/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://fjttesdn.qcloud.la';
// var host = 'https://793673217.sysuadc.club';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/users/signin`,

        // 获取菜单
        dishesUrl: `${host}/weapp/dishes`,

        // 获取每日推荐图片
        recommendedUrl: `${host}//images/recommendation?number=`,

        // 图片
        imageUrl: `${host}/weapp`,

        // 提交订单
        postOrderUrl: `${host}/weapp/orders`,

        // 获取桌位信息
        tablesInfoUrl: `${host}/weapp/tables`
    }
};

module.exports = config;
