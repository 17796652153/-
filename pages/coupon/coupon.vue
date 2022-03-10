<template>
	<view class="">
		<!-- tabs -->
		<view class="headerTabs baseflex">
			<view :class="activeTab == 0 ? 'activeTabs tabsItem' : 'tabsItem'" @click="changeTabs(0)">未使用</view>
			<view :class="activeTab == 1 ? 'activeTabs tabsItem' : 'tabsItem'" @click="changeTabs(1)">已使用</view>
			<view :class="activeTab == 2 ? 'activeTabs tabsItem' : 'tabsItem'" @click="changeTabs(2)">已过期</view>
		</view>
		<view class="couponContent">
			<!-- 领取更多优惠券 -->
			<view class="receiveCoupon baseflex" @click="jumpReceive">
				<view class="receive">
					<image src="../../static/coupon.png" mode=""></image>
					<text>领更多好券</text>
				</view>
				<view class="more">
					<text>领券中心</text>
					<image src="../../static/icon_arrow-rightGray.png" mode=""></image>
				</view>
			</view>
			<!-- 优惠券列表 -->
			<view class="couponList" v-if="couponList.length > 0">
				<view class="couponItem baseflex" v-for="(item,index) in couponList" :key="index">
					<view :class="activeTab !== 0 ? 'couponPrice used' : 'couponPrice'">
						<view class="price">
							￥<text>{{item.coupon_money}}</text>
						</view>
						<view class="range">
							{{item.coupon_title}}
						</view>
					</view>
					<view class="couponInfo">
						<view class="couponName">
							<image :src="www + item.goods_icon" mode=""></image>
							<text
								:class="activeTab !== 0 ? 'multiHide used' : 'multiHide'">仅该商品可用：{{item.goods_name}}</text>
						</view>
						<view :class="activeTab !== 0 ? 'couponTimer used' : 'couponTimer'">
							{{item.use_start_time}}—{{item.use_end_time}}</view>
					</view>
					<view class="couponBtn" v-if="activeTab == 0" @click="useCoupon(item.goods_id)">
						立即使用
					</view>
					<view class="couponBtn unCoupon" v-else>
						{{activeTab == 1 ? '已使用' : '已过期'}}
					</view>
				</view>
			</view>
			<view class="goodsNull" v-else>
				暂无优惠券记录
			</view>
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	export default {
		data() {
			return {
				activeTab: 0,

				couponList: [],
				page: 1,
				last_page: 1,
				total: 0,
				www: http.rootDocument,
				
				hidePage: false, // 离开页面
			}
		},
		onShow() {
			this.getCoupon()
		},
		methods: {
			getCoupon() {
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				http.postJSON('api/coupon/queryUserCoupon', {
					use_status: parseInt(this.activeTab) + 1,
					page: this.page,
				}, function(res) {
					console.log(res, '优惠券列表');
					if(res.code == 200){
						that.couponList = that.couponList.concat(res.data.data);
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						
						that.couponList.forEach(item => {
							item.use_start_time = that.format(item.use_start_time);
							item.use_end_time = that.format(item.use_end_time);
						})
					}else if(res.code == 2){
						uni.showToast({
							title: '请先登录',
							icon: 'none',
							duration: 2000
						})
						setTimeout(function(){
							uni.navigateTo({
								url: '../login/login'
							})
						},2000)
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},

			format(timestamp) {
				var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
				var Y = date.getFullYear() + '-';
				var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
				var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';

				let strDate = Y + M + D;
				return strDate;

			},
			
			// 使用优惠券
			useCoupon(goods_id){
				uni.navigateTo({
					url: '../goods/details?id=' + goods_id
				})
			},


			changeTabs(idx) {
				this.activeTab = idx;
				this.page = 1;
				this.couponList = 0;
				this.getCoupon()
			},

			// 跳转领券中心
			jumpReceive() {
				uni.navigateTo({
					url: "./receive"
				})
			},
		},
		onHide() {
			console.log('离开页面');
			this.hidePage = true;
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getCoupon()
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
			this.couponList = [];
			this.getCoupon();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page {
		background-color: #f5f5f5;
	}

	.headerTabs {
		width: 750rpx;
		height: 88rpx;
		background: #ffffff;
		justify-content: space-around;

		.tabsItem {
			flex: 1;
			color: #999;
			font-size: 36rpx;
			text-align: center;
			line-height: 88rpx;
			position: relative;
		}

		.activeTabs {
			color: #FF2D2D;

			&::after {
				content: "";
				position: absolute;
				width: 64rpx;
				height: 8rpx;
				background: #ff2d2d;
				border-radius: 4rpx;
				left: 50%;
				transform: translateX(-50%);
				bottom: 8rpx;
			}
		}
	}

	.couponContent {
		padding: 20rpx 30rpx;

		.receiveCoupon {
			width: 690rpx;
			height: 100rpx;
			background: #ffffff;
			padding: 16rpx 20rpx;
			margin-bottom: 20rpx;

			.receive {
				image {
					width: 68rpx;
					height: 68rpx;
					margin-right: 20rpx;
					vertical-align: middle;
				}

				text {
					color: #333;
					font-size: 28rpx;
					vertical-align: middle;
				}
			}

			.more {
				text {
					color: #999;
					font-size: 24rpx;
					margin-right: 12rpx;
					vertical-align: middle;
				}

				image {
					width: 24rpx;
					height: 24rpx;
					vertical-align: middle;
				}
			}
		}
	}

	.couponItem {
		margin-bottom: 20rpx;
		justify-content: space-around;
		position: relative;
		width: 690rpx;
		height: 156rpx;
		background: #ffffff;
		border-radius: 20rpx;
		padding: 0 32rpx;

		&::before {
			content: "";
			position: absolute;
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background-color: #F5F5F5;
			top: 50%;
			left: -32rpx;
			transform: translateY(-50%);
		}

		&::after {
			content: "";
			position: absolute;
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background-color: #F5F5F5;
			top: 50%;
			right: -32rpx;
			transform: translateY(-50%);
		}

		.couponPrice {
			flex-shrink: 0;
			color: #FFCB14;
			margin-right: 20rpx;
			max-width: 110rpx;

			.price {
				font-size: 28rpx;

				text {
					font-size: 68rpx;
				}
			}

			.range {
				font-size: 28rpx;
				margin-top: 10rpx;
				
				transform: scale(.8);
			}
		}

		.used {
			color: #ccc;
		}

		.couponInfo {
			width: 310rpx;

			.couponName {
				display: flex;
				align-items: center;
				margin-bottom: 24rpx;

				image {
					width: 64rpx;
					height: 64rpx;
					overflow: hidden;
					border-radius: 8rpx;
					margin-right: 20rpx;
				}

				text {
					width: 230rpx;
					font-size: 28rpx;
					color: #333;
					height: 76rpx;
				}

				.used {
					color: #ccc;
				}
			}

			.couponTimer {
				width: 370rpx;
				color: #FF2D2D;
				font-size: 28rpx;
				transform: scale(0.8);
			}

			.used {
				color: #ccc;
			}
		}

		.couponBtn {
			padding: 8rpx 12rpx;
			line-height: 44rpx;
			background: #ff2d2d;
			border-radius: 8rpx;
			font-size: 28rpx;
			color: #fff;
			text-align: center;
			margin-left: 20rpx;
		}

		.unCoupon {
			background-color: #CCCCCC;
			margin-left: 62rpx;
		}
	}
</style>
