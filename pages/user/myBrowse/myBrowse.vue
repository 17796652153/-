<template>
	<view class="">
		<block v-if="browseList.length > 0">
			<view class="browseItem" v-for="(item,index) in browseList" :key="index">
				<view class="browseGoods" @click="jumpGoodsDetail(item.id)">
					<view class="goodsImg">
						<image class="pic" :src="www + item.goods_icon" mode=""></image>
					</view>
					<view class="goodsInfo">
						<view class="goodsName singleHide">
							<text v-if="item.goods_type == 1">普通</text>
							<text v-else-if="item.goods_type == 2">秒杀</text>
							<text v-else-if="item.goods_type == 3">清仓</text>
							<text v-else-if="item.goods_type == 4">议价</text>
							{{item.goods_name}}
						</view>
						<view class="advantage">
							<text>{{item.goods_des_title}}</text>
						</view>
						<view class="goodsBtm baseflex">
							<view class="price">
								￥<text>{{item.goods_price}}</text>
							</view>
							<view class="more" @click.stop="getMoreGoods(item.cate_two,index)">
								找相似
								<image :animation="item.animationFlip" src="../../../static/icon_arrow-down.png"
									mode=""></image>
							</view>
						</view>
					</view>
				</view>
				<!-- <view class="similar" v-show="item.showMore"> -->
				<view class="similar" :animation="item.animationShow">
					<scroll-view class="scrollView" scroll-x="true" enable-flex>
						<view class="similarGoods" v-for="(item,index) in searchGoodsList" :key="index"
							@click="jumpGoodsDetail(item.id)">
							<view class="similarGoodsImg">
								<image class="pic" :src="www + item.goods_icon" mode=""></image>
								<view class="goodsPrice"><text>￥{{item.goods_price}}</text></view>
							</view>
							<view class="similarGoodsDetail">
								<view class="similarGoodsName multiHide">
									{{item.goods_name}}
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
		</block>
		<view class="goodsNull" v-else>
			暂无浏览历史
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data() {
			return {
				animationFlip: {}, // 动画 翻转
				showMoreGoods: false, // 显示更多
				www: http.rootDocument,

				page: 1,
				last_page: 1,
				total: 0,
				browseList: [],

				searchGoodsList: [], // 相似商品
			}
		},
		onLoad() {
			this.getBrowseList()
		},
		methods: {
			// 获取浏览历史
			getBrowseList() {
				let utoken = uni.getStorageSync('utoken');
				let that = this;
				if (utoken) { // 已登录
					console.log('已登录');
					http.postJSON('api/User/queryGoodsLookList', {
						page: this.page,
					}, function(res) {

						if (res.code == 200) {
							that.page = res.data.current_page;
							that.last_page = res.data.last_page;
							that.total = res.data.total;
							res.data.data.forEach(item => {
								item.showMore = false;
								item.animationFlip = {};
								item.animationShow = {};
							})

							that.browseList = that.browseList.concat(res.data.data);
						} else if (res.code == 2) {
							uni.showToast({
								title: '请先登录',
								icon: 'none',
								duration: 2000
							})
							setTimeout(function() {
								uni.navigateTo({
									url: '../login/login'
								})
							}, 2000)
						} else {
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					})
				}
				console.log('未登录');
				let browsreArr = uni.getStorageSync('browsreArr');
				if (!browsreArr) {
					return
				}

				let ids = browsreArr.join(',');
				http.postJSON('api/Index/queryGoodsByIds', {
					ids: ids,
					page: this.page,
				}, function(res) {
					if (res.code == 200) {
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						res.data.data.forEach(item => {
							item.showMore = false;
							item.animationFlip = {};
							item.animationShow = {};
						})

						that.browseList = that.browseList.concat(res.data.data);
					} else if (res.code == 2) {
						uni.showToast({
							title: '请先登录',
							icon: 'none',
							duration: 2000
						})
						setTimeout(function() {
							uni.navigateTo({
								url: '../login/login'
							})
						}, 2000)
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})

			},

			// 获取相似商品
			getMoreGoods(cate_two, index) {
				let that = this;
				uni.showLoading()

				// return
				http.postJSON('api/index/searchGoodsList', {
					cate_two: cate_two
				}, function(res) {
					console.log(res, '搜索的商品');
					uni.hideLoading()
					that.searchGoodsList = res.data.data;

					if (that.searchGoodsList.length > 0) {
						that.seekMore(index)
					} else {
						uni.showToast({
							title: '暂无显示商品',
							icon: 'none'
						})
					}
				})
			},



			seekMore(idx) {
				var animation = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				var animation2 = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				this.browseList.forEach((item, index) => {
					if (index == idx) {
						item.showMore = !item.showMore
						if (item.showMore) {
							item.animationFlip = animation.rotate(180).step().export()
							item.animationShow = animation2.height(110).step().export()
						} else {
							item.animationFlip = animation.rotate(0).step().export()
							item.animationShow = animation2.height(0).step().export()
						}
					} else {
						item.showMore = false
						item.animationFlip = animation.rotate(0).step().export()
						item.animationShow = animation2.height(0).step().export()
					}
				})

			},
			// 跳转商品详情
			jumpGoodsDetail(id) {
				uni.navigateTo({
					url: "../../goods/details?id=" + id
				})
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getBrowseList()
			} else {
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
		onPullDownRefresh() {
			if (this.activeNav == 1) {
				uni.stopPullDownRefresh();
				return
			}
			console.log('下拉刷新了');
			this.page = 1;
			this.browseList = [];
			this.getBrowseList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	.browseGoods {
		padding: 20rpx 50rpx;
		width: 100%;
		height: 170rpx;
		display: flex;

		.goodsImg {
			width: 130rpx;
			height: 130rpx;
			overflow: hidden;
			border-radius: 8rpx;
			margin-right: 20rpx;
			flex-shrink: 0;
		}

		.goodsInfo {
			flex-shrink: 0;
			width: 500rpx;

			.goodsName {
				width: 500rpx;
				font-size: 28rpx;
				color: #333;

				text {
					width: 56rpx;
					height: 28rpx;
					line-height: 28rpx;
					background: #ff2d2d;
					border-radius: 8rpx;
					color: #fff;
					font-size: 20rpx;
					margin-right: 12rpx;
					display: inline-block;
					text-align: center;
				}
			}

			.advantage {
				font-size: 24rpx;
				color: #999;
				margin-top: 26rpx;

				text {
					margin-right: 20rpx;
				}
			}

			.goodsBtm {
				width: 100%;

				.price {
					font-size: 20rpx;
					color: #FF2D2D;

					text {
						font-size: 32rpx;
					}
				}

				.more {
					font-size: 28rpx;
					color: #333;

					image {
						width: 24rpx;
						height: 24rpx;
						margin-left: 8rpx;
					}
				}
			}
		}
	}

	.similar {
		background-color: #EBEBEB;
		overflow: hidden;
		// height: 220rpx;
		height: 0;

		.scrollView {
			display: flex;
			height: 220rpx;
			padding: 20rpx 30rpx;
			box-sizing: border-box;

			.similarGoods {
				width: 136rpx;
				height: 180rpx;
				background: #ffffff;
				border-radius: 4rpx;
				margin-right: 20rpx;
				overflow: hidden;
				flex-shrink: 0;

				&:last-child {
					margin-right: 0;
				}

				.similarGoodsImg {
					width: 136rpx;
					height: 120rpx;
					position: relative;
					overflow: hidden;

					.goodsPrice {
						position: absolute;
						bottom: 12rpx;
						left: 50%;
						transform: translateX(-50%);
						line-height: 28rpx;
						padding: 4rpx 6rpx;
						color: #fff;
						background: rgba(0, 0, 0, 0.80);
						border-radius: 14rpx;
						text-align: center;

						text {
							font-size: 20rpx;
							transform: scale(0.8);
						}
					}
				}

				.similarGoodsDetail {
					background-color: #fff;
					padding: 8rpx;

					.similarGoodsName {
						font-size: 20rpx;
						color: #333;
						width: 120rpx;
						height: 60rpx;
						transform: scale(0.95);
					}
				}
			}
		}
	}
</style>
