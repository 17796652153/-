<template>
	<view class="">
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
					<view class="allNavItem baseflex" v-for="(item,index) in headerNav" :key="index" @click="selectHeadNav(index + 1)">
						<image :src="www + item.img" mode=""></image>
						<text>{{item.title}}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 优惠券列表 -->
		<view class="couponList" v-if="couponList.length > 0">
			<view class="couponItem" v-for="(item,index) in couponList" :key="index">
				<view class="couponLeft">
					<view class="couponInfo">
						<view class="couponImg">
							<image class="pic" :src=" www + item.goods_icon" mode=""></image>
						</view>
						<view class="couponContent">
							<view class="couponName singleHide">
								{{item.goods_name}}
							</view>
							<view class="advantage">
								{{item.goods_des_title}}
							</view>
							<view class="originalPrice">
								原价 ￥{{item.goods_price}}
							</view>
							<view class="presentPrice">
								劵后价 <view>￥<text>{{item.now_price}}</text></view>
							</view>
						</view>
					</view>
					<view class="receiveProgress">
						<view class="progress-box">
						    <progress 
								:percent="item.progress" 
								backgroundColor="#CCCCCC" 
								active="true" 
								activeColor="#FF2D2D" 
								stroke-width="4"
							>
								券已领{{item.progress}}%
							</progress>
						</view>
					</view>
				</view>
				<view class="couponRight">
					<view class="couponPrice">
						￥<text>{{item.coupon_money}}</text>
					</view>
					<view class="couponStatus">
						{{item.coupon_name}}
					</view>
					<view class="couponEdit" @click="receiveCoupon(item.issue_id)">
						立即领取
					</view>
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无优惠券发行
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	export default {
		data() {
			return {
				headerNav: [],
				headNav: 0, // 选中的headnav导航
				showAllNav: false, // 显示所有的
				animationData: {}, // 动画 翻转
				progress: 32, // 优惠券领取进度
				
				
				couponList: [],
				page: 1,
				last_page: 1,
				total: 0,
				www: http.rootDocument,
			}
		},
		onShow() {
			this.getNavCategory();
			this.getReceive()
		},
		methods:{
			// 获取nav类目
			getNavCategory(){
				let that = this;
				http.postJSON('api/index/getCategoryPid',{
					pid: 0
				},function(res){
					// console.log(res,'导航类目');
					that.headerNav = res.data
				})
			},
			
			getReceive(){
				let that = this;
				let cate_one = 0;
				if(this.headNav == 0){
					cate_one = 0;
				}else{
					cate_one = this.headerNav[Number(this.headNav) - 1].id
				}
				console.log(cate_one);
				
				http.postJSON('api/coupon/queryCouponList',{
					cate_one: cate_one,
					page: this.page
				},function(res){
					if(res.code == 200){
						that.couponList = that.couponList.concat(res.data.data);
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						
						that.couponList.forEach(item => {
							item.progress = Number(item.issue_num) / Number(item.issue_count_num);
							
							item.now_price = (Number(item.goods_price) * 100 - Number(item.coupon_money) *100) / 100;
							item.now_price = item.now_price < 0 ? 0 : item.now_price;
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
			
			// 领取优惠券
			receiveCoupon(issue_id){
				let that = this;
				http.postJSON('api/coupon/receiveCoupon',{
					issue_id: issue_id
				},function(res){
					console.log(res,'领取优惠券');
					if(res.code == 200){
						uni.showToast({
							title: '领取成功',
							icon: 'none'
						})
						that.couponList = [];
						that.page = 1;
						that.getReceive();
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			
			// 点击切换headNav导航
			selectHeadNav(idx){
				this.headNav = idx;
				
				this.page = 1;
				this.couponList = [];
				this.getReceive();
				this.showAllNav = true;
				this.clickMoreNav()
			},
			
			// 点击所有的导航
			clickMoreNav(){
				this.showAllNav = !this.showAllNav;
				
				var animation = uni.createAnimation({
				  duration: 400,
				    timingFunction: 'ease',
				})
				this.animation = animation
				if(this.showAllNav){
					this.animation.rotate(180).step()
				}else{
					this.animation.rotate(0).step()
				}
				
				this.animationData = this.animation.export()
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getReceive()
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
			this.getReceive();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	
	.headerNav{
		width: 750rpx;
		height: 72rpx;
		position: relative;
		z-index: 99;
		overflow: hidden;
		background-color: #fff;
		.scrollView{
			width: 750rpx;
			height: 72rpx;
			display: flex;
			padding-right: 72rpx;
			white-space: nowrap;
			view{
				flex-shrink: 0;
			}
			.headerNavItem{
				padding: 20rpx;
				min-width: 56rpx;
				font-size: 28rpx;
				color: #333;
				display: inline-block;
			}
			.headerNavItem:last-child{
				padding-right: 72rpx;
			}
			.activeHeadItem{
				color: #FF2D2D;
				text{
					position: relative;
					&::after{
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
		.headerNavImg{
			width: 60rpx;
			height: 72rpx;
			background: #ffffff;
			box-shadow: 2rpx 0rpx 12rpx 4rpx rgba(0,0,0,0.41); 
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			right: 0;
			top: 0;
			image{
				width: 28rpx;
				height: 28rpx;
			}
		}
	}
	
	.allNav{
		width: 100%;
		height: calc(100% - 72rpx);
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 99;
		background-color: #fff;
		scroll-view{
			width: 100%;
			height: 100%;
			padding: 20rpx 0;
			.allNavList{
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				.allNavItem{
					flex-direction: column;
					justify-content: center;
					width: 20%;
					height: 132rpx;
					image{
						width: 72rpx;
						height: 72rpx;
						margin-bottom: 12rpx;
					}
					text{
						color: #333;
						font-size: 24rpx;
					}
				}
			}
		}
	}
	
	swiper{
		height: 352rpx;
		.swiper-item{
			width: 100%;
			height: 352rpx;
		}
	}
	
	.couponList{
		padding: 20rpx 30rpx;
		.couponItem{
			width: 690rpx;
			height: 306rpx;
			border-radius: 10rpx;
			background-color: #fff;
			position: relative;
			margin-bottom: 20rpx;
			&::before{
				content: "";
				position: absolute;
				width: 56rpx;
				height: 56rpx;
				border-radius: 50%;
				background-color: #F5F5F5;
				right: 184rpx;
				top: -32rpx;
			}
			&::after{
				content: "";
				position: absolute;
				width: 56rpx;
				height: 56rpx;
				border-radius: 50%;
				background-color: #F5F5F5;
				right: 184rpx;
				bottom: -32rpx;
			}
			.couponLeft{
				position: absolute;
				left: 0;
				top: 0;
				width: 476rpx;
				height: 306rpx;
				padding: 20rpx;
				.couponInfo{
					display: flex;
					align-items: center;
					.couponImg{
						width: 200rpx;
						height: 200rpx;
						border-radius: 8rpx;
						overflow: hidden;
						margin-right: 20rpx;
					}
					.couponContent{
						.couponName{
							color: #333;
							font-size: 28rpx;
							width: 210rpx;
						}
						.advantage{
							color: #999;
							font-size: 24rpx;
							margin: 16rpx 0 32rpx;
						}
						.originalPrice{
							font-size: 28rpx;
							color: #333;
						}
						.presentPrice{
							color: #FF2D2D;
							font-size: 28rpx;
							view{
								font-weight: 600;
								display: inline-block;
								text{
									font-size: 32rpx;
								}
							}
						}
					}
				}
				.progress-box{
					margin-top: 20rpx;
					progress{
						font-size: 24rpx;
						text-indent: 1em;
					}
				}
			}
			.couponRight{
				position: absolute;
				right: 0;
				top: 0;
				width: 212rpx;
				height: 306rpx;
				padding: 50rpx 36rpx;
				.couponPrice{
					color: #FF2D2D;
					font-size: 28rpx;
					text{
						font-size: 58rpx;
					}
				}
				.couponStatus{
					font-size: 28rpx;
					color: #FF2D2D;
					margin: 14rpx 0 26rpx;
					text-align: center;
				}
				.couponEdit{
					width: 144rpx;
					height: 52rpx;
					line-height: 52rpx;
					text-align: center;
					background: #ff2d2d;
					border-radius: 8rpx;
					font-size: 28rpx;
					color: #fff;
				}
			}
		}
	}
</style>
