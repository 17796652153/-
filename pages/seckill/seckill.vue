<template>
	<view class="">
		<view class="seckillImg">
			<image class="pic" src="../../static/seckill-bg.png" mode=""></image>
		</view>

		<!-- header导航 -->
		<view class="headerNav">
			<scroll-view class="scrollView" scroll-x="true" enable-flex="true">
				<view class="scrollViewBox">
					<view :class="headNav == index ? 'activeHeadItem headerNavItem' : 'headerNavItem'" v-for="(item, index) in headerNav"
					 :key="index" @click="selectHeadNav(index)">
						<text>{{item.title}}</text>
					</view>
				</view>

			</scroll-view>
			<view class="headerNavImg">
				<image :animation="animationData" src="../../static/icon_arrow-whiteDown.png" mode=""></image>
			</view>
		</view>

		<!-- 商品列表 -->
		<view class="seckillMain" v-if="seckillGoodsList.length > 0">
			<view class="goodsMain baseflex" v-for="(item,index) in seckillGoodsList" :key="index" @click="jumpGoodsDetail(item.id,item.goods_type)">
				<view class="goodsImg">
					<image class="pic" :src="www + item.goods_icon" mode="aspectFill"></image>
				</view>
				<view class="goodsContent">
					<view class="goodsTitle">
						<text class="seckillBtn" v-if="item.goods_type == 2">秒杀</text>
						<text class="welfareBtn">超值福利</text>
					</view>
					<view class="goodsName singleHide">
						{{item.goods_name}}
					</view>
					<view class="seckillStatus">
						<view class="seckillTimer">
							即将售完
						</view>
						<view class="sellOutNum">
							已卖{{item.sales_num}}件
						</view>
					</view>
					<view class="presentPrice">
						<view class="goodsPrice">
							<text class="priceTxt">断码价：</text>
							￥
							<text class="price">{{item.goods_price}}</text>
						</view>
						<view class="reduction">
							直降{{(Number(item.goods_money) - Number(item.goods_price)).toFixed(2)}}元
						</view>
					</view>
					<view class="originalPrice">
						即将恢复{{item.goods_money}}元
					</view>
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			该分类下暂无商品
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data() {
			return {
				headerNav: [],
				headNav: 0, // 选中的headnav导航
				screenIdx: 0, // 选中的筛选索引
				
				www: http.rootDocument, // 根路径
				
				seckillGoodsList: [], // 秒杀商品列表
				page: 1, // 当前页码
				last_page: 1, // 最后一页
				total: 0, // 总条数
			}
		},
		onLoad() {
			this.getNavCategory()
			// this.getSeckillGoods()
		},
		computed:{
			subMonery(){
				return 100
			},
		},
		methods: {
			// 获取nav类目
			getNavCategory(){
				let that = this;
				http.postJSON('api/index/getCategoryPid',{
					pid: 0
				},function(res){
					// console.log(res,'导航类目');
					res.data.unshift({
						title: '热销',
						id: 'sales'
					})
					res.data.unshift({
						title: '精选',
						id: 'hot'
					})
					that.headerNav = res.data
					that.getSeckillGoods()
				})
			},
			
			// 获取秒杀商品
			getSeckillGoods(){
				let that = this;
				uni.showLoading()
				http.postJSON('api/goods/queryGoodsList',{
					type: 2,
					cate_one: this.headerNav[this.headNav].id,
					page: this.page
				},function(res){
					console.log(res,'秒杀商品');
					uni.hideLoading()
					that.seckillGoodsList = that.seckillGoodsList.concat(res.data.data);
					that.total = res.data.total;
					that.last_page = res.data.last_page;
					that.page = res.data.current_page;
				})
			},
			
			// 点击切换headNav导航
			selectHeadNav(idx) {
				this.headNav = idx;
				this.page = 1;
				this.seckillGoodsList = [];
				this.getSeckillGoods()
			},
			
			// 跳转商品详情
			jumpGoodsDetail(id,type){
				uni.navigateTo({
					url: "../goods/details?id=" + id + "&type=" + type
				})
			},
		},
		onReachBottom(){
			console.log('触底了');
			if(this.page < this.last_page){
				this.page ++;
				this.getSeckillGoods()
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
			this.seckillGoodsList = [];
			this.getSeckillGoods();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	.seckillImg {
		width: 100%;
		height: 352rpx;
	}

	.headerNav {
		width: 750rpx;
		height: 72rpx;
		position: relative;
		overflow: hidden;
		background-color: #FF4D4D;

		.scrollView {
			width: 750rpx;
			height: 72rpx;
			display: flex;
			padding-right: 72rpx;
			white-space: nowrap;
			box-sizing: border-box;
			.scrollViewBox{
				display: flex;
				align-items: center;
			}

			view {
				flex-shrink: 0;
				flex-grow: 0;
			}

			.headerNavItem {
				font-size: 24rpx;
				display: inline-block;
				background-color: #FF2D2D;
				color: #fff;
				max-height: 40rpx;
				margin-right: 12rpx;
				padding: 0 16rpx;
				border-radius: 8rpx;

				text {
					border-radius: 8px;
					display: inline-block;
				}

				&:first-child {
					margin-left: 30rpx;
				}
			}

			.activeHeadItem {
				color: #FF2D2D;
				background-color: #fff;

				text {
					position: relative;
				}

			}

		}

		.headerNavImg {
			width: 60rpx;
			height: 72rpx;
			background: #FF4C4C;
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

	.seckillMain {
		padding: 20rpx 30rpx;

		.goodsMain {
			padding: 20rpx 0;
			width: 100%;
			border-bottom: 2rpx solid #EBEBEB;

			.goodsImg {
				width: 240rpx;
				height: 240rpx;
				margin-right: 24rpx;
				border-radius: 10rpx;
				overflow: hidden;
			}

			.goodsContent {
				width: 426rpx;
			}

			.goodsTitle {
				text {
					padding: 4rpx 8rpx;
					border-radius: 8rpx;
					color: #fff;
					font-size: 20rpx;
					margin-right: 12rpx;
				}

				.seckillBtn {
					background-color: #FF2D2D;
				}

				.welfareBtn {
					background-color: #333333;
				}
			}

			.goodsName {
				font-size: 28rpx;
				color: #333;
				max-width: 350rpx;
				margin: 10rpx 16rpx;
			}

			.seckillStatus {
				display: flex;
				align-items: center;
				margin-bottom: 28rpx;

				.seckillTimer {
					width: 200rpx;
					height: 32rpx;
					line-height: 32rpx;
					text-align: center;
					color: #fff;
					font-size: 20rpx;
					margin-right: 16rpx;
					background: #ff2d2d;
					border-radius: 16rpx;
				}

				.sellOutNum {
					font-size: 20rpx;
					color: #999;
				}
			}

			.presentPrice {
				display: flex;
				align-items: center;
				color: #FF2D2D;
				margin-bottom: 10rpx;

				.goodsPrice{
					font-size: 20rpx;
					color: #FF2D2D;
					margin-right: 12rpx;
					.priceTxt{
						font-size: 28rpx;
					}
					.price{
						font-size: 32rpx;
					}
				}

				.reduction {
					// width: 114rpx;
					padding: 4rpx 8rpx;
					font-size: 20rpx;
					text-align: center;
					border: 2rpx solid #ff2d2d;
					border-radius: 30rpx;
				}
			}

			.originalPrice {
				color: #999;
				font-size: 20rpx;
			}
		}
	}
</style>
