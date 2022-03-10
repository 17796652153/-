<template>
	<view class="screen">
		<view class="screenItem" @click="selectScreen(0)"><text :class="0 == screenIdx ? 'activeScreen' : ''">附近商家</text></view>
		<view class="screenItem" @click="selectScreen(1)">
			<text :class="1 == screenIdx ? 'activeScreen' : ''">{{selectRegion || selectCity || '所在地区'}}</text>
			<image v-if="1 != screenIdx" src="../../static/icon_arrow_downGray.png" mode="aspectFill"></image>
			<image v-else src="../../static/icon_arrow_redUp.png" mode="aspectFill"></image>
			
			<view :class="showAddrMore ? 'hideScreenBox addrBox showAddrScreen' : 'hideScreenBox addrBox'">
				<scroll-view scroll-y="true" class="provinceScroll cityAggregate">
					<block v-if="province.length > 0">
						<view 
							:class="0 == provinceIdx ? 'activeProvince' : ''"
							@click.stop="provinceSelectAll">
							所有地区
						</view>
						<view 
							:class="Number(index) + 1 == provinceIdx ? 'activeProvince' : ''" 
							v-for="(item,index) in province" 
							:key="index" 
							@click.stop="provinceTapped(index)">
							{{item}}
						</view>
					</block>
				</scroll-view>
				<scroll-view scroll-y="true" class="cityScroll cityAggregate">
					<block v-if="city.length > 0">
						<view class="" @click.stop="citySelectAll">
							所有地区
						</view>
						<view class="" v-for="(item,index) in city" :key="index" @click.stop="cityTapped(index)">
							{{item}}
						</view>
					</block>
				</scroll-view>
				<scroll-view scroll-y="true" class="regionScroll cityAggregate">
					<block v-if="region.length > 0">
						<view class="" @click.stop="regionSelectAll">
							所有地区
						</view>
						<view class="" v-for="(item,index) in region" :key="index" @click.stop="regionTapped(index)">
							{{item}}
						</view>
					</block>
				</scroll-view>
			</view>
		</view>
		<view class="screenItem" @click="selectScreen(2)">
			<text :class="2 == screenIdx ? 'activeScreen' : ''">{{screenSortIdx ? soltArr[screenSortIdx] : '综合排序'}}</text>
			<image v-if="2 != screenIdx" src="../../static/icon_arrow_downGray.png" mode="aspectFill"></image>
			<image v-else src="../../static/icon_arrow_redUp.png" mode="aspectFill"></image>
			
			<view :class="showSoltMore ? 'hideScreenBox slotBox showSoltScreen' : 'hideScreenBox slotBox'">
				<view 
					:class="index == screenSortIdx ? 'hideScreenContent activeHideContent' : 'hideScreenContent'" 
					v-for="(item,index) in soltArr" 
					:key="index"
					@click.native.stop="sortScreen(index)">
					{{item}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		name: 'screenConditions',
		data(){
			return {
				showSoltMore: false, // 筛选条件
				showAddrMore: false, // 筛选条件
				
				province: [], // 省份名称列表
				provinceObjects: [], // 省份列表
				city: [], // 城市名称列表
				cityObjects: [], // 城市列表
				region: [], // 区名称列表
				regionObjects: [], // 区列表
				provinceIdx: null, // 选中的省份
				cityIdx: null, // 选中的城市
				selectProvince: '', // 选择的省份
				selectCity: '', // 选择的城市
				selectRegion: '', // 选中的区域
				
				screenSortIdx: null, // 选中的筛选
				soltArr: ['销量', '价格从高到低' ,'价格从低到高'],
			}
		},
		methods:{
			// 点击切换筛选条件
			selectScreen(idx) {
				if(idx == 1){
					this.screenIdx = idx;
					this.showAddrMore = !this.showAddrMore;
					this.showSoltMore = false;
					if(this.showAddrMore && this.provinceObjects.length <= 0){
						let that = this;
						this.getArea(100000, function(area) {
							var array = [];
							for (var i = 0; i < area.length; i++) {
								array[i] = area[i].name;
							}
							that.province = array;
							that.provinceObjects = area;
						});
					}
				}else if(idx == 2){
					this.showSoltMore = !this.showSoltMore;
					console.log('showSoltMore', this.showSoltMore)
					this.showAddrMore = false;
				}else{
					
				}
			},
			
			// 获取省份列表
			getArea: function(pid, cb) {
				var that = this;
				http.postJSON('api/Index/queryAddress',{
					pid: pid
				}, function(res) {
					cb(res.data);
				})
			},
			
			// 省选择 -- 所有地区
			provinceSelectAll(){
				this.provinceIdx = 0;
				this.selectCity = 0;
				this.selectProvince = 0;
				this.showAddrMore = false;
			},
			
			// 省选择
			provinceTapped(index){
				this.provinceIdx = Number(index) + 1;
				this.selectProvince = this.province[index];
				var that = this;
				// provinceObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
				// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
				this.getArea(this.provinceObjects[index].id, function(area) {
					var array = [];
					for (var i = 0; i < area.length; i++) {
						array[i] = area[i].name;
					}
					// city就是wxml中渲染要用到的城市数据，cityObjects是LeanCloud对象，用于县级标识取值
					that.city = array;
					that.cityObjects = area;
				});
			},
			
			// 市选择 -- 所有城市
			citySelectAll(){
				this.selectCity = 0;
				this.showAddrMore = false;
			},
			
			// 市选择
			cityTapped(index){
				console.log(this.cityObjects[index].name,' 点击选择的城市');
				this.selectCity = this.city[index];
				this.showAddrMore = false;
			},
			
			// 排序选择
			sortScreen(index, event){
				console.log('index',index);
				this.screenSortIdx = index;
				this.showSoltMore = false;
			},
		},
	}
</script>

<style>
	.screen {
		display: flex;
		align-items: center;
	}
	
	.screen .screenItem {
		flex: 1;
		height: 68rpx;
		text-align: center;
		line-height: 68rpx;
		font-size: 28rpx;
		color: #999;
		position: relative;
		margin-bottom: 20rpx;
	}
	
	.screen .screenItem .activeScreen {
		color: #FF2D2D;
	}
	
	.screen .screenItem image{
		width: 28rpx;
		height: 28rpx;
		margin-left: 20rpx;
		vertical-align: middle;
	}
	
	.hideScreenBox{
		position: absolute;
		top: 68rpx;
		z-index: 99;
		overflow: hidden;
		transition: all 0.3s;
	}
	
	.hideScreenBox .hideScreenContent{
		width: 750rpx;
		height: 84rpx;
		background: #f5f5f5;
		color: #333;
		font-size: 28rpx;
		text-align: center;
		line-height: 84rpx;
	}
	
	.hideScreenBox .activeHideContent{
		background-color: #fff;
	}
	
	.slotBox{
		height: 0;
		left: -500rpx;
	}
	
	.showSoltScreen{
		height: 252rpx;
	}
	
	.addrBox{
		height: 0;
		width: 750rpx;
		left: -250rpx;
		display: flex;
	}
	
	.cityAggregate{
		height: 588rpx;
		overflow: hidden;
	}
	
	.cityAggregate view{
		/* height: 84rpx; */
		padding: 28rpx 0;
		line-height: 40rpx;
	}
	
	.provinceScroll{
		flex: 2;
		background-color: #F5F5F5;
	}
	
	.provinceScroll .activeProvince{
		background-color: #fff;
	}
	
	.cityScroll{
		flex: 8;
		background-color: #fff;
	}
	
	.cityScroll view{
		text-align: left;
		padding-left: 30rpx;
	}
	
	.showAddrScreen{
		height: 588rpx;
	}
	
</style>
