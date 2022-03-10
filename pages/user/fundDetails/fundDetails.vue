<template>
	<view class="">
		<view class="headNavigation">
			<view :class="activeNav == 0 ? 'navItem activeNav' : 'navItem'" @click="changeNav(0)">收益纪录</view>
			<view :class="activeNav == 1 ? 'navItem activeNav' : 'navItem'" @click="changeNav(1)">提现纪录</view>
		</view>

		<view class="historyList" v-if="fundDetailList.length > 0">
			<view class="historyItem" v-for="(item,index) in fundDetailList" :key="index">
				<view class="historyContent" v-show="activeNav == 0">
					<view class="contentTitle" v-if="item.data_type == 1">开通会员收入</view>
					<view class="contentTitle" v-if="item.data_type == 2">开通商家收入</view>
					<view class="contentTitle" v-if="item.data_type == 3">提现支出</view>
					<view class="contentTime">{{item.create_time}}</view>
				</view>
				<view class="historyContent" v-show="activeNav == 1">
					<view class="contentTitle">余额提现</view>
					<view class="contentTime">提现时间：{{item.create_time}}</view>
					<view class="contentTime">到账时间：{{item.time}}</view>
				</view>
				<view class="historyMoney" v-if="item.type == 1">+{{item.money}}</view>
				<view class="historyMoney subMoney" v-else>-{{item.money}}</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无纪录
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data() {
			return {
				activeNav: 0, // 选中的头部导航
				type: 0,
				
				page: 1,
				last_page: 1,
				total: 0,
				fundDetailList: [],
			}
		},
		onLoad() {
			this.getMoneyAccount()
		},
		methods: {
			// 切换头部导航
			changeNav(idx) {
				this.activeNav = idx;
				this.page= 1;
				this.fundDetailList = [];
				this.getMoneyAccount()
			},
			
			// 获取资金明细
			getMoneyAccount(){
				let that = this;
				http.postJSON('api/User/queryUserAccount',{
					type: Number(this.activeNav) + 1,
					page: this.page,
				},function(res){
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.total = res.data.last_page;
					
					that.fundDetailList = that.fundDetailList.concat(res.data.data)
				})
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getMoneyAccount()
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
			this.fundDetailList = [];
			this.getMoneyAccount();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style>
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




	.historyList {
		padding: 0 30rpx;
	}

	.historyItem {
		width: 690rpx;
		opacity: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
	}

	.contentTitle {
		color: #333;
		font-size: 28rpx;
		margin-bottom: 12rpx;
	}

	.contentTime {
		color: #999;
		font-size: 24rpx;
	}

	.historyMoney {
		
		color: #FF0000;
		font-size: 28rpx;
	}

	.subMoney {
		color: #333333;
	}
</style>
