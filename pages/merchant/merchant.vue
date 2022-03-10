<template>
	<view class="main">
		<view class="income merchantBox">
			<view class="incomeHeader baseflex">
				<text>今日收入</text>
				<view class="withdrawalBrawse" @click="jumpWithdrawalList">
					<text>提现纪录</text>
					<image class="pic" src="../../static/icon_arrow-rightGray.png" mode=""></image>
				</view>
			</view>
			<view class="incomeMoney baseflex">
				<view class="money">
					资金（元）<text>{{memberMoney}}</text>
				</view>
				<view class="incomeBtn" @click="jumpWithdrawal">
					提现
				</view>
			</view>
		</view>
		
		<view class="capital merchantBox">
			<view class="capitalHeader baseflex">
				<view :class="activeTabs == 0 ? 'capitalTabs activeTabs' : 'capitalTabs'" @click="changeTabs(0)">日收入流水</view>
				<view :class="activeTabs == 1 ? 'capitalTabs activeTabs' : 'capitalTabs'" @click="changeTabs(1)">月收入流水</view>
			</view>
			<scroll-view scroll-y="true" class="capitalDetailsMain" v-show="activeTabs == 0" @scrolltolower="scrollBottomDay">
				<block v-if="incomeDay.length > 0">
					<view class="capitalItem baseflex" v-for="(item,index) in incomeDay" :key="index">
						<view class="capitalItemContent">
							<view class="capitalItemName">
								卖出{{item.goods_num}}件  <text style="color: #FF2D2D;">{{item.goods_name}}</text>
							</view>
							<view class="capitalItemTime">
								{{item.create_time}}
							</view>
						</view>
						<view :class="index % 2 == 0 ? 'capitalItemPrice add' : 'capitalItemPrice'">
							＋{{(Number(item.goods_price) * Number(item.goods_num)).toFixed(2)}}
						</view>
					</view>
				</block>
				<view class="goodsNull" v-else>
					当日暂无收入
				</view>
			</scroll-view>
			
			<scroll-view scroll-y="true" class="capitalDetailsMain" v-show="activeTabs == 1" @scrolltolower="scrollBottomMonth">
				<view class="capitalItem baseflex" v-for="(item,index) in incomeMonth" :key="index">
					<view class="capitalItemContent">
						<view class="capitalItemName">
							总收入
						</view>
						<view class="capitalItemTime">
							{{item.date}}
						</view>
					</view>
					<view :class="item.money * 100 > 0 ? 'capitalItemPrice add' : 'capitalItemPrice'">
						＋{{item.money}}
					</view>
				</view>
			</scroll-view>
		</view>
	
		<!-- 我的订单 -->
		<view class="shopcar">
			<view class="all">
				<text>店铺订单</text>
			</view>
			<view class="imgcar1">
				<view class="cargo" @click="jumpShopOrder(0)">
					<image src="../../static/user_order1.png" mode=""></image>
					<view>待付款</view>
				</view>
				<view class="cargo" @click="jumpShopOrder(1)">
					<image src="../../static/user_order2.png" mode=""></image>
					<view>待发货</view>
				</view>
				<view class="cargo" @click="jumpShopOrder(2)">
					<image src="../../static/user_order3.png" mode=""></image>
					<view>待收货</view>
				</view>
				<view class="cargo" @click="jumpShopOrder(3)">
					<image src="../../static/user_order4.png" mode=""></image>
					<view>售后</view>
				</view>
				<view class="cargo" @click="jumpShopOrder(4)">
					<image src="../../static/user_order5.png" mode=""></image>
					<view>待自提</view>
				</view>
				
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default{
		data(){
			return{
				activeTabs: 0, // 显示tabs
				memberMoney: 0, // 商家金额
				
				page: 1,
				last_page: 1,
				total: 0,
				incomeDay: [], // 日流水
				incomeMonth: [], // 月流水
			}
		},
		onLoad() {
			this.getMemberMoney();
			this.getIncomeDay();
		},
		methods:{
			changeTabs(idx){
				this.activeTabs = idx;
				this.page = 1;
				if(idx == 0){
					this.incomeDay = [];
					this.getIncomeDay()
				}else{
					this.incomeMonth = [];
					this.getIncomeMonth()
				}
			},
			
			// 查询商家金额
			getMemberMoney(){
				let that = this;
				http.postJSON('api/Store/getStoreMoney',{},function(res){
					if(res.code == 200){
						that.memberMoney = res.data.store_money;
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						setTimeout(function(){
							uni.navigateBack()
						},800)
					}
					
				})
			},
			
			// 查询日流水
			getIncomeDay(){
				let that = this;
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/Store/getStoreOrderMoney',{
					page: this.page
				},function(res){
					uni.hideLoading()
					if(res.code == 200){
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						
						that.incomeDay = that.incomeDay.concat(res.data.data);
					}
				})
			},
			
			// 查询月流水
			getIncomeMonth(){
				let that = this;
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/Store/queryStoreData',{},function(res){
					uni.hideLoading()
					if(res.code == 200){
						that.incomeMonth = res.data.reverse();
					}
				})
			},
			
			
			
			
			// 每日流水触底
			scrollBottomDay(){
				if (this.page < this.last_page) {
					this.page++;
					this.getIncomeDay()
				} else {
					uni.showToast({
						title: '没有更多了',
						icon: 'none'
					})
				}
				console.log('每日流水触底了');
			},
			// 每月流水触底
			scrollBottomMonth(){
				console.log('每月流水触底了');
			},
			
			// 跳转商家订单
			jumpShopOrder(idx){
				uni.navigateTo({
					url: "./merchantOrder?idx=" + idx
				})
			},
			
			// 跳转提现
			jumpWithdrawal(){
				uni.navigateTo({
					url: "../user/withdrawal/withdrawal?type=store"
				})
			},
			
			// 跳转提现纪录
			jumpWithdrawalList(){
				uni.navigateTo({
					url: "./withdrawalLIst"
				})
			},
		}
	}
</script>

<style lang="less">
	.merchantBox{
		background: #ffffff;
		border-radius: 20rpx;
		margin-bottom: 40rpx;
		box-shadow: 0rpx 0rpx 16rpx 0rpx rgba(0,0,0,0.10); 
		overflow: hidden;
	}
	.main{
		padding: 40rpx 30rpx;
		.incomeHeader{
			padding: 20rpx;
			border-bottom: 2rpx solid #EBEBEB;
			font-size: 36rpx;
			color: #000;
			.withdrawalBrawse{
				display: flex;
				align-items: center;
				text{
					color: #999;
					font-size: 28rpx;
					margin-right: 10rpx;
					vertical-align: middle;
				}
				image{
					width: 24rpx;
					height: 24rpx;
					vertical-align: middle;
				}
			}
		}
		.incomeMoney{
			padding: 40rpx 20rpx;
			.money{
				font-size: 28rpx;
				color: #333;
				text{
					font-size: 48rpx;
					color: #FF0000;
				}
			}
			.incomeBtn{
				width: 96rpx;
				height: 48rpx;
				background: linear-gradient(116deg,#ff9c55, #ff2d2d 100%);
				border-radius: 24rpx;
				font-size: 24rpx;
				color: #fff;
				text-align: center;
				line-height: 48rpx;
			}
		}
	}
	
	.capital{
		.capitalHeader{
			width: 100%;
			.capitalTabs{
				flex: 1;
				height: 92rpx;
				line-height: 92rpx;
				text-align: center;
				font-size: 32rpx;
				color: #999;
				background-color: #FAFAFA;
			}
			.activeTabs{
				background-color: #FFEBEB;
				color: #FF2D2D;
			}
		}
		.capitalDetailsMain{
			max-height: 520rpx;
			.capitalItem{
				padding: 20rpx;
				.capitalItemName{
					font-size: 28rpx;
					color: #333;
				}
				.capitalItemTime{
					font-size: 24rpx;
					color: #999;
				}
			}
			.capitalItemPrice{
				font-size: 28rpx;
				color: #333;
			}
			.add{
				color: #FF2D2D;
			}
		}
	}
	
	scroll-view::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
		color: transparent;
	}

	/* 小汽车 */
	.shopcar {
	   margin-top: 20rpx;
	   opacity: 1;
	   background: #ffffff;
	   border-radius: 10rpx;
	   box-shadow: 0rpx 0rpx 16rpx 0rpx rgba(0, 0, 0, 0.10);
	}
	
	.all {
	   display: flex;
	   justify-content: space-between;
	   padding: 20rpx;
	   border-bottom: 1px solid #e5e5e5;
	   font-size: 32rpx;
	   font-family: PingFang SC, PingFang SC-Regular;
	   color: #333333;
	}
	
	.allgo {
	   display: flex;
	   align-items: center;
	}
	
	.allgo image {
	   width: 24rpx;
	   height: 24rpx;
	   margin-left: 10rpx;
	}
	
	.imgcar1 {
	   display: flex;
	   font-size: 26rpx;
	   font-family: PingFang SC, PingFang SC-Regular;
	   justify-content: space-between;
	   align-items: center;
	   height: 128rpx;
	}
	
	.imgcar1 .cargo {
	   margin-right: 0;
	   text-align: center;
	   flex: 1;
	}
	
	.cargo image {
	   width: 52rpx;
	   height: 52rpx;
	}
</style>
