<template>
	<view class="">
		<view class="expressMask">
			<web-view webview-styles="webviewStyles" :src="trailUrl"></web-view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				order_no: '', // 订单编号
				www: http.rootDocument,
				trailUrl: '', // 地图轨迹
				deliveryList: [], // 信息
				deliveryInfo: {}, // 信息
				deliveryOrder: {}, // 订单信息
			}
		},
		onLoad(options) {
			this.order_no = options.order_no;
			if(this.order_no){
				let utoken = uni.getStorageSync('utoken');
				this.trailUrl = this.www + 'api/OpenApi/trajectory?order_no=' + this.order_no + '&token=api&utoken=' + utoken + '&url=' + this.www
			}
		},
		methods:{
			getDeliveryMao(){
				let that = this;
				http.postJSON('api/order/getDeliveryMap',{
					order_no: this.order_no
				},function(res){
					console.log(res,'订单位置');
					that.trailUrl = res.data.trailUrl;
					that.deliveryList = res.data.data;
					that.deliveryInfo = res.data;
					that.deliveryOrder = res.data.order;
				})
			},
			
			// 复制提货码
			copyCode() {
			  uni.setClipboardData({
			    //准备复制的数据
			    data: this.deliveryInfo.nu,
			    success: function (res) {
			      console.log(res, '拷贝');
			      uni.showToast({
			        title: '复制成功',
			      });
			    }
			  });
			},
		},
	}
</script>

<style>
	
	/* 物流详情 */
	
	scroll-view{
		box-sizing: border-box;
	}
	.expressMask{
		position: fixed;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0,0,0,0.6);
		z-index: 999;
		left: 0;
		top:0;
	}
	.webviewStyles{
		width: 100vh;
		height: 50vh;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 998;
	}
	
	.company{
		display: flex;
		align-items: center;
		
	}
	
	.goodsImg{
		width: 60rpx;
		height: 60rpx;
		border-radius: 10rpx;
		overflow: hidden;
		margin-right: 20rpx;
	}
	
	.expressCompany{
		display: flex;
		align-items: center;
		font-size: 28rpx;
	}
	.expressCompany .companyName{
		color: #FF2D2D;
	}
	.expressCompany .expressCode{
		color: #595959;
	}
	
	.copyCode{
		width: 84rpx;
		height: 44rpx;
		border: 1rpx solid #000000;
		border-radius: 12rpx;
		text-align: center;
		line-height: 44rpx;
		font-size: 28rpx;
		color: #333333;
	}
	
	.line{
		padding: 20rpx 0;
		border-bottom: 2rpx solid #EBEBEB;
	}
	.consignee{
		display: flex;
		align-items: center;
	}
	.consigneeIcon{
		width: 60rpx;
		height: 60rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}
	
	.consigneeInfo{
		font-size: 28rpx;
		color: #000;
		max-width: 590rpx;
	}
	
	.consigneeInfo .orderCode{
		margin-bottom: 20rpx;
	}
	
	
	.expressDetail{
		position: fixed;
		width: 100vw;
		/* height: 70vh; */
		max-height: 60vh;
		background-color: #fff;
		z-index: 9999;
		left: 0;
		bottom:0;
		padding:20rpx 20rpx 0;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
	}
	
	.infoContent{
		padding-top: 34rpx;
	}
	.expressInfo{
		display: flex;
		position: relative;
		padding-bottom: 70rpx;
	}
	.timer{
		flex: 2;
		font-size: 24rpx;
		margin-top: 12rpx;
	}
	.nowimg{
		flex: 1;
		display: flex;
		justify-content: center;
	}
	.nowimg .selNow{
		width: 18rpx;
		height: 18rpx;
	}
	.nowimg .unSel{
		width: 10rpx;
		height: 10rpx;
	}
	.nowAddr{
		flex: 7;
		font-size: 26rpx;
	}
	.expressInfo::after{
		content: "";
		position: absolute;
		left: 42rpx;
		top: 20rpx;
		bottom: 2px;
		width: 3px;
		background-color: #e8e8e8;
	}
	.start .timer,.start .nowAddr{
		color: #0082FA;
	}
	.expressInfo:last-child::after{
		content: "";
		display: none;
	}
</style>
