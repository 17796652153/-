<template>
	<view class="">
		<view class="headNavigation">
			<view :class="activeTab == 0 ? 'navItem activeNav' : 'navItem'" @click="changeNav(0)">店铺</view>
			<view :class="activeTab == 1 ? 'navItem activeNav' : 'navItem'" @click="changeNav(1)">工厂</view>
		</view>
		
		<view class="" v-if="activeTab == 0">
			<view class="" v-if="merchantList.length > 0">
				<view class="shopFollow" v-for="(item,index) in merchantList" :key="index">
					<view class="headerShop baseflex" @click="jumpShophome(item.data.id)">
						<view class="shopDetail">
							<view class="shopImg">
								<image class="pic" :src="www + item.data.store_logo" mode=""></image>
							</view>
							<view class="shopInfo">
								<view class="shopName">
									{{item.data.store_name}}
								</view>
							</view>
						</view>
						<view class="shopMore">
							<image class="pic" src="../../static/icon_arrow-right.png" mode=""></image>
						</view>
					</view>
					<view class="btmGoods" @click="jumpGoodsDetail(item.goods.id)">
						<view class="goodsImg">
							<image class="pic" :src="www + item.goods.goods_icon" mode=""></image>
						</view>
						<view class="goodsInfo">
							<view class="goodsName multiHide">
								{{item.goods.goods_name}}
							</view>
							<view class="goodsStatus">
								{{item.goods.goods_des_title}}
							</view>
							<view class="goodsPrice">
								￥<text>{{item.goods.goods_price}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="goodsNull" v-else>
				暂无工厂收藏
			</view>
		</view>
		
		<view class="" v-if="activeTab == 1">
			<view class="goodsContent" v-if="factoryList.length > 0">
				<view class="shopGoods" v-for="(item,index) in factoryList" :key="index" @click="jumpFactoryDetail(item.data.id)">
					<view class="goodsImg">
						<image class="pic" :src="www + item.data.icon" mode=""></image>
					</view>
					<view class="manufactor">
						<view class="manufactorName singleHide">
							{{item.data.factory_name}}
						</view>
						<view class="range">
							主营：{{item.data.main_factory}}
						</view>
						<view class="advantage">
							<text v-if="item.data.min_goods">{{item.data.min_goods}}</text>
							<text>{{item.data.is_open == 1 ? '可出样品' : '不可出样品'}}</text>
						</view>
						<view class="goodsAddr multiHide">
							<text class="singleHide">{{item.data.address}}</text>
							<text class="singleHide">据您{{Number(item.data.geo).toFixed(2)}}km</text>
							<image src="../../static/icon_location.png" mode=""></image>
						</view>
					</view>
				</view>
			</view>
			<view class="goodsNull" v-else>
				暂无工厂收藏
			</view>
		</view>
		
		<!-- 返回顶部 -->
		<view class="goTop" v-if="showGoTop" @click="goTop">
			<image class="pic" src="../../static/go_top.png" mode=""></image>
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	export default {
		data(){
			return {
				showGoTop: false, // 显示返回顶部按钮
				activeTab: 0,
				www: http.rootDocument,
				page: 1,
				last_page: 1,
				factoryTotal: 0,
				merchantTotal: 0,
				
				factoryList: [],
				merchantList: [],
				
				hidePage: false, // 离开页面
			}
		},
		onShow() {
			if(this.activeTab == 0){
				this.getFollowMerchant()
			}else{
				this.getFollowFactory()
			}
		},
		methods:{
			// 获取商家关注
			getFollowMerchant(){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				http.postJSON('api/user/getUserLike',{
					type: 2,
					page: this.page
				},function(res){
					if(res.code != 200){
						uni.showToast({
							title: res.msg,
							icon: 'none',
							duration: 2000
						})
						setTimeout(function(){
							uni.navigateBack()
						},800)
						return
					}
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.merchantTotal = res.data.total;
					
					that.merchantList = that.merchantList.concat(res.data.data);
				})
			},
			
			
			// 获取工厂关注
			getFollowFactory(){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				let lng = uni.getStorageSync('longitude');
				let lat = uni.getStorageSync('latitude');
				http.postJSON('api/user/getUserLike',{
					type: 3,
					lat: lat,
					lng: lng,
					page: this.page
				},function(res){
					if(res.code != 200){
						uni.showToast({
							title: res.msg,
							icon: 'none',
							duration: 2000
						})
						setTimeout(function(){
							uni.navigateBack()
						},800)
						return
					}
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.factoryTotal = res.data.total;
					
					that.factoryList = that.factoryList.concat(res.data.data);
				})
			},
			
			
			// 返回顶部
			goTop(){
				uni.pageScrollTo({
				    scrollTop: 0,
				    duration: 300,
				});
			},
			
			// 跳转商品详情
			jumpGoodsDetail(id){
				uni.navigateTo({
					url: "../goods/details?id=" + id
				})
			},
			
			// 跳转店铺首页
			jumpShophome(id){
				uni.navigateTo({
					url: "../shophome/shophome?store_id=" + id
				})
			},
			
			// 跳转工厂详情
			jumpFactoryDetail(id){
				uni.navigateTo({
					url: '../factory/factoryDetail?id=' + id
				})
			},
			
			// 切换头部
			changeNav(idx){
				this.activeTab = idx;
				this.page = 1;
				if(this.activeTab == 0){
					this.factoryList = [];
					this.getFollowMerchant()
				}else{
					this.merchantList = [];
					this.getFollowFactory()
				}
			},
		},
		onHide() {
			console.log('离开页面');
			this.hidePage = true;
		},
		onPageScroll(res){
			//获取距离顶部距离
			const scrollTop = res.scrollTop;
			// 获取屏幕宽高
			const { windowWidth, windowHeight,statusBarHeight } = uni.getSystemInfoSync();	
			if(scrollTop >= 300){
				this.showGoTop = true
			}else{
				this.showGoTop = false
			}
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				if(this.activeTab == 0){
					this.merchantList = [];
					this.getFollowMerchant()
				}else{
					this.factoryList = [];
					this.getFollowFactory()
				}
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
			if(this.activeTab == 0){
				this.merchantList = [];
				this.getFollowMerchant()
			}else{
				this.factoryList = [];
				this.getFollowFactory()
			}
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.headNavigation {
		width: 750rpx;
		height: 92rpx;
		opacity: 1;
		background: #FFEBEB;
		display: flex;
	}
	
	.navItem {
		width: 50%;
		text-align: center;
		line-height: 92rpx;
		color: #999;
		font-size: 32rpx;
		position: relative;
	}
	
	.activeNav {
		color: #FF2D2D;
	}
	
	.activeNav::after {
		content: "";
		width: 32rpx;
		height: 8rpx;
		opacity: 1;
		background: #FF2D2D;
		border-radius: 12rpx;
		position: absolute;
		left: 50%;
		bottom: 8rpx;
		transform: translateX(-50%);
	}
	
	.shopFollow{
		padding: 20rpx 30rpx;
		background-color: #fff;
	}
	.shopDetail{
		display: flex;
		align-items: center;
		.shopImg{
			width: 72rpx;
			height: 72rpx;
			margin-right: 20rpx;
			border-radius: 50%;
		}
		.shopInfo{
			.shopName{
				color: #333;
				font-size: 32rpx;
			}
			.shopActivity{
				color: #999;
				font-size: 24rpx;
			}
		}
	}
	.shopMore{
		width: 28rpx;
		height: 28rpx;
	}

	.btmGoods{
		display: flex;
		margin-top: 20rpx;
		
		.goodsImg{
			width: 200rpx;
			height: 200rpx;
			margin-right: 20rpx;
			flex-shrink: 0;
			border-radius: 8rpx;
			overflow: hidden;
			position: relative;
			text{
				position: absolute;
				left: 50%;
				bottom: 20rpx;
				width: 80rpx;
				height: 28rpx;
				line-height: 28rpx;
				transform: translateX(-50%);
				background: rgba(0,0,0,0.80);
				border-radius: 14rpx;
				color: #fff;
				font-size: 20rpx;
				text-align: center;
			}
		}
		.goodsInfo{
			flex-shrink: 0;
			.goodsName{
				color: #333;
				font-size: 28rpx;
				height: 80rpx;
				width: 470rpx;
				text{
					width: 56rpx;
					height: 28rpx;
					line-height: 28rpx;
					text-align: center;
					background: #ff2d2d;
					border-radius: 8rpx;
					color: #fff;
					font-size: 20rpx;
					margin-right: 10rpx;
				}
			}
			.goodsStatus{
				color: #999;
				font-size: 24rpx;
				margin: 10rpx 0 38rpx;
			}
			.goodsPrice{
				color: #FF2D2D;
				font-size: 24rpx;
				text{
					font-size: 32rpx;
				}
			}
		}
	}

	.goodsContent {
		padding: 20rpx 30rpx 40rpx;
		width: 750rpx;
		flex-shrink: 0;
		background-color: #fff;
	}
	
	.shopGoods {
		display: flex;
		align-items: center;
		// padding: 20rpx 0;
		flex-shrink: 0;
	
		.goodsImg {
			width: 200rpx;
			height: 200rpx;
			border-radius: 8rpx;
			overflow: hidden;
			margin-right: 20rpx;
		}
	
		.manufactor {
			width: 418rpx;
	
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
	
				text {
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

	.goTop{
		width: 100rpx;
		height: 100rpx;
		position: fixed;
		bottom: 5%;
		right: 4%;
	}
</style>
