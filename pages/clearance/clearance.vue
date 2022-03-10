<template>
	<view class="">
		<view class="seckillImg">
			<image class="pic" src="../../static/clearance-bg.png" mode=""></image>
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
		<view class="clearanceMain" v-if="clearanceGoodsList.length > 0">
			<view class="goodsMain" v-for="(item,index) in clearanceGoodsList" :key="index" @click="jumpGoodsDetail(item.id,item.goods_type)">
				<view class="goodsImg">
					<image class="pic" :src="www + item.goods_icon" mode="aspectFill"></image>
				</view>
				<view class="goodsContent">
					<view class="goodsName singleHide">
						{{item.goods_name}}
					</view>
					<view class="advantage">
						<text class="discount">{{(Number(item.goods_money) / Number(item.goods_price)).toFixed(1)}}折</text>
						<text class="size" v-if="item.goods_type == 3">断码</text>
					</view>
					<view class="goodsPrice">
						<text class="priceTxt">断码价：</text>
						￥
						<text class="price">{{item.goods_price}}</text>
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
				
				clearanceGoodsList: [], // 秒杀商品列表
				page: 1, // 当前页码
				last_page: 1, // 最后一页
				total: 0, // 总条数
			}
		},
		onLoad() {
			this.getNavCategory()
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
					that.getClearanceGoods()
				})
			},
			
			// 获取秒杀商品
			getClearanceGoods(){
				let that = this;
				uni.showLoading()
				http.postJSON('api/goods/queryGoodsList',{
					type: 3,
					cate_one: this.headerNav[this.headNav].id,
					page: this.page
				},function(res){
					console.log(res,'清仓');
					uni.hideLoading()
					that.clearanceGoodsList = that.clearanceGoodsList.concat(res.data.data);
					that.total = res.data.total;
					that.last_page = res.data.last_page;
					that.page = res.data.current_page;
				})
			},
			
			
			// 点击切换headNav导航
			selectHeadNav(idx) {
				this.headNav = idx;
				this.page = 1;
				this.clearanceGoodsList = [];
				this.getClearanceGoods()
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
				this.getClearanceGoods()
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
			this.clearanceGoodsList = [];
			this.getClearanceGoods();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
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

	.clearanceMain{
		padding: 20rpx 30rpx;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		.goodsMain{
			width: 340rpx;
			height: 396rpx;
			background: #ffffff;
			border-radius: 10rpx;
			margin-right: 10rpx;
			margin-bottom: 10rpx;
			overflow: hidden;
			&:nth-child(2n){
				margin-right: 0;
			}
			.goodsImg{
				width: 340rpx;
				height: 240rpx;
			}
			.goodsContent{
				padding: 20rpx;
				.goodsName{
					font-size: 24rpx;
					color: #333;
					max-width: 250rpx;
					margin-bottom: 14rpx;
				}
				.advantage{
					display: flex;
					align-items: center;
					font-size: 20rpx;
					.discount{
						// width: 66rpx;
						height: 28rpx;
						padding: 0 8rpx;
						line-height: 28rpx;
						text-align: center;
						color: #ff2d2d;
						border: 1rpx solid #ff2d2d;
						border-radius: 8rpx;
						margin-right: 12rpx;
					}
					.size{
						width: 56rpx;
						height: 28rpx;
						line-height: 28rpx;
						color: #fff;
						text-align: center;
						background: linear-gradient(63deg,#e5c177 0%, #e3c6a6 0%, #d19d52 100%);
						border-radius: 8rpx;
					}
				}
				.goodsPrice{
					font-size: 20rpx;
					color: #FF2D2D;
					.priceTxt{
						font-size: 28rpx;
					}
					.price{
						font-size: 32rpx;
					}
				}
			}
		}
	}
</style>
