<template>
	<view class="">
		<view class="refundBox">
			<view class="refundReject">
				<view class="title">
					被拒原因
				</view>
				<view class="content">
					{{remark}}
				</view>
			</view>
		</view>
		<view class="tips">
			*对订单有疑问，请<view>联系客服<button open-type="contact">联系客服</button></view>
		</view>
	</view>
</template>

<script>
	export default {
		data(){
			return {
				remark: '商家并没有说什么，就是拒绝了你'
			}
		},
		onLoad(options) {
			this.remark = options.remark
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.refundBox{
		background-color: #fff;
		width: 100%;
		margin-bottom: 20rpx;
		min-height: 750rpx;
		.refundReject{
			padding: 20rpx 30rpx;
			.title{
				color: #666;
				margin-right: 40rpx;
			}
			.content{
				color: #999;
				font-size: 28rpx;
				margin-top: 20rpx;
			}
		}
	}
	
	.tips{
		color: #999;
		font-size: 26rpx;
		padding: 20rpx;
		display: flex;
		view{
			color: #58caff;
			position: relative;
			button{
				position: absolute;
				left: 0;
				top: 0;
				width: 110rpx !important;
				height: 36rpx !important;
				opacity: 0;
			}
		}
	}
</style>
