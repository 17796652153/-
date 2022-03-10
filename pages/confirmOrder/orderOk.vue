<template>
	<view class="">
		<view class="main">
		  <image class="successImg" src="../../static/success.png"></image>
		  <view class="successTxt">付款成功</view>
		</view>
		
		<view class="successBtn" @click="goBack">返回</view>
	</view>
</template>

<script>
	export default {
		data (){
			return {
				
			}
		},
		methods:{
			goBack(){
				uni.navigateBack()
			},
		}
	}
</script>

<style>
	.successImg{
	  width: 160rpx;
	  height: 160rpx;
	  margin: 80rpx auto 40rpx;
	  display: block;
	}
	
	.successTxt{
	  text-align: center;
	  font-size: 40rpx;
	}
	
	.successBtn{
	  width: 400rpx;
	  height: 100rpx;
	  border-radius: 56rpx;
	  background-color: #FF2D2D;
	  text-align: center;
	  font-size: 36rpx;
	  color: #fff;
	  line-height: 100rpx;
	  margin: 100rpx auto 0;
	}
</style>
