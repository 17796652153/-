<template>
	<view :class="showAllNav ? 'root' : ''">
		<!-- 头部 -->
		<headerSearch
			:searchTxt="'请输入信息服务'"
			:showInput="true"
			:operationTxt="'商家入驻'"
			:operationMore="true"
			:showOperation="userInfo.is_store != 1"
			@jumpSettled="jumpSettled"
			@searchValue="search"
		></headerSearch>
		<!-- header导航 -->
		<view class="headerNav">
			<scroll-view class="scrollView" scroll-x="true" enable-flex="true">
				<view :class="headNav == 0 ? 'activeHeadItem headerNavItem' : 'headerNavItem'" @click="selectHeadNav(0)"><text>热门</text></view>
				<view :class="headNav == index + 1 ? 'activeHeadItem headerNavItem' : 'headerNavItem'" v-for="(item, index) in headerNav"
				 :key="index" @click="selectHeadNav(index + 1)">
					<text>{{item.title}}</text>
				</view>
	
			</scroll-view>
			<view class="headerNavImg" @click="clickMoreNav">
				<image :animation="animationData" src="../../static/icon_arrow-down.png" mode=""></image>
			</view>
		</view>
		<!-- 所有的headerNav导航 -->
		<view class="allNav" v-if="showAllNav">
			<scroll-view scroll-y="true">
				<view class="allNavList">
					<view class="allNavItem baseflex" v-for="(item,index) in headerNav" :key="index" @click="selectHeadNav(index)">
						<image :src="www + item.img" mode=""></image>
						<text>{{item.title}}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- banner轮播 -->
		<swiper :indicator-dots="bannerList.length > 1" :autoplay="true" :interval="3000" :duration="1000">
			<swiper-item v-for="(item,index) in bannerList" :key="index">
				<view class="swiper-item">
					<image class="pic" :src="www + item.banner_img" mode="aspectFill"></image>
				</view>
			</swiper-item>
		</swiper>
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
			
			<!-- 信息服务列表 -->
			<view class="wantBuyMain" v-if="hallList.length > 0">
				<view class="wantBuy" v-for="(item,index) in hallList" :key="index">
					<view class="wantBuyContent baseflex" @click="seeRepairDetail(item.id)">
						<swiper class="wantBuyImg" :circular="true" :indicator-dots="item.imageList.length > 1">
							<swiper-item v-for="(val,idx) in item.imageList" :key="idx">
								<view class="swiper-item"><image class="pic" :src="www + val" mode="aspectFill"></image></view>
							</swiper-item>
						</swiper>
						<view class="wantBuyInfo">
							<view class="baseflex">
								<view class="wantBuyUser">
									<view class="userImg">
										<image class="pic" :src="item.head_img" mode="aspectFill"></image>
									</view>
									<view class="userName singleHide">
										{{item.nick_name}}
									</view>
								</view>
								<view class="call">
									<image class="pic" src="../../static/icon_call.png" mode=""></image>
								</view>
							</view>
							<view class="describe multiHide">
								{{item.content}}
							</view>
							<view class="userAddress">
								<view class="addrImg">
									<image class="pic" src="../../static/icon_location.png" mode=""></image>
								</view>
								<view class="address multiHide">
									{{item.address}}
								</view>
							</view>
							
						</view>
					</view>
				</view>
			</view>
		
			<view class="wantBuyNull" v-else>
				<view class="repairNull">
					<image src="../../static/repairNull.png" mode=""></image>
					<view class="nullTips">
						大厅内暂无信息服务
					</view>
				</view>
			</view>
		</view>
		
		<!-- 发布 -->
		<view class="repairFixed" @click="repair">
			<image class="pic" src="../../static/release.png" mode=""></image>
		</view>
	</view>
</template>

<script>
	import headerSearch from "../../components/headerSearch/headerSearch.vue"
	import http from "@/utils/http.js"
	export default {
		components:{
			headerSearch
		},
		data(){
			return{
				showSoltMore: false, // 筛选条件
				showAddrMore: false, // 筛选条件
				
				
				headerNav: [],
				headNav: 0, // 选中的headnav导航
				screenIdx: 0, // 选中的筛选索引
				showAllNav: false, // 显示所有的
				animationData: {}, // 动画 翻转
				bannerList: [],
				cate_id: 0,
				title: '',
				
				userInfo: {},
				page: 1,
				last_page: 1,
				total: 0,
				hallList: [],
				www: http.rootDocument,
				hidePage: false, // 离开页面
				
				province: [], // 省份名称列表
				provinceObjects: [], // 省份列表
				city: [],
				cityObjects: [], // 城市列表
				provinceIdx: null, // 选中的省份
				selectProvince: '', // 选择的省份
				selectCity: '', // 选择的城市
				
				screenSortIdx: null, // 选中的筛选
				soltArr: ['默认', '最新'], // 
			}
		},
		onLoad() {
			this.getNavigateType()
			this.getBanner()
		},
		onShow() {
			let utoken = uni.getStorageSync('utoken');
			if(utoken){
				this.getUserInfo();
			}
			this.getHallList()
		},
		methods:{
			getBanner(){
				let that = this;
				http.postJSON('api/index/getBanner',{
					type: 4,
				},function(res){
					console.log(res,'查询轮播');
					that.bannerList = res.data;
				})
			},
			
			// 获取用户信息
			getUserInfo(){
				let that = this;
				http.postJSON('api/User/getUserInfo',{},function(res){
					console.log(res,'用户信息');
					that.userInfo = res.data
				})
			},
			
			// 获取类目
			getNavigateType(){
				let that = this;
				http.postJSON('api/message/queryCategoryList',{
					type: 1
				},function(res){
					console.log(res,'获取类目');
					that.headerNav = res.data;
				})
			},
			
			// 获取大厅数据
			getHallList(){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				let lat = uni.getStorageSync('latitude');
				let lng = uni.getStorageSync('longitude');
				
				let data = {};
				let sort = 0;
				if(this.screenSortIdx != null){
					sort = Number(this.screenSortIdx);
				}
				let province = this.selectProvince || 0;
				let city = this.selectCity || 0;
				
				let search = parseInt(this.screenIdx) + 1;
				if(search == 1){
					if(!lat){
						uni.showToast({
							title: '请先打开定位才能查看信息',
							icon: 'none'
						})
						return
					}
					data = {
						type: 1,
						search: search,
						lat: lat,
						lng: lng,
						page: this.page,
						title: this.title,
						cate_id: this.cate_id,
						sort: sort
					}
				}else if(search == 2){
					data = {
						type: 1,
						search: search,
						province: province,
						city: city,
						page: this.page,
						title: this.title,
						cate_id: this.cate_id,
						sort: sort
					}
				}else if(search == 3){
					data = {
						type: 1,
						search: search,
						page: this.page,
						title: this.title,
						cate_id: this.cate_id,
						province: province,
						city: city,
						sort: sort
					}
				}
				
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/message/queryMessageList',data,function(res){
					console.log(res,'大厅数据');
					uni.hideLoading()
					if(res.code != 200){
						return
					}
					that.hallList = that.hallList.concat(res.data.data);
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.total = res.data.total;
					
					that.hallList.forEach(item => {
						item.imageList = item.message_img.split(',')
					})
				})
			},
			
			
			search(data){
				console.log(data);
				this.title = data;
				this.page= 1;
				this.hallList = [];
				this.getHallList()
				uni.showToast({
					title: '搜索了' + data,
					icon: 'none'
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
					console.log('showSoltMore', this.showSoltMore)
					this.showAddrMore = false;
				}else{
					this.screenIdx = idx;
					this.page= 1;
					this.hallList = [];
					this.getHallList();
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
				
				this.page= 1;
				this.hallList = [];
				this.getHallList();
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
				
				this.page= 1;
				this.hallList = [];
				this.getHallList();
			},
			
			// 市选择
			cityTapped(index){
				console.log(this.cityObjects[index].name,' 点击选择的城市');
				this.selectCity = this.city[index];
				this.showAddrMore = false;
				
				this.page= 1;
				this.hallList = [];
				this.getHallList();
			},
			
			// 排序选择
			sortScreen(index, event){
				console.log('index',index);
				this.screenSortIdx = index;
				this.showSoltMore = false;
				this.page= 1;
				this.hallList = [];
				this.getHallList();
			},
			
			// 点击切换headNav导航
			selectHeadNav(idx) {
				this.headNav = idx;
				if(idx == 0){
					this.cate_id = 0
				}else{
					this.cate_id = this.headerNav[parseInt(idx) - 1].id
				}
				this.page= 1;
				this.hallList = [];
				this.getHallList();
				this.showAllNav = true;
				this.clickMoreNav()
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
			
			// 发布
			repair(){
				uni.navigateTo({
					url: "./repairServer"
				})
				this.page= 1;
				this.hallList = [];
			},
			
			// 查看信息服务详情
			seeRepairDetail(id){
				console.log('离开页面');
				this.hidePage = true;
				uni.navigateTo({
					url: './infoServerDetail?id=' + id
				})
			},
			
			// 跳转商家入驻
			jumpSettled(){
				console.log('离开页面');
				this.hidePage = true;
				uni.navigateTo({
					url: "../merchant/merchantSettled"
				})
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getHallList()
			} else {
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
		onPullDownRefresh() {
			console.log('下拉刷新了');
			this.page = 1;
			this.hallList = [];
			this.getHallList();
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
	
	.headerNav {
		width: 750rpx;
		height: 72rpx;
		position: relative;
		overflow: hidden;
	
		.scrollView {
			width: 750rpx;
			height: 72rpx;
			display: flex;
			padding-right: 72rpx;
			white-space: nowrap;
	
			view {
				flex-shrink: 0;
			}
	
			.headerNavItem {
				padding: 20rpx;
				min-width: 56rpx;
				font-size: 28rpx;
				color: #333;
				display: inline-block;
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
			width: 60rpx;
			height: 72rpx;
			background: #ffffff;
			box-shadow: 2rpx 0rpx 12rpx 4rpx rgba(0, 0, 0, 0.41);
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			right: 0;
			top: 0;
	
			image {
				width: 28rpx;
				height: 28rpx;
			}
		}
	}
	
	.allNav {
		width: 100%;
		height: calc(100% - 176rpx);
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
				display: flex;
				align-items: center;
				flex-wrap: wrap;
	
				.allNavItem {
					flex-direction: column;
					justify-content: center;
					width: 20%;
					height: 132rpx;
	
					image {
						width: 72rpx;
						height: 72rpx;
						margin-bottom: 12rpx;
					}
	
					text {
						color: #333;
						font-size: 24rpx;
					}
				}
			}
		}
	}
	
	swiper {
		height: 352rpx;
	
		.swiper-item {
			width: 100%;
			height: 352rpx;
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
		z-index: 98;
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
	
	.wantBuyMain{
		padding: 20rpx 30rpx;
	}
	
	.wantBuy{
		width: 690rpx;
		background: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0rpx 0rpx 12rpx 0rpx rgba(0,0,0,0.10); 
		padding: 20rpx;
		margin-bottom: 20rpx;
		.wantBuyImg{
			width: 300rpx;
			height: 300rpx;
			flex-shrink: 0;
			border-radius: 20rpx;
			overflow: hidden;
			margin-right: 20rpx;
			swiper-item{
				width: 100%;
				height: 100%;
				.swiper-item{
					width: 100%;
					height: 100%;
				}
			}
		}
		.wantBuyInfo{
			flex-shrink: 0;
			.wantBuyUser{
				display: flex;
				align-items: center;
				margin: 20rpx 0;
				.userImg{
					width: 68rpx;
					height: 68rpx;
					overflow: hidden;
					border-radius: 50%;
					margin-right: 20rpx;
				}
				.userName{
					font-size: 36rpx;
					color: #333;
					max-width: 180rpx;
				}
				
			}
			.call{
				width: 32rpx;
				height: 32rpx;
			}
			.describe{
				font-size: 28rpx;
				color: #333;
				margin-bottom: 30rpx;
				width: 336rpx;
				height: 76rpx;
			}
			.userAddress{
				display: flex;
				.addrImg{
					width: 28rpx;
					height: 28rpx;
					margin-right: 20rpx;
				}
				.address{
					font-size: 28rpx;
					color: #333;
					width: 280rpx;
					height: 80rpx;
				}
			}
		}
		.wantBuyOperation{
			display: flex;
			align-items: center;
			justify-content: flex-end;
			font-size: 24rpx;
			margin-top: 20rpx;
			.del{
				color: #999;
				margin-right: 10rpx;
			}
			.edit{
				color: #FF2D2D;
			}
		}
	}
	
	.repairNull{
		margin: 80rpx auto;
		text-align: center;
		image{
			width: 600rpx;
			height: 600rpx;
		}
		.nullTips{
			font-size: 36rpx;
			color: #999;
			text-align: center;
		}
	}

	.repairFixed{
		width: 100rpx;
		height: 100rpx;
		position: fixed;
		right: 30rpx;
		bottom: 80rpx;
	}
</style>
