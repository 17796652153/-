<template>
	<view class="modal">
		<view :class="maskVisual == 'hidden' ? 'modal-mask hidden' : 'modal-mask show'" @click="cascadeDismiss"></view>
		<view :class=" maskVisual == 'hidden' ? 'modal-content' : 'onPopup modal-content'">
			<view class="modal-header">
				<text class="modal-title">所在地区</text>
				<text class="modal-close" @click="cascadeDismiss">X</text>
			</view>
			<view class="modal-body">
				<text :class="current == 0 ? 'viewpager-title area-selected pro' : 'viewpager-title pro'"
					@click="changeCurrent(0)">{{provinceName}}</text>
				<text :class="current == 1 ? 'viewpager-title area-selected city' : 'viewpager-title city'"
					@click="changeCurrent(1)" v-if="cityName">{{cityName}}</text>
				<text :class="current == 2 ? 'viewpager-title area-selected regoin' : 'viewpager-title regoin'"
					@click="changeCurrent(2)" v-if="regionName">{{regionName}}</text>
				<text :class="current == 3 ? 'viewpager-title area-selected' : 'viewpager-title '"
					@click="changeCurrent(3)" v-if="townName">{{townName}}</text>

				<view class="viewpager-divider"></view>
				<swiper class="swiper-area" :current="current" @change="currentChanged">
					<block v-if="province.length > 0">
						<swiper-item>
							<scroll-view scroll-y="true" class="viewpager-listview">
								<view v-for="(item,index) in province" :key="index" @click="provinceTapped(index)">
									<text v-if="index == provinceIndex" class="area-selected">{{item}}</text>
									<text v-else>{{item}}</text>
								</view>
							</scroll-view>
						</swiper-item>
					</block>
					<block v-if="city.length > 0">
						<swiper-item>
							<scroll-view scroll-y="true" class="viewpager-listview">
								<view v-for="(item,index) in city" :key="index" @click="cityTapped(index)">
									<text v-if="index == cityIndex" class="area-selected">{{item}}</text>
									<text v-else>{{item}}</text>
								</view>
							</scroll-view>
						</swiper-item>
					</block>
					<block v-if="region.length > 0">
						<swiper-item>
							<scroll-view scroll-y="true" class="viewpager-listview">
								<view v-for="(item,index) in region" :key="index" @click="regionTapped(index)">
									<text v-if="index == regionIndex" class="area-selected">{{item}}</text>
									<text v-else>{{item}}</text>
								</view>
							</scroll-view>
						</swiper-item>
					</block>
					<block v-if="town.length > 0">
						<swiper-item>
							<scroll-view scroll-y="true" class="viewpager-listview">
								<view v-for="(item,index) in town" :key="index" @click="townTapped(index)">
									<text v-if="index == townIndex" class="area-selected">{{item}}</text>
									<text v-else>{{item}}</text>
								</view>
							</scroll-view>
						</swiper-item>
					</block>
				</swiper>
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		props: {
			maskVisual: {
				type: String,
				default: 'hidden',
				required: true
			},
			returnLevel: {
				type: String,
				default: 'all',
			},
			defaultProvince: {
				type: String,
				default: '',
			},
			defaultCity: {
				type: String,
				default: '',
			},
			defaultRegion: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
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
				
				cityName: '',
				regionName: '',
				townName: '',
			}
		},
		mounted() {
			var that = this;
			this.getArea(100000, function(area) {
				var array = [];
				for (var i = 0; i < area.length; i++) {
					array[i] = area[i].name;
				}
				that.province = array;
				that.provinceObjects = area;
				
				// 如果有默认的省编号，则直接调用获取市的方法，进行回显
				if(that.defaultProvince){
					area.forEach((item,index) => {
						if(item.id == that.defaultProvince){
							that.provinceTapped(index);
						}
					})
				}
			});
		},
		methods: {
			getArea: function(pid, cb) {
				var that = this;
				http.postJSON('api/Index/queryAddress',{
					pid: pid
				}, function(res) {
					cb(res.data);
			 })
			},
			// 所在地区级联解雇   隐藏选择地区
			cascadeDismiss: function() {
				this.$emit('cascadeDismiss')
			},
			// 省选择
			provinceTapped: function(index) {
				// 标识当前点击省份，记录其名称与主键id都依赖它
				// current为1，使得页面向左滑动一页至市级列表
				// provinceIndex是市区数据的标识
				this.provinceName = this.province[index];
				this.provinceId = this.provinceObjects[index].id;
				this.regionName = '';
				this.townName = '';
				this.provinceIndex = index;
				this.cityIndex = -1;
				this.regionIndex = -1;
				this.townIndex = -1;
				this.region = [];
				this.town = [];
				
				var that = this;
				//provinceObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
				// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
				this.getArea(this.provinceObjects[index].id, function(area) {
					// 假如需要返回的级别是 省，则关闭悬浮框，并显示地址
					if (that.returnLevel == 'province') {
						var areaSelectedStr = that.provinceName;
						let addrArr = [that.provinceName];
						that.$emit('areaSelectedStr', addrArr)
						that.areaSelectedStr = areaSelectedStr
						that.cascadeDismiss();
						return;
					}
					var array = [];
					for (var i = 0; i < area.length; i++) {
						array[i] = area[i].name;
					}
					// city就是wxml中渲染要用到的城市数据，cityObjects是LeanCloud对象，用于县级标识取值
					that.cityName = '请选择';
					that.city = array;
					that.cityObjects = area;
					// 确保生成了数组数据再移动swiper
					that.current = 1;
					
					// 如果有默认的城市编号，则直接调用获取区的方法，进行回显
					if(that.defaultCity){
						area.forEach((item,index) => {
							if(item.id == that.defaultCity){
								that.cityTapped(index);
							}
						})
					}
				});
			},
			// 市选择
			cityTapped: function(index) {
				// 标识当前点击县级，记录其名称与主键id都依赖它
				// current为1，使得页面向左滑动一页至市级列表
				// cityIndex是市区数据的标识
				this.cityIndex = index;
				this.regionIndex = -1;
				this.townIndex = -1;
				this.cityName = this.city[index];
				this.cityId = this.cityObjects[index].id;
				this.regionName = '';
				this.townName = '';
				this.town = [];
				
				var that = this;
				//cityObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
				// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
				this.getArea(this.cityObjects[index].id, function(area) {
					// 假如需要返回的级别是 市，则关闭悬浮框，并显示地址
					if (that.returnLevel == 'city') {
						var areaSelectedStr = that.provinceName + that.cityName;
						let addrArr = [that.provinceName, that.cityName];
						let addArrIds = [that.provinceId, that.cityId];
						that.$emit('areaSelectedStr', addrArr,addArrIds);
						that.areaSelectedStr = areaSelectedStr
						that.cascadeDismiss();
						return;
					}
					
					var array = [];
					for (var i = 0; i < area.length; i++) {
						array[i] = area[i].name;
					}
					// region就是wxml中渲染要用到的城市数据，regionObjects是LeanCloud对象，用于县级标识取值
					that.regionName = '请选择';
					that.region = array;
					that.regionObjects = area;
					// 确保生成了数组数据再移动swiper
					that.current = 2;
					
					if(that.defaultRegion){
						area.forEach((item,index) => {
							if(item.id == that.defaultRegion){
								that.regionTapped(index);
							}
						})
					}
				});
			},
			// 区选择
			regionTapped: function(index) {
				// 标识当前点击镇级，记录其名称与主键id都依赖它
				// current为1，使得页面向左滑动一页至市级列表
				// regionIndex是县级数据的标识
				this.regionIndex = index;
				this.townIndex = -1;
				this.regionName = this.region[index];
				this.townName = '';
				
				var that = this;
				//townObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
				// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
				this.getArea(this.regionObjects[index].id, function(area) {
					// 假如没有镇一级了，关闭悬浮框，并显示地址
					if (area.length == 0) {
						var areaSelectedStr = that.provinceName + that.cityName + that.regionName;
						let addrArr = [that.provinceName, that.cityName, that.regionName];
						// that.triggerEvent('areaSelectedStr', areaSelectedStr)
						that.$emit('areaSelectedStr', addrArr)
						that.areaSelectedStr = areaSelectedStr
						that.cascadeDismiss();
						return;
					}
					var array = [];
					for (var i = 0; i < area.length; i++) {
						array[i] = area[i].name;
					}
					// region就是wxml中渲染要用到的县级数据，regionObjects是LeanCloud对象，用于县级标识取值
					that.townName = '请选择';
					that.town = array;
					that.townObjects = area;
					// 确保生成了数组数据再移动swiper
					that.current = 3
				});
			},
			// 镇选择
			townTapped: function(index) {
				// 标识当前点击镇级，记录其名称与主键id都依赖它
				// townIndex是镇级数据的标识
				this.townIndex = index;
				this.townName = this.town[index]
				var areaSelectedStr = this.provinceName + this.cityName + this.regionName + this.townName;
				let addrArr = [that.provinceName, that.cityName, that.regionName, this.townName];
				// this.triggerEvent('areaSelectedStr', areaSelectedStr)
				this.$emit('areaSelectedStr', addrArr)
				this.areaSelectedStr = areaSelectedStr;
				this.cascadeDismiss();
			},
			// 高亮
			currentChanged: function(e) {
				// swiper滚动使得current值被动变化，用于高亮标记
				var current = e.detail.current;
				this.current = current;
			},
			// 选择选中的
			changeCurrent: function(current) {
				// 记录点击的标题所在的区级级别
				this.current = current;
			},
		},
	}
</script>

<style>
	/*弹窗主体*/
	.modal-content {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 285px;
		/*box-shadow: 10rpx 0 30rpx rgba(0,0,0,.9);*/
		margin-top: 5px;
		background: #fff;
		z-index: 999;
		transform: translate3d(0, 100%, 0);
		transition: all .3s cubic-bezier(.25, .5, .5, .9);
	}

	.onPopup {
		transform: translateZ(0);
	}

	/*遮罩层*/
	.modal-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #000;
		opacity: .8;
		z-index: 99;
	}

	/*弹窗头部*/
	.modal-header {
		margin: 2px 0;
		font-size: 16px;
		color: #666;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		line-height: 30px;
	}

	/*所在地区字样*/
	.modal-title {
		text-align: center;
		width: 100%;
	}

	/*关闭按钮*/
	.modal-close {
		width: 20px;
	}

	.modal-body {
		font-size: 14px;
	}

	/*每级地区标题*/
	.viewpager-title {
		padding: 0 10px;
		/*color: #f03118;*/
		line-height: 30px;
	}

	/*分隔线*/
	.viewpager-divider {
		width: 100%;
		height: 1px;
		background: #ccc;
	}

	/*左右滑动控件*/
	.swiper-area {
		height: 220px;
	}

	/*地址列表ListView容器*/
	.viewpager-listview {
		padding-top: 5px;
		height: 100%;
	}

	/*每行地址item项*/
	.viewpager-listview view {
		line-height: 30px;
		padding: 0 10px;
	}

	/*高亮当前所选地区*/
	.area-selected {
		color: red;
	}

	/*初始隐藏*/
	.hidden {
		display: none;
	}

	/*运行时显示*/
	.show {
		display: block;
	}
</style>
