<template>
	<view class="">
		<view class="pickUpCode">
			<view class="title">
				{{pickupCodeInfo.store_name}}货物自提(请认准验证码)
			</view>
			<view class="timer">
				下单时间:{{pickupCodeInfo.pay_time}}
			</view>
			<view class="code">
				<text>提货码:{{pickupCodeInfo.confirm_no}}</text>
				<image @click="copyCode" src="../../static/copy.png" mode=""></image>
			</view>
			<view class="statusBtn">
				{{pickupCodeInfo.status == 1 ? '暂未提货' : '已提货'}}
			</view>
			<view class="smallTips">
				凭码联系现场人员提货
			</view>
		</view>
		<view class="pickUpTips">
			<view class="tipsTitle">
				提货码详情
			</view>
			<view class="tipsContent">
				<text class="contentTitle">可用时段</text>
				<text class="content">{{pickupCodeInfo.times}}</text>
			</view>
			<view class="tipsContent">
				<text class="contentTitle">提货地址</text>
				<text class="content">{{pickupCodeInfo.storeAddress}}</text>
			</view>
		</view>
		
		<!-- 按钮 -->
		<view class="confirmBtn" @click="callTel">联系商家客服——拨号</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				code: '888888', // 提货码
				callNum: '800-820-8820', // 拨打电话
				
				order_no: '',
				pickupCodeInfo: {},
			}
		},
		onLoad(options) {
			console.log(options);
			this.order_no = options.order_no;
			this.getPickUpCode()
		},
		methods:{
			getPickUpCode(){
				let that = this;
				http.postJSON('api/order/getConfirmInfo',{
					order_no: this.order_no
				},function(res){
					console.log(res,'自提订单详情');
					that.pickupCodeInfo = res.data
				})
			},
			
			
			// 复制提货码
			copyCode() {
			  uni.setClipboardData({
			    //准备复制的数据
			    data: this.code,
			    success: function (res) {
			      console.log(res, '拷贝');
			      uni.showToast({
			        title: '复制成功',
			      });
			    }
			  });
			},
			
			callTel(){
				uni.makePhoneCall({
				  phoneNumber: this.callNum,
				  success(res) {
				    console.log(res, '拨打电话');
				  },
				  fail(err) {
				    console.log(err);
				  }
				})
			},
		}
	}
</script>

<style lang="less">
	.pickUpCode{
		text-align: center;
		font-size: 24rpx;
		color: #333;
		padding-top: 1rpx;
		border-bottom: 4rpx dashed #FFDADA;
		.shop,.timer{
			margin: 20rpx 0;
		}
		.title{
			font-size: 36rpx;
			margin: 20rpx 0;
		}
		.code{
			font-size: 36rpx;
			color: #FF051F;
			
			text{
				margin-right: 20rpx;
			}
			image{
				width: 28rpx;
				height: 28rpx;
			}
		}
		.statusBtn{
			width: 344rpx;
			height: 76rpx;
			line-height: 76rpx;
			text-align: center;
			font-size: 36rpx;
			color: #fff;
			background: #ff2d2d;
			border-radius: 44rpx;
			margin: 40rpx auto 20rpx;
		}
		.smallTips{
			font-size: 22rpx;
			margin-bottom: 36rpx;
		}
	}

	.pickUpTips{
		padding: 40rpx 30rpx;
		.tipsTitle{
			color: #333;
			font-size: 28rpx;
			margin-bottom: 40rpx;
		}
		.tipsContent{
			font-size: 24rpx;
			margin-bottom: 20rpx;
			.contentTitle{
				color: #666;
				margin-right: 10rpx;
			}
			.content{
				color: #333;
			}
		}
	}
	
	.confirmBtn {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: 40rpx;
		width: 650rpx;
		height: 88rpx;
		opacity: 1;
		background: #FF2D2D;
		border-radius: 54rpx;
		font-size: 36rpx;
		color: #fff;
		text-align: center;
		line-height: 88rpx;
	}
</style>
