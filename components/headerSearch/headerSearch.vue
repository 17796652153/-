<template>
	<view class="header">
		<view class="address" v-if="showAddr" @click="jumpSelCity">
			<image src="../../static/icon_address.png" mode=""></image>
			<text class="singleHide">{{address}}</text>
		</view>
		<view class="search" @click="jumpSearch">
			<image src="../../static/icon_search-red.png" mode=""></image>
			<text v-if="!showInput">{{searchTxt}}</text>
			<input type="text" value="" :placeholder="searchTxt" placeholder-style="color: #ccc;" @confirm="valueContent" v-else/>
		</view>
		<view class="settled" v-if="showOperation" @click="jumpSettled">
			<text>{{operationTxt}}</text>
			<image src="../../static/icon_arrow-right2.png" mode="" v-if="operationMore"></image>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default{
		name: "header-search",
		props:{
			showAddr: {
				type: Boolean,
				default: false
			},
			showOperation: {
				type: Boolean,
				default: true
			},
			showInput: {
				type: Boolean,
				default: false
			},
			address: {
				type: String,
				default: ''
			},
			searchTxt: {
				type: String,
				default: ''
			},
			operationTxt: {
				type: String,
				default: ''
			},
			operationMore: {
				type: Boolean,
				default: false
			}
		},
		data(){
			return {
				
			}
		},
		methods:{
			jumpSettled(){
				let utoken = uni.getStorageSync('utoken');
				if(!utoken){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../../pages/login/login'
						})
					},1000)
					return
				};
				this.$emit('jumpSettled')
			},
			jumpSearch(){
				this.$emit('jumpSearch')
			},
			jumpSelCity(){
				this.$emit('jumpSelCity')
			},
			valueContent(e){
				this.$emit('searchValue', e.detail.value)
			},
		},
	}
</script>

<style lang="less">
	.header {
		width: 100%;
		height: 104rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
	
		.address {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			flex-shrink: 0;
			margin-right: 20rpx;
	
			image {
				width: 40rpx;
				height: 40rpx;
			}
	
			text {
				font-size: 20rpx;
				color: #FF2D2D;
				max-width: 80rpx;
			}
		}
	
		.search {
			width: 100%;
			height: 64rpx;
			background: #ffffff;
			border: 2rpx solid #ff2d2d;
			border-radius: 34rpx;
			display: flex;
			align-items: center;

			image {
				width: 40rpx;
				height: 40rpx;
				margin: 0 20rpx;
			}
	
			text {
				color: #ccc;
				font-size: 28rpx;
			}
			
			input{
				color: #333;
				font-size: 28rpx;
				width: calc(100% - 120rpx);
			}
		}
	
		.settled {
			padding: 18rpx;
			background: linear-gradient(70deg, #ff8d4d 0%, #ee2b00 100%);
			border-radius: 10rpx;
			display: flex;
			align-items: center;
			flex-shrink: 0;
			margin-left: 20rpx;
	
			text {
				font-size: 28rpx;
				color: #fff;
				margin-right: 12rpx;
			}
	
			image {
				width: 28rpx;
				height: 28rpx;
			}
		}
	}
</style>
