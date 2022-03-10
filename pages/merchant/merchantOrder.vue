<template>
	<view class="">
		<view class="headerTabs">
			<view :class="activeTabs == 0 ? 'tabs activeTab' : 'tabs' " @click="changeTabs(0)">待付款</view>
			<view :class="activeTabs == 1 ? 'tabs activeTab' : 'tabs' " @click="changeTabs(1)">待发货</view>
			<view :class="activeTabs == 2 ? 'tabs activeTab' : 'tabs' " @click="changeTabs(2)">待收货</view>
			<view :class="activeTabs == 3 ? 'tabs activeTab' : 'tabs' " @click="changeTabs(3)">售后</view>
			<view :class="activeTabs == 4 ? 'tabs activeTab' : 'tabs' " @click="changeTabs(4)">待自提</view>
		</view>
		
		<view class="orderList" v-if="merchantOrderList.length > 0">
			<view class="orderGoods" v-for="(item,index) in merchantOrderList" :key="index" @click="jumpOrderDetail(item.order_no)">
				<view class="shopName singleHide">
					{{item.store_name}}
				</view>
				<view class="goods" v-for="(val,idx) in item.goods" :key="idx">
					<view class="goodsImg">
						<image class="pic" :src="www + val.goods_icon" mode=""></image>
					</view>
					<view class="goodsInfo">
						<view class="goodsName multiHide">
							{{val.goods_name}}
						</view>
						<view class="goodsSpecs">
							{{val.goods_spec_title}}
						</view>
					</view>
					<view class="goodsPrice">
						<!-- ￥<text class="yuan">18</text><text class="jiao">.80</text> -->
						￥<text class="yuan">{{val.goods_price}}</text>
					</view>
				</view>
				<view class="distribution baseflex">
					<view class="disMode">
						配送方式
						<text>{{item.delivery_type == 1 ? '送货上门' : '到店自取'}}</text>
					</view>
					<view class="disModePrice" v-if="item.delivery_type == 1">
						￥{{item.delivery_money}}
					</view>
				</view>
				<view class="distribution">
					<view class="disMode">
						订单备注
						<text class="multiHide">{{item.remark || '无'}}</text>
					</view>
				</view>
				<view class="priceDetail">
					<view class="totalPrice">
						<!-- 总价￥<text class="yuan">18</text class="jiao"><text>.80，</text> -->
						总价￥<text class="yuan">{{item.money}}</text>
					</view>
					<view class="discountPrice" style="margin: 0 10rpx;">
						优惠￥<text class="yuan">{{item.coupon_money}}</text>
					</view>
					<view class="payPrice">
						 需付款￥<text class="yuan">{{((Number(item.money) * 10) - (Number(item.coupon_money) * 10)) / 10}}</text>
					</view>
				</view>
				<view class="operation" v-if="item.is_pay == 1">
					<view class="operationBtn redBtn">
						买家待付款
					</view>
				</view>
				<view class="operation" v-else-if="item.delivery_type == 2 && item.status == 1">
					<view class="operationBtn redBtn">
						买家待提货
					</view>
				</view>
				<view class="operation" v-else-if="item.status == 1">
					<view class="operationBtn redBtn">
						待发货
					</view>
				</view>
				<view class="operation" v-else-if="item.status == 2">
					<view class="operationBtn redBtn">
						买家待收货
					</view>
				</view>
				<view class="operation" v-else-if="item.status == 3">
					<view class="operationBtn redBtn" v-if="!item.refund_status">
						买家已收货
					</view>
					<view class="operationBtn redBtn" v-else-if="item.refund_status == 1">
						买家申请退款
					</view>
					<view class="operationBtn redBtn" v-else-if="item.refund_status == 2">
						<!-- {{item.refund_delivery_no ? '商家待确认' : '上传单号'}} -->
						已同意
					</view>
					<view class="operationBtn" v-else-if="item.refund_status == 3">
						已拒绝退货
					</view>
					<view class="operationBtn" v-else-if="item.refund_status == 4">
						已退款
					</view>
				</view>
				<view class="operation" v-else-if="item.status == 4">
					<view class="operationBtn redBtn">
						
					</view>
				</view>
				<view class="operation" v-else-if="item.status == 4">
					<view class="operationBtn">
						退货退款待审核
					</view>
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无商家订单
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				activeTabs: 0, // 选中的tab
				
				hidePage: false, // 离开页面
				www: http.rootDocument, 
				
				page: 1,
				last_page: 1,
				total: 0,
				merchantOrderList: [], // 商家订单
			}
		},
		onLoad(options) {
			console.log(options);
			this.activeTabs = options.idx;
			
			this.getMerchantOrderList();
		},
		methods:{
			changeTabs(idx){
				this.activeTabs = idx;
				
				this.page = 1;
				this.hidePage = false;
				this.merchantOrderList = [];
				this.getMerchantOrderList();
			},
			
			// 跳转订单详情
			jumpOrderDetail(order_no){
				console.log(564564564);
				uni.navigateTo({
					url: '../order/goods-detail?order_no=' + order_no + '&type=store'
				})
			},
			
			// 获取商家订单
			getMerchantOrderList(){
				let that = this;
				if (this.hidePage) {
					this.hidePage = false;
					return
				}
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/Store/queryOrderList',{
					status: Number(this.activeTabs) + 2,
					page: this.page
				},function(res){
					uni.hideLoading()
					if(res.code == 200){
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						
						that.merchantOrderList = that.merchantOrderList.concat(res.data.data)
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
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
				this.getMerchantOrderList();
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
			this.merchantOrderList = [];
			this.getMerchantOrderList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.headerTabs{
		width: 100%;
		height: 80rpx;
		display: flex;
		align-items: center;
		.tabs{
			width: 150rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			font-size: 28rpx;
			color: #333;
		}
		.activeTab{
			font-size: 36rpx;
			color: #FF2D2D;
		}
	}
	
	.orderList{
		padding: 0 30rpx 30rpx;
		.orderGoods{
			margin-bottom: 20rpx;
			width: 690rpx;
			background: #ffffff;
			border-radius: 20rpx;
			padding: 20rpx;
			font-size: 28rpx;
			color: #333;
			.shopName{
				padding: 22rpx 20rpx;
				max-width: 400rpx;
			}
			.goods{
				display: flex;
				margin-bottom: 20rpx;
				.goodsImg{
					width: 200rpx;
					height: 200rpx;
					border-radius: 10rpx;
					overflow: hidden;
					margin-right: 20rpx;
					flex-shrink: 0;
				}
				.goodsInfo{
					width: 320rpx;
					flex-shrink: 0;
					margin-right: 12rpx;
					.goodsName{
						height: 70rpx;
						margin-bottom: 10rpx;
					}
					.goodsSpecs{
						color: #999;
					}
				}
				.goodsPrice{
					font-size: 20rpx;
				}
			}
			.distribution{
				margin-bottom: 30rpx;
				.disMode{
					display: flex;
					max-height: 70rpx;
					text{
						margin-left: 20rpx;
						color: #999999;
						max-width:400rpx;
					}
				}
				.disModePrice{
					color: #999;
				}
				&:last-child{
					margin-bottom: 40rpx;
				}
			}
			.priceDetail{
				width: 100%;
				text-align: right;
				display: flex;
				justify-content: flex-end;
				margin-bottom: 20rpx;
				.totalPrice,.discountPrice{
					color: #999;
				}
				.payPrice{
					margin-left: 12rpx;
				}
			}
			.operation{
				width: 100%;
				text-align: right;
				display: flex;
				justify-content: flex-end;
				.operationBtn{
					padding: 10rpx 20rpx;
					border: 1rpx solid #cccccc;
					border-radius: 50rpx;
					margin-right: 30rpx;
					&:last-child{
						margin-right: 0;
					}
				}
				.redBtn{
					color: #FF2D2D;
					border-color: #FF2D2D;
				}
			}
		}
	}
	.yuan{
		font-size: 32rpx;
	}
	.jiao{
		font-size: 24rpx;
	}
	
	.mask{
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.60);
		z-index: 99;
	}
	
	.model{
		position: fixed;
		left: 50%;
		top: 40%;
		z-index: 999;
		transform: translateX(-50%) translateY(-40%);
		width: 488rpx;
		background: #ffffff;
		border-radius: 10rpx;
		.title{
			font-size: 32rpx;
			color: #333;
			padding: 20rpx;
		}
		.content{
			margin-left: 20rpx;
			width: 448rpx;
			height: 56rpx;
			background: #f5f5f5;
			border-radius: 8rpx;
			margin-bottom: 35rpx;
			position: relative;
			
			font-size: 24rpx;
			.selPicker{
				display: inline-block;
				height: 100%;
				width: 100%;
				padding: 16rpx 20rpx;
				box-sizing: border-box;
			}
			image{
				position: absolute;
				top: 16rpx;
				right: 20rpx;
				width: 24rpx;
				height: 24rpx;
			}
		}
		.operation{
			height: 80rpx;
			width: 100%;
			border-top: 2rpx solid #EBEBEB;
			display: flex;
			align-items: center;
			justify-content: space-around;
			view{
				flex: 1;
				font-size: 32rpx;
				text-align: center;
			}
			.cancel{
				color: #999999
			}
			.confirm{
				color: #FF2D2D;
			}
		}
	}
</style>
