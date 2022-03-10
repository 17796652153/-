<template>
	<view :class="showAllNav ? 'root' : ''">
		<!-- 头部 -->
		<view class="header">
			<view class="search">
				<image src="../../static/icon_search-red.png" mode=""></image>
				<!-- <text>输入商品名称</text> -->
				<input type="text" v-model="name" placeholder="输入工厂名称" @confirm="searchFactory"/>
			</view>
			<view class="settled" @click="jumpSettled" v-if="userInfo.is_store != 1">
				<text>商家入驻</text>
				<image src="../../static/icon_arrow-right2.png" mode=""></image>
			</view>
		</view>
		<!-- header导航 -->
		<view class="headerNav">
			<scroll-view class="scrollView" scroll-x="true" enable-flex="true">
				<view class="headerNavItem">
					<view :class="headNavOut == 0 && headNavWithin == 0 ? 'activeHeader headerType' : 'headerType'" @click="selectHeadNav(0,0)">
						<view class="typeImg">
							<image class="pic" src="../../static/headerNav5.png" mode=""></image>
						</view>
						<text>推荐工厂</text>
					</view>
				</view>
				<view class="headerNavItem" v-for="(item, index) in headerNav"
				 :key="index">
					<view 
						:class="headNavOut == index + 1 && headNavWithin == idx + 1 ? 'activeHeader headerType' : 'headerType'" 
						v-for="(val,idx) in item.children" 
						:key="idx" 
						@click="selectHeadNav(index + 1,idx + 1)"
					>
						<view class="typeImg">
							<image class="pic" :src="www + val.img" mode=""></image>
						</view>
						<text>{{val.title}}</text>
					</view>
				</view>
			</scroll-view>
			<view class="headerNavImg" @click="clickMoreNav">
				{{showAllNav ? '收起' : '全部'}}
			</view>
		</view>
		<!-- 所有的headerNav导航 -->
		<view class="allNav" v-if="showAllNav">
			<scroll-view scroll-y="true">
				<view class="allNavList">
					<view class="allNavItem" v-for="(item,index) in headerNav" :key="index">
						<view class="allFactory">
							<view class="factoryTitle">
								{{item.title}}
							</view>
							<view class="factoryContent">
								<view class="factoryItem baseflex" v-for="(val,idx) in item.children" :key="idx" @click="selectHeadNav(index + 1,idx + 1)">
									<image :src="www + val.img" mode=""></image>
									<text>{{val.title}}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 首页商品列表 -->
		<view class="homeGoods">
			<!-- 筛选条件 -->
			<view class="screen">
				<view class="screenItem" @click="selectScreen(0)"><text :class="0 == screenIdx ? 'activeScreen' : ''">附近商家</text></view>
				<view class="screenItem" @click="selectScreen(1)">
					<text :class="1 == screenIdx ? 'activeScreen' : ''">{{selectCity || '所在地区'}}</text>
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
			
			<view class="factoryMain" v-if="factoryList.length > 0">
				<view class="goods" v-for="(item,index) in factoryList" :key="index" @click="jumpFactoryDetail(item.id)">
					<view class="shopGoods">
						<view class="goodsImg">
							<image class="pic" :src="www + item.icon" mode=""></image>
						</view>
						<view class="manufactor">
							<view class="manufactorName singleHide">
								{{item.factory_name}}
							</view>
							<view class="range">
								主营：{{item.main_factory}}
							</view>
							<view class="advantage">
								<text v-if="item.min_goods">{{item.min_goods}}</text>
								<text>{{item.is_open == 1 ? '可出样品' : '不可出样品'}}</text>
							</view>
							<view class="goodsAddr multiHide">
								<view class="singleHide">{{item.address}}</view>
								<view class="singleHide">据您{{Number(item.geo).toFixed(2)}}km<image src="../../static/icon_location.png" mode=""></image></view>
								
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="goodsNull" v-else>
				暂无工厂
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return{
				showSoltMore: false, // 筛选条件
				showAddrMore: false, // 筛选条件
				
				
				www: http.rootDocument, // 根路径
				headerNav: [],
				headNavOut: 0, // 选中的headnav 外部导航
				headNavWithin: 0, // 选中的headNav 内部导航
				screenIdx: 0, // 选中的筛选索引
				showAllNav: false, // 显示所有的
				animationData: {}, // 动画 翻转
				
				name: '', // 工厂名称
				
				cate_one: 0, // 一级分类id
				cate_two: 0, // 二级分类id
				
				factoryList: [], // 工厂列表
				page: 1, // 当前页
				last_page: 1, // 最后一页
				total: 0, // 总条数
				
				currentCity: '', // 城市
				lng: '',
				lat: '',
				
				userInfo: {},
				
				province: [], // 省份名称列表
				provinceObjects: [], // 省份列表
				city: [],
				cityObjects: [], // 城市列表
				provinceIdx: null, // 选中的省份
				selectProvince: '', // 选择的省份
				selectCity: '', // 选择的城市
				
				screenSortIdx: null, // 选中的筛选
				soltArr: ['默认', '支持打样' ,'支持外贸','支持一件代发','支持代加工'], // 
			}
		},
		onLoad() {
			this.currentCity = uni.getStorageSync('currentCity')
			this.lng = uni.getStorageSync('longitude');
			this.lat = uni.getStorageSync('latitude');
			
			this.getFactoryCategory();
			this.getFactoryList();
		},
		onShow() {
			let utoken = uni.getStorageSync('utoken');
			if(utoken){
				this.getUserInfo();
			}
		},
		methods:{
			// 获取产地工厂分类
			getFactoryCategory(){
				let that = this;
				http.postJSON('api/index/queryCateList',{},function(res){
					// console.log(res,'工厂分类');
					that.headerNav = res.data
				})
			},
			
			// 获取工厂列表
			getFactoryList(){
				let that = this;
				
				let data = {};
				let sort = 0;
				let type = parseInt(this.screenIdx) + 1;
				if(this.screenSortIdx != null){
					sort = Number(this.screenSortIdx);
				}
				let province = this.selectProvince || 0;
				let city = this.selectCity || 0;
				
				if(type == 1){
					data = {
						type: type,
						lng: this.lng,
						lat: this.lat,
						cate_one: this.cate_one,
						cate_two: this.cate_two,
						name: this.name.trim(),
						page: this.page,
						sort: sort
					}
				}else if(type == 2){
					data = {
						type: type,
						cate_one: this.cate_one,
						cate_two: this.cate_two,
						name: this.name.trim(),
						type: type,
						province: province,
						city: city,
						page: this.page,
						sort: sort
					}
				}else if(type == 3){
					data = {
						type: type,
						cate_one: this.cate_one,
						cate_two: this.cate_two,
						name: this.name.trim(),
						page: this.page,
						province: province,
						city: city,
						sort: sort
					}
				}
				uni.showLoading()
				http.postJSON('api/index/queryFactoryList',data,function(res){
					// console.log(res,'工厂列表');
					uni.hideLoading()
					if(res.code == 200){
						that.factoryList = that.factoryList.concat(res.data.data);
						that.page = res.data.current_page;
						that.total = res.data.total;
						that.last_page = res.data.last_page;
					}
				})
			},
			
			// 搜索工厂
			searchFactory(){
				this.factoryList = [];
				this.page = 1;
				this.getFactoryList();
			},
			
			// 获取用户信息
			getUserInfo(){
				let that = this;
				http.postJSON('api/User/getUserInfo',{},function(res){
					console.log(res,'用户信息');
					that.userInfo = res.data
				})
			},
			
			
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
					this.showAddrMore = false;
				}else{
					this.screenIdx = idx;
					this.factoryList = [];
					this.page = 1;
					this.getFactoryList();
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
				
				this.factoryList = [];
				this.page = 1;
				this.getFactoryList();
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
				
				this.factoryList = [];
				this.page = 1;
				this.getFactoryList();
			},
			
			// 市选择
			cityTapped(index){
				console.log(this.cityObjects[index].name,' 点击选择的城市');
				this.selectCity = this.city[index];
				this.showAddrMore = false;
				
				this.factoryList = [];
				this.page = 1;
				this.getFactoryList();
			},
			
			// 排序选择
			sortScreen(index, event){
				console.log('index',index);
				this.screenSortIdx = index;
				this.showSoltMore = false;
				this.factoryList = [];
				this.page = 1;
				this.getFactoryList();
			},
			
			// 点击切换headNav导航
			selectHeadNav(index,idx) {
				this.headNavOut = index;
				this.headNavWithin = idx;
				this.showAllNav = false;
				
				if(index == 0){
					this.cate_one = 0;
					this.cate_two = 0;
				}else{
					this.cate_one = this.headerNav[parseInt(index-1)].id;
					this.cate_two = this.headerNav[parseInt(index-1)].children[parseInt(idx - 1)].id;
				}
								
				this.page = 1;
				this.factoryList = [];
				this.getFactoryList();
			},
			
			// 点击所有的导航
			clickMoreNav() {
				this.showAllNav = !this.showAllNav;
			
				var animation = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				this.animation = animation
				if (this.showAllNav) {
					this.animation.rotate(180).step()
				} else {
					this.animation.rotate(0).step()
				}
			
				this.animationData = this.animation.export()
			},
		
			// 点击跳转工厂详情
			jumpFactoryDetail(id){
				uni.navigateTo({
					url: "./factoryDetail?id=" + id
				})
			},
			
			// 跳转商家入驻
			jumpSettled(){
				let utoken = uni.getStorageSync('utoken');
				if(!utoken){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},1000)
					return
				};
				uni.navigateTo({
					url: "../merchant/merchantSettled"
				})
			},
		},
		onReachBottom(){
			console.log('触底了');
			if(this.page < this.last_page){
				this.page ++;
				this.getFactoryCategory();
				this.getFactoryList();
			}else{
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
		onPullDownRefresh(){
			console.log('下拉刷新了');
			this.page = 1;
			this.headerNav = [];
			this.factoryList = [];
			this.getFactoryCategory();
			this.getFactoryList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	.root {
		position: fixed;
		top: 0;
		height: 100%;
		overflow: hidden;
	}
	
	.header {
		width: 100%;
		height: 104rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
	
		.search {
			width: 100%;
			height: 64rpx;
			background: #ffffff;
			border: 2rpx solid #ff2d2d;
			border-radius: 34rpx;
			display: flex;
			align-items: center;
	
			image {
				width: 40rpx;
				height: 40rpx;
				margin: 0 20rpx;
			}
	
			text {
				color: #ccc;
				font-size: 28rpx;
			}
		}
	
		.settled {
			width: 184rpx;
			height: 64rpx;
			background: linear-gradient(70deg, #ff8d4d 0%, #ee2b00 100%);
			border-radius: 10rpx;
			display: flex;
			align-items: center;
			flex-shrink: 0;
			margin-left: 20rpx;
	
			text {
				font-size: 28rpx;
				color: #fff;
				margin: 0 12rpx 0 20rpx;
			}
	
			image {
				width: 28rpx;
				height: 28rpx;
			}
		}
	}

	.headerNav {
		width: 750rpx;
		height: 132rpx;
		position: relative;
		overflow: hidden;
	
		.scrollView {
			width: 750rpx;
			height: 132rpx;
			display: flex;
			padding-right: 72rpx;
			white-space: nowrap;
	
			view {
				flex-shrink: 0;
			}
	
			.headerNavItem {
				// padding: 20rpx;
				min-width: 136rpx;
				font-size: 24rpx;
				color: #333;
				display: flex;
				.headerType{
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 20rpx;
					min-width: 136rpx;
					.typeImg{
						width: 72rpx;
						height: 72rpx;
						overflow: hidden;
						border-radius: 50%;
						position: relative;
						image{
							width: 56rpx;
							height: 56rpx;
							position: absolute;
							left: 50%;
							top: 50%;
							transform: translateX(-50%) translateY(-50%);
							z-index: 1;
							border-radius: 50%;
						}
					}
					text{
						font-size: 24rpx;
						color: #333;
						
					}
				}
				.activeHeader{
					.typeImg{
						&::after{
							content: "";
							position: absolute;
							left: 0;
							height: 0;
							width: 72rpx;
							height: 72rpx;
							background: linear-gradient(180deg,rgba(255,160,160,0.15), #ffa0a0 100%);
						}
					}
					text{
						color: #FF2D2D;
					}
				}
			}
	
			.headerNavItem:last-child {
				padding-right: 72rpx;
			}
	
			.activeHeadItem {
				color: #FF2D2D;
	
				text {
					position: relative;
	
					&::after {
						content: "";
						position: absolute;
						width: 44rpx;
						height: 4rpx;
						background: #ff2d2d;
						border-radius: 2rpx;
						display: inline-block;
						left: 50%;
						bottom: -8rpx;
						transform: translateX(-50%);
					}
				}
	
			}
	
		}
	
		.headerNavImg {
			width: 50rpx;
			height: 132rpx;
			background: #ffffff;
			box-shadow: 2rpx 0rpx 12rpx 4rpx rgba(0, 0, 0, 0.41);
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			right: 0;
			top: 0;
			z-index: 2;
			text-align: center;
			writing-mode: vertical-rl;
		}
	}
	
	.allNav {
		width: 100%;
		height: calc(100% - 236rpx);
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 99;
		background-color: #fff;
	
		scroll-view {
			width: 100%;
			height: 100%;
			padding: 20rpx 0;
	
			.allNavList {
				padding: 0 30rpx;
				.factoryTitle{
					font-size: 28rpx;
					color: #000;
					margin: 20rpx 0;
				}
				.factoryContent{
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					.factoryItem{
						flex-direction: column;
						justify-content: center;
						width: 138rpx;
						height: 132rpx;
						
						image {
							width: 72rpx;
							height: 72rpx;
							margin-bottom: 12rpx;
							border-radius: 50%;
						}
						
						text {
							color: #333;
							font-size: 24rpx;
						}
					}
				}
			}
		}
	}
	
	.screen {
		margin-top: 20rpx;
		display: flex;
		align-items: center;
	
		.screenItem {
			flex: 1;
			height: 68rpx;
			text-align: center;
			line-height: 68rpx;
			font-size: 28rpx;
			color: #999;
			position: relative;
			margin-bottom: 20rpx;
	
			.activeScreen {
				color: #FF2D2D;
	
				// &::after {
				// 	content: "";
				// 	position: absolute;
				// 	bottom: 4rpx;
				// 	left: 50%;
				// 	transform: translateX(-50%);
				// 	width: 100rpx;
				// 	height: 4rpx;
				// 	background: #ff2d2d;
				// 	border-radius: 2rpx;
				// }
			}
			
			image{
				width: 28rpx;
				height: 28rpx;
				margin-left: 20rpx;
				vertical-align: middle;
			}
		}
	}
	
	.hideScreenBox{
		position: absolute;
		top: 68rpx;
		z-index: 99;
		overflow: hidden;
		transition: all 0.3s;
		
		.hideScreenContent{
			width: 750rpx;
			height: 84rpx;
			background: #f5f5f5;
			color: #333;
			font-size: 28rpx;
			text-align: center;
			line-height: 84rpx;
		}
		
		.activeHideContent{
			background-color: #fff;
		}
	}
	
	.slotBox{
		height: 0;
		left: -500rpx;
	}
	
	.showSoltScreen{
		height: 426rpx;
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
		
		view{
			// height: 84rpx;
			padding: 28rpx 0;
			line-height: 40rpx;
		}
	}
	
	.provinceScroll{
		flex: 2;
		background-color: #F5F5F5;
		
		.activeProvince{
			background-color: #fff;
		}
	}
	
	.cityScroll{
		flex: 8;
		background-color: #fff;
		view{
			text-align: left;
			padding-left: 30rpx;
		}
	}
	
	.showAddrScreen{
		height: 588rpx;
	}
	
	.goods {
		padding: 0 30rpx 0;
		border-bottom: 4rpx solid #EBEBEB;
	}
	
	.shopGoods {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
	
		.goodsImg {
			width: 200rpx;
			height: 200rpx;
			border-radius: 8rpx;
			overflow: hidden;
			margin-right: 20rpx;
		}
	
		.goodsInfo {
			width: 418rpx;
	
			.goodsName {
				width: 420rpx;
				height: 70rpx;
				font-size: 28rpx;
				color: #333333;
			}
	
			.goodsSpec {
				height: 44rpx;
				line-height: 44rpx;
				background: #f5f5f5;
				border-radius: 4rpx;
				color: #999;
				font-size: 28rpx;
				position: relative;
				padding-right: 42rpx;
				padding-left: 12rpx;
				margin-top: 12rpx;
	
				text {
					margin-right: 20rpx;
				}
	
				image {
					width: 20rpx;
					height: 20rpx;
					position: absolute;
					right: 18rpx;
					top: 50%;
					transform: translateY(-50%);
				}
			}
	
			.goodsOperation {
				margin-top: 32rpx;
	
				.goodsPrice {
					font-size: 20rpx;
					color: #FF2D2D;
	
					text {
						font-size: 32rpx;
					}
				}
			}
		}
	
		.manufactor {
			width: 460rpx;
	
			.manufactorName {
				width: 420rpx;
				font-size: 36rpx;
				color: #333333;
			}
	
			.range {
				color: #28C50F;
				font-size: 28rpx;
				margin: 10rpx 0 26rpx;
			}
	
			.advantage {
				color: #333;
				font-size: 28rpx;
				text {
					margin-right: 20rpx;
				}
			}
	
			.goodsAddr {
				color: #999;
				font-size: 28rpx;
				max-height: 84rpx;
	
				view {
					max-width: 460rpx;
					margin-right: 20rpx;
					vertical-align: middle;
				}
	
				image {
					width: 28rpx;
					height: 28rpx;
					vertical-align: middle;
				}
			}
		}
	}
</style>
