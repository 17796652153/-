// components/linkAddress/linkAddress.js
var server = require('../../service/server');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        maskVisual: {
            type: String,
            value: 'hidden'
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        current: 0,
        province: [],
        city: [],
        region: [],
        town: [],
        provinceObjects: [],
        cityObjects: [],
        regionObjects: [],
        townObjects: [],
        areaSelectedStr: '',
        provinceName: '请选择',
    },

    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            console.log('attached');
            var that = this;
            this.getArea(0, function (area) {
                var array = [];
                for (var i = 0; i < area.length; i++) {
                    array[i] = area[i].name;
                }
                that.setData({
                    province: array,
                    provinceObjects: area
                });
            });
        },
        moved: function () {
            console.log('moved');
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
            console.log('detached');
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getArea: function (pid, cb) {
            var that = this;
            server.getJSON('/User/getArea/parent_id/' + pid, function (res) {
                cb(res.data.result);
            })
        },
        // 所在地区级联解雇   隐藏选择地区
        cascadeDismiss: function () {
            this.setData({
                maskVisual: 'hidden'
            });
        },
        // 省选择
        provinceTapped: function (e) {
            // 标识当前点击省份，记录其名称与主键id都依赖它
            var index = e.currentTarget.dataset.index;
            // current为1，使得页面向左滑动一页至市级列表
            // provinceIndex是市区数据的标识
            this.setData({
                provinceName: this.data.province[index],
                regionName: '',
                townName: '',
                provinceIndex: index,
                cityIndex: -1,
                regionIndex: -1,
                townIndex: -1,
                region: [],
                town: []
            });
            var that = this;
            //provinceObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
            // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
            this.getArea(this.data.provinceObjects[index].id, function (area) {
                var array = [];
                for (var i = 0; i < area.length; i++) {
                    array[i] = area[i].name;
                }
                // city就是wxml中渲染要用到的城市数据，cityObjects是LeanCloud对象，用于县级标识取值
                that.setData({
                    cityName: '请选择',
                    city: array,
                    cityObjects: area
                });
                // 确保生成了数组数据再移动swiper
                that.setData({
                    current: 1
                });
            });
        },
        // 市选择
        cityTapped: function (e) {
            // 标识当前点击县级，记录其名称与主键id都依赖它
            var index = e.currentTarget.dataset.index;
            // current为1，使得页面向左滑动一页至市级列表
            // cityIndex是市区数据的标识
            this.setData({
                cityIndex: index,
                regionIndex: -1,
                townIndex: -1,
                cityName: this.data.city[index],
                regionName: '',
                townName: '',
                town: []
            });
            var that = this;
            //cityObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
            // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
            this.getArea(this.data.cityObjects[index].id, function (area) {
                var array = [];
                for (var i = 0; i < area.length; i++) {
                    array[i] = area[i].name;
                }
                // region就是wxml中渲染要用到的城市数据，regionObjects是LeanCloud对象，用于县级标识取值
                that.setData({
                    regionName: '请选择',
                    region: array,
                    regionObjects: area
                });
                // 确保生成了数组数据再移动swiper
                that.setData({
                    current: 2
                });
            });
        },
        // 区选择
        regionTapped: function (e) {
            // 标识当前点击镇级，记录其名称与主键id都依赖它
            var index = e.currentTarget.dataset.index;
            // current为1，使得页面向左滑动一页至市级列表
            // regionIndex是县级数据的标识
            this.setData({
                regionIndex: index,
                townIndex: -1,
                regionName: this.data.region[index],
                townName: ''
            });
            var that = this;
            //townObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
            // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
            this.getArea(this.data.regionObjects[index].id, function (area) {
                // 假如没有镇一级了，关闭悬浮框，并显示地址
                if (area.length == 0) {
                    var areaSelectedStr = that.data.provinceName + that.data.cityName + that.data.regionName;
                    that.triggerEvent('areaSelectedStr', areaSelectedStr)
                    that.setData({
                        areaSelectedStr: areaSelectedStr
                    });
                    that.cascadeDismiss();
                    return;
                }
                var array = [];
                for (var i = 0; i < area.length; i++) {
                    array[i] = area[i].name;
                }
                // region就是wxml中渲染要用到的县级数据，regionObjects是LeanCloud对象，用于县级标识取值
                that.setData({
                    townName: '请选择',
                    town: array,
                    townObjects: area
                });
                // 确保生成了数组数据再移动swiper
                that.setData({
                    current: 3
                });
            });
        },
        // 镇选择
        townTapped: function (e) {
            // 标识当前点击镇级，记录其名称与主键id都依赖它
            var index = e.currentTarget.dataset.index;
            // townIndex是镇级数据的标识
            this.setData({
                townIndex: index,
                townName: this.data.town[index]
            });
            var areaSelectedStr = this.data.provinceName + this.data.cityName + this.data.regionName + this.data.townName;
            this.triggerEvent('areaSelectedStr', areaSelectedStr)
            this.setData({
                areaSelectedStr: areaSelectedStr
            });
            this.cascadeDismiss();
        },
        // 高亮
        currentChanged: function (e) {
            // swiper滚动使得current值被动变化，用于高亮标记
            var current = e.detail.current;
            this.setData({
                current: current
            });
        },
        // 选择选中的
        changeCurrent: function (e) {
            // 记录点击的标题所在的区级级别
            var current = e.currentTarget.dataset.current;
            this.setData({
                current: current
            });
        },
    }
})
