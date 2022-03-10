<template>
	<view class="">
		<view class="headNavigation">
			<view :class="activeNav == 0 ? 'navItem activeNav' : 'navItem'" @click="changeNav(0)">待提货</view>
			<view :class="activeNav == 1 ? 'navItem activeNav' : 'navItem'" @click="changeNav(1)">已提货</view>
		</view>
		
		<block class="" v-if="slefTakeList.length > 0">
			<view class="selfTakeMain" v-for="(item,index) in slefTakeList" :key="index">
				<view class="shopName">
					{{item.store_name}}
				</view>
				<view class="orderGoods" v-for="(val,idx) in item.goods" :key="idx">
					<view class="goodsImg">
						<image class="pic" :src="www + val.goods_icon" mode=""></image>
					</view>
					<view class="goodsInfo">
						<view class="goodsName multiHide">
							{{val.goods_name}}
						</view>
						<view class="goodsSpec singleHide">
							<text>{{val.goods_spec_title}}</text>
						</view>
						<view class="goodsOperation baseflex">
							<view class="goodsPrice">
								￥<text>{{val.goods_price}}</text>
							</view>
							<view class="operationBtn" v-if="activeNav == 0" @click="seePickUpCode(item.order_no)">
								提货码
							</view>
							<view class="operationBtn over" v-else>
								已提货
							</view>
						</view>
					</view>
				</view>
			</view>
		</block>
		
		<view class="goodsNull" v-else>
			暂无自提订单
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default{
		data(){
			return {
				activeNav: 0, // 选中的头部导航
				
				slefTakeList: [], // 自提订单
				www: http.rootDocument,
				page: 1,
				total: 0,
				last_page: 1,
				
				hidePage: false, // 离开页面
			}
		},
		onShow() {
			this.getSelfTake()
		},
		methods:{
			// 自提订单
			getSelfTake(){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				let status = this.activeNav == 0 ? 3 : 5;
				http.postJSON('api/order/queryOrderList',{
					status: status,
					type: 2,
					page: this.page,
				},function(res){
					console.log(res,'自提订单列表');
					that.page = res.data.current_page;
					that.total = res.data.total;
					that.last_page = res.data.last_page;
					that.slefTakeList = that.slefTakeList.concat(res.data.data);
				})
			},
			
			
			
			// 切换头部导航
			changeNav(idx) {
				this.activeNav = idx;
				this.page = 1;
				this.slefTakeList = []
				this.getSelfTake()
			},
			
			// 查看提货码
			seePickUpCode(order_no){
				uni.navigateTo({
					url: "./pickUpCode?order_no=" + order_no
				})
			},
		},
		onHide() {
			console.log('离开页面');
			this.hidePage = true;
		},
		onReachBottom(){
			console.log('触底了');
			if(this.page < this.last_page){
				this.page ++;
				this.getSelfTake()
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
			this.slefTakeList = [];
			this.getSelfTake();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
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
	
	.selfTakeMain{
		padding: 20rpx 30rpx;
		.shopName{
			font-size: 36rpx;
			color: #000;
			margin-bottom: 16rpx;
		}
	}
	
	.orderGoods{
		display: flex;
		align-items: center;
		
		.goodsImg{
			width: 200rpx;
			height: 200rpx;
			border-radius: 8rpx;
			overflow: hidden;
			margin-right: 20rpx;
		}
		
		.goodsInfo{
			width: 450rpx;
			.goodsName{
				width: 450rpx;
				height: 70rpx;
				font-size: 28rpx;
				color: #333333;
			}
			.goodsSpec{
				height: 44rpx;
				line-height: 44rpx;
				background: #f5f5f5;
				border-radius: 4rpx;
				color: #999;
				font-size: 28rpx;
				position: relative;
				padding-right: 42rpx;
				padding-left: 12rpx;
				margin-top: 12rpx;
				text{
					margin-right: 20rpx;
				}
				image{
					width: 20rpx;
					height: 20rpx;
					position: absolute;
					right: 18rpx;
					top: 50%;
					transform: translateY(-50%);
				}
			}
			.goodsOperation{
				margin-top: 32rpx;
				.goodsPrice{
					font-size: 20rpx;
					color: #FF2D2D;
					text{
						font-size: 32rpx;
					}
				}
				.operationBtn{
					color: #FF2D2D;
					font-size: 28rpx;
					padding: 10rpx 20rpx;
					background: #ffe3e3;
					border-radius: 30rpx;
					display: none;
					&:last-child{
						display: block;
					}
				}
				.over{
					background-color: #E5E5E5;
					color: #999;
				}
			}
		}
	}
</style>
