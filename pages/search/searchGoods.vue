<template>
	<view class="">
		<!-- 头部搜索框 -->
		<view class="searchHeader baseflex">
			<view class="search">
				<image src="../../static/icon_search-red.png" mode=""></image>
				<input type="text" v-model="searchGoods" placeholder="输入商品名称" @confirm="search"/>
			</view>
			<view class="searchBtn" @click="search">
				搜索
			</view>
		</view>
		
		<!-- 搜索商品列表 -->
		<view class="homeGoods">
			<!-- 筛选条件 -->
			<view class="screen">
				<view class="screenItem" @click="selectScreen(index)" v-for="(item,index) in ['综合排序','销量','价格升序','价格降序']" :key="item">
					<text :class="index == screenIdx ? 'activeScreen' : ''">{{item}}</text>
				</view>
			</view>
			<!-- 商品列表 -->
			<view class="goodsList" v-if="searchGoodsList.length > 0">
				<view class="goodsItem" v-for="item in searchGoodsList" @click="jumpGoodsDetail(item.id,item.goods_type)">
					<view class="shopName">
						{{item.store.store_name}}
					</view>
					<view class="goodsMain">
						<view class="goodsImg">
							<image class="pic" :src="www + item.goods_icon" mode=""></image>
							<text>{{item.store.district}}</text>
						</view>
						<view class="goodsRight">
							<view class="goodsRightTop">
								<view class="goodsTitle">
									<view class="content"><text class="seckillBtn" v-if="item.goods_type == 2">秒杀</text> {{item.goods_name}}</view>
								</view>
								<view class="praise">
									<image src="../../static/icon_praise.png" mode=""></image>
									<text>{{item.look_num}}</text>
								</view>
							</view>
							<view class="ensure">
								{{item.goods_des_title}}
							</view>
							<view class="goodsNum baseflex">
								<view class="originalPrice">
									原价:￥<text>{{item.goods_money}}</text>
								</view>
								<view class="goodsLimit" v-if="item.max_num != 0">
									每人限购{{item.max_num}}份
								</view>
							</view>
							<view class="goodsPrice baseflex">
								<view class="price">
									零售价: <text>￥{{item.goods_price}}</text>
								</view>
								<view class="addCar">
									加入购物车
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="goodsNull" v-else>
				暂无商品，请换个搜索吧
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default{
		data(){
			return {
				searchGoods: '', // 搜索内容
				screenIdx: 0, // 选中的筛选索引
				searchCateOne: '',
				searchCateTwo: '',
				
				www: http.rootDocument, // 根路径
				
				page: 1, // 页码
				last_page: 1, // 最后一页
				total: 0, // 总条数
				searchGoodsList: [], // 商品列表
			}
		},
		onLoad(operation) {
			
			if(operation.searchContent){
				this.searchGoods = operation.searchContent;
			}
			if(operation.cate_one){
				this.searchCateOne = operation.cate_one;
			}
			if(operation.cate_two){
				this.searchCateTwo = operation.cate_two
			}
			
			this.getSearchGoods()
			
		},
		methods:{
			
			// 获取搜索的商品
			getSearchGoods(){
				let that = this;
				uni.showLoading()
				let data = {};
				if(this.searchGoods){
					data = {
						type: this.screenIdx + 1,
						title: this.searchGoods,
						page: this.page
					}
				}else if(this.searchCateOne){
					data = {
						type: this.screenIdx + 1,
						cate_one: this.searchCateOne,
						page: this.page
					}
				}else if(this.searchCateTwo){
					data = {
						type: this.screenIdx + 1,
						cate_two: this.searchCateTwo,
						page: this.page
					}
				}
				
				console.log(data);
				// return
				http.postJSON('api/index/searchGoodsList',data,function(res){
					console.log(res,'搜索的商品');
					uni.hideLoading()
					that.searchGoodsList = that.searchGoodsList.concat(res.data.data);
					that.total = res.data.total;
					that.last_page = res.data.last_page;
					that.page = res.data.current_page;
				})
			},
			
			// 点击切换筛选条件
			selectScreen(idx) {
				this.screenIdx = idx;
				
				this.searchGoodsList = [];
				this.page = 1;
				this.getSearchGoods();
			},
			
			// 跳转商品详情
			jumpGoodsDetail(id,type){
				uni.navigateTo({
					url: "../goods/details?id=" + id + '&type=' + type
				})
			},
			
			// 搜索商品
			search(){
				let searchContent = this.searchGoods.trim();
				let history = uni.getStorageSync('history');
				
				let idx = history.indexOf(searchContent);
				
				if(searchContent!= ''){
					if(idx != -1){
						history.splice(idx,1);
					}
					history.unshift(searchContent)
					uni.setStorageSync('history',history)
					
					this.searchGoods = searchContent;
					
					this.searchGoodsList = []
					this.getSearchGoods()
				}
			},
		},
		onReachBottom() {
			console.log('触底了');
			if(this.page < this.last_page){
				this.page ++;
				this.getSearchGoods()
			}else{
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
	}
</script>

<style lang="less">
	.searchHeader{
		padding: 20rpx 30rpx;
		.search{
			width: 540rpx;
			height: 64rpx;
			background: #ffffff;
			border: 2rpx solid #ff2d2d;
			border-radius: 34rpx;
			position: relative;
			overflow: hidden;
			image{
				width: 40rpx;
				height: 40rpx;
				position: absolute;
				left: 20rpx;
				top: 12rpx;
			}
			input{
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				padding-left: 80rpx;
				padding-right: 30rpx;
				box-sizing: border-box;
			}
		}
		.searchBtn{
			width: 120rpx;
			height: 64rpx;
			background: linear-gradient(61deg,#ff8d4d 0%, #ee2b00 100%);
			border-radius: 10rpx;
			font-size: 28rpx;
			color: #fff;
			line-height: 64rpx;
			text-align: center;
		}
	}
	
	
	.screen {
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
	
				&::after {
					content: "";
					position: absolute;
					bottom: 4rpx;
					left: 50%;
					transform: translateX(-50%);
					width: 100rpx;
					height: 4rpx;
					background: #ff2d2d;
					border-radius: 2rpx;
				}
			}
		}
	}
	
	.goodsList {
		padding: 0 30rpx;
	
		.goodsItem {
			border-top: 4rpx solid #EBEBEB;
			padding-bottom: 40rpx;
	
			.shopName {
				font-size: 36rpx;
				color: #333;
				margin: 20rpx 0;
			}
	
			.goodsMain {
				display: flex;
				align-items: center;
				justify-content: space-between;
	
				.goodsImg {
					width: 240rpx;
					height: 240rpx;
					border-radius: 20rpx;
					overflow: hidden;
					position: relative;
					margin-right: 20rpx;
	
					text {
						position: absolute;
						left: 0;
						bottom: 0;
						width: 124rpx;
						height: 32rpx;
						background: #ff2d2d;
						border-radius: 0rpx 20rpx 0rpx 0rpx;
						color: #fff;
						font-size: 24rpx;
						text-align: center;
						line-height: 32rpx;
					}
				}
	
				.goodsRight {
					width: 430rpx;
	
					.goodsRightTop {
						display: flex;
						justify-content: space-between;
	
						.goodsTitle {
							width: 328rpx;
	
							.content {
								height: 76rpx;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2;
								overflow: hidden;
								text-overflow: ellipsis;
								font-size: 28rpx;
								color: #333;
	
								.seckillBtn {
									display: inline-block;
									width: 56rpx;
									height: 28rpx;
									background: #ff2d2d;
									border-radius: 8rpx;
									text-align: center;
									line-height: 28rpx;
									color: #fff;
									font-size: 20rpx;
									margin-right: 10rpx;
								}
							}
						}
	
						.praise {
							display: flex;
							align-items: center;
							flex-direction: column;
	
							image {
								width: 36rpx;
								height: 36rpx;
							}
	
							text {
								font-size: 20rpx;
								color: #FF2D2D;
							}
						}
					}
	
					.ensure {
						font-size: 24rpx;
						color: #04B901;
						margin: 14rpx 0 34rpx;
					}
	
					.goodsNum {
						margin-bottom: 12rpx;
	
						.originalPrice,
						.goodsLimit {
							color: #666;
							font-size: 20rpx;
						}
					}
	
					.goodsPrice {
						.price {
							font-size: 22rpx;
							color: #333;
	
							text {
								font-size: 34rpx;
								color: #FF2D2D;
							}
						}
	
						.addCar {
							width: 192rpx;
							height: 40rpx;
							line-height: 40rpx;
							text-align: center;
							background: #2d8dff;
							border-radius: 20rpx;
							color: #fff;
							font-size: 24rpx;
						}
					}
				}
			}
		}
	}
	
	.goodsNull{
		color: #999;
		text-align: center;
		margin: 40rpx auto;
	}
</style>
