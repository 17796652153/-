<template>
	<view class="root">
		<!-- 店铺信息 -->
		<view class="shop baseflex">
			<view class="shopInfo">
				<view class="shopLogo">
					<image class="pic" :src="www + storeInfo.store_logo" mode=""></image>
				</view>
				<view class="shopContent">
					<view class="shopName">
						{{storeInfo.store_name}}
					</view>
					<view class="shopSpec">
						<text>商品：{{storeInfo.goods_count}}</text>
						<text>已售：{{storeInfo.sales_num}}</text>
					</view>
				</view>
			</view>
			<view class="shopOperation">
				<view class="star" @click="follow" v-if="storeInfo.is_like == 0">
					<view class="starImg">
						<image class="pic" src="../../static/icon_unstar.png" mode=""></image>
					</view>
					<text>收藏</text>
				</view>
				<view class="star" @click="follow" v-else>
					<view class="starImg">
						<image class="pic" src="../../static/icon_star.png" mode=""></image>
					</view>
					<text>取消收藏</text>
				</view>
				<view class="share">
					<view class="shareImg">
						<image class="pic" src="../../static/icon_share-line.png" mode=""></image>
					</view>
					<text>分享</text>
					<button open-type="share" class="friend">好友</button>
				</view>
			</view>
		</view>
		<!-- 商家地址 -->
		<view class="shopAddr baseflex">
			<view class="shopAddressTxt multiHide">
				{{storeInfo.address}}
			</view>
			<view class="shopOptions">
				<view class="shopIcon" @click="mapNavigation">
					<image src="../../static/icon_location.png" mode=""></image>
					<text>导航</text>
				</view>
				<view class="shopIcon" @click="callTel">
					<image src="../../static/icon_call.png" mode=""></image>
					<text>电话</text>
				</view>
			</view>
		</view>
		<!-- 轮播图 -->
		<!-- banner轮播 -->
		<swiper class="swiperView" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" v-if="storeBanner.length > 0">
			<swiper-item v-for="(item,index) in storeBanner" :key="index">
				<view class="swiper-item">
					<image class="pic" :src="www + item.banner_img" mode="aspectFill"></image>
				</view>
			</swiper-item>
		</swiper>
		
		<!-- 首页商品列表 -->
		<view class="homeGoods">
			<!-- 筛选条件 -->
			<view class="screen">
				<view class="screenItem" @click="selectScreen(index)" v-for="(item,index) in ['默认','销量','新品','价格']" :key="item">
					<text :class="index == screenIdx ? 'activeScreen' : ''">{{item}}</text>
					<view class="triangleBox" v-if="index == 3">
					    <text :class="priceSort == 'asc' ? 'activePriceAsc triangleTop triangle' : 'triangleTop triangle'"></text>
					    <text :class="priceSort == 'desc' ? 'activePriceDesc triangleBtm triangle' : 'triangleBtm triangle'"></text>
					</view>
				</view>
			</view>
			<!-- 商品列表 -->
			<view class="goodsList" v-if="storeGoodsList.length > 0">
				<view class="goodsItem" v-for="(item,index) in storeGoodsList" :key="index" @click="jumpGoodsDetail(item.id,item.goods_type)">
					<view class="goodsImg">
						<image class="pic" :src="www + item.goods_icon" mode=""></image>
					</view>
					<view class="goodsMain">
						<view class="goodsInfo">
							<view class="goodsName singleHide">
								{{item.goods_name}}
							</view>
							<view class="goodsTitle multiHide">
								实木床 布艺床非常社京东方科 舒服实木床
							</view>
						</view>
						<view class="goodsPrice">
							<view class="originalPrice">
								原价:￥{{item.goods_money}}
							</view>
							<view class="presentPrice">
								零售价:<text>￥{{item.goods_price}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="goodsNull" v-else>
				暂无商品，换个商家浏览吧
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default{
		data(){
			return {
				screenIdx: 0, // 选中的筛选索引
				priceSort: '', // 价格排序
				
				callNum: '800-820-8820',
				
				isFollow: false, // 是否关注
				www: http.rootDocument, // 根路径
				
				store_id: '', // 商家id
				currentType: 1, // 切换删选的type
				
				storeInfo: {}, // 商家信息
				storeBanner: [], // 商家首页banner
				
				page: 1, // 页码
				last_page: 1, // 最后一页
				total: 0, // 总条数
				storeGoodsList: [], // 商家商品
			}
		},
		onLoad(options) {
			this.store_id = options.store_id;
			this.getStoreInfo()
			this.getStoreGoods()
		},
		methods:{
			// 获取商家信息
			getStoreInfo(){
				let that = this;
				let user_id = uni.getStorageSync('user_id') || 0;
				http.postJSON('api/business/getStoreInfo',{
					store_id: this.store_id,
					user_id: user_id
				},function(res){
					console.log(res,'获取商家信息');
					that.storeInfo = res.data;
					that.storeBanner = res.data.banner;
				})
			},
			
			// 获取商家商品
			getStoreGoods(){
				let that = this;
				http.postJSON('api/business/queryStoreGoods',{
					type: this.currentType,
					store_id: this.store_id,
					page: this.page
				},function(res){
					console.log(res,'获取商家商品');
					that.storeGoodsList = that.storeGoodsList.concat(res.data.data);
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.total = res.data.total
				})
			},
			
			
			// 点击切换筛选条件
			selectScreen(idx) {
				this.screenIdx = idx;
				if(idx == 3){
					if(this.priceSort == 'asc'){
						this.priceSort = 'desc'
					}else{
						this.priceSort = 'asc'
					}
				}else{
					this.priceSort = ''
				}
				this.storeGoodsList = [];
				this.page = 1;
				
				
				this.changeType()
				this.getStoreGoods()
			},
			
			changeType(){
				console.log('改变筛选条件');
				switch (this.screenIdx){
					case 0 :
						console.log('默认');
						this.currentType = 1;
						break;
					case 1 :
						console.log('销量');
						this.currentType = 2;
						break;
					case 2 :
						console.log('新品');
						this.currentType = 5;
						break;
					case 3 :
						if(this.priceSort && this.priceSort == 'asc'){
							console.log('价格升序');
							this.currentType = 3;
						}else{
							console.log('价格降序');
							this.currentType = 4;
						}
						break;
					default :
						console.log('走的默认 默认排序');
						this.currentType = 1;
						break;
				}
			},
			
			// 跳转商品详情
			jumpGoodsDetail(id,type){
				console.log(id,type);
				uni.navigateTo({
					url: "../goods/details?id=" + id + '&type=' + type
				})
			},
			
			callTel(){
				// 拨打电话
				http.postJSON('api/user/getMobile',{
					id: this.storeInfo.id,
					type: 3
				},function(res){
					console.log(res,'拨打电话');
					if(res.code == 200){
						uni.makePhoneCall({
						  phoneNumber: res.data,
						  success(res) {
						    console.log(res, '拨打电话');
						  },
						  fail(err) {
						    console.log(err);
						  }
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			follow(){
				let utoken = uni.getStorageSync('utoken');
				if(!utoken){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../../pages/login/login'
						})
					},1000)
					return
				};
				this.isFollow = !this.isFollow;
				
				let is_like = this.storeInfo.is_like == 1 ? 0 : 1;
				this.$set(this.storeInfo, 'is_like', is_like);
				http.postJSON('api/user/likeStore',{
					store_id: this.store_id,
					is_like: is_like
				},function(res){
					console.log(res,'收藏商家');
					uni.showToast({
						title: is_like == 0 ? '取消收藏' : '点击收藏',
						icon: 'none'
					})
				})
			},
			
			// 打开地图导航
			mapNavigation() {
				let latitude = this.storeInfo.lat;
				let longitude = this.storeInfo.lng;
				let name = this.storeInfo.address;
				// 打开地图并导航
				uni.openLocation({
					latitude: latitude-0,
					longitude: longitude-0,
					name,
					success(res) {
						console.log(res,'成功');
					},
					fail: (err) => {
						console.log(err,'失败');
						uni.showModal({
							content: '打开地图失败,请重'
						})
					}
				})
			},
		},
		onReachBottom(){
			console.log('触底了');
			if(this.page < this.last_page){
				this.page ++;
				this.getStoreGoods()
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
			this.storeGoodsList = [];
			this.getStoreInfo();
			this.getStoreGoods();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	.root{
		padding: 20rpx 30rpx;
	}
	
	.shop{
		align-items: flex-start;
		.shopInfo{
			display: flex;
			align-items: center;
			.shopLogo{
				width: 100rpx;
				height: 100rpx;
				margin-right: 20rpx;
				border-radius: 20rpx;
				overflow: hidden;
			}
			.shopContent{
				.shopName{
					font-size: 32rpx;
					color: #333;
					margin-bottom: 20rpx;
				}
				.shopSpec{
					font-size: 24rpx;
					color: #666;
					margin-right: 40rpx;
					&:last-child{
						margin-right: 0;
					}
				}
			}
		}
		.shopOperation{
			display: flex;
			align-items: center;
			.star{
				margin-right: 20rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				.starImg{
					width: 36rpx;
					height: 36rpx;
				}
				
			}
			.share{
				position: relative;
				display: flex;
				flex-direction: column;
				align-items: center;
				overflow: hidden;
				.shareImg{
					width: 40rpx;
					height: 40rpx;
				}
				button{
					position: absolute;
					left: 0;
					top: 0;
					height: 94rpx;
					width: 70rpx;
					padding: 0;
					opacity: 0;
				}
			}
			text{
				color: #333;
				font-size: 20rpx;
			}
		}
	}
	
	.shopAddr{
		align-items: flex-start;
		margin-bottom: 40rpx;
		margin: 20rpx 0 40rpx;
		
		.shopAddressTxt{
			font-size: 28rpx;
			color: #333;
			max-height: 80rpx;
			max-width: 482rpx;
		}
		
		.shopOptions{
			display: flex;
			align-items: center;
			
			.shopIcon{
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-left: 20rpx;
				image{
					width: 40rpx;
					height: 40rpx;
				}
				text{
					color: #333;
					font-size: 26rpx;
					margin-top: 8rpx;
				}
			}
		}
	}
	
	.swiperView{
		width: 690rpx;
		height: 324rpx;
		border-radius: 20rpx;
		overflow: hidden;
		swiper-item{
			width: 100%;
			height: 100%;
			.swiper-item{
				width: 100%;
				height: 100%;
			}
		}
	}
	
	.screen {
		display: flex;
		align-items: center;
		margin-top: 20rpx;
		.screenItem {
			width: 25%;
			height: 68rpx;
			text-align: center;
			line-height: 68rpx;
			font-size: 36rpx;
			color: #999;
			position: relative;
			margin-bottom: 20rpx;
			position: relative;
	
			.activeScreen {
				color: #FF2D2D;
	
				&::after {
					content: "";
					position: absolute;
					bottom: 4rpx;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: #ff2d2d;
					border-radius: 2rpx;
				}
			}
		}
	}
	
	.goodsList {
	
		.goodsItem {
			padding-bottom: 40rpx;
			display: flex;
			align-items: center;
			.goodsImg{
				width: 240rpx;
				height: 240rpx;
				margin-right: 20rpx;
				border-radius: 8rpx;
				overflow: hidden;
				flex-shrink: 0;
			}
			.goodsMain{
				
				.goodsName{
					font-size: 32rpx;
					color: #333;
					max-width: 320rpx;
				}
				.goodsTitle{
					height: 60rpx;
					max-width: 400rpx;
					color: #999;
					font-size: 24rpx;
					margin: 20rpx 0 48rpx;
				}
				.originalPrice{
					font-size: 20rpx;
					color: #666;
				}
				.presentPrice{
					font-size: 20rpx;
					color: #333;
					text{
						font-size: 32rpx;
						color: #FF4747;
					}
				}
			}
		}
	}

	.triangleBox{
		position: absolute;
		right: 16rpx;
		top: 8rpx;
	}
	.triangle{
	    display: block;
	    width: 0;
	    height: 0;
	    border-style: solid;
	    border-width: 12rpx;
	}
	.triangleTop{
	    border-color: transparent transparent #bdbdbd transparent;
	}
	.triangleBtm{
	    margin-top: 10rpx;
	    border-color: #bdbdbd transparent transparent transparent;
	}
	.activePriceDesc{
	    border-color: #ff461e transparent transparent transparent;
	}
	
	.activePriceAsc{
	    border-color: transparent transparent #ff461e transparent;
	}
</style>
