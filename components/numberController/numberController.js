// components/numberController/numberController.js

Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
    properties: {
        amount: {
            type: Number,
            value: 1
        }
    },

    /**
     * 私有数据,组件的初始数据
     * 可用于模版渲染
     */
    data: {
    },

    /**
     * 组件的方法列表
     * 更新属性和数据的方法与更新页面数据的方法类似
     */
    methods: {
        _minusFun() {
            let amount = this.data.amount
            if (amount > 0) {
                amount -= 1
                this.triggerEvent('minus', { amount: amount })
            }
        },

        _plusFun() {
            let amount = this.data.amount
            amount += 1
            this.triggerEvent('plus', { amount: amount })
        }
    }
})