<template>
	<view class="">
		<!-- <view class="infoDetails" :style="isIphoneX ? 'padding-bottom: 166rpx;' : 'padding-bottom: 98rpx;'"> -->
		<view class="infoDetails">
			<swiper class="infoImgs" :indicator-dots="true" :autoplay="true" :circular="true" :interval="3000" :duration="1000">
				<swiper-item v-for="(item,index) in repairInfo.imageList" :key="index">
					<view class="swiper-item">
						<image class="pic" :src="www + item" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
			
			<view class="detailsContent">
				<view class="userInfo">
					<view class="userImg">
						<image class="pic" :src="repairInfo.head_img" mode=""></image>
					</view>
					<view class="userName">
						{{repairInfo.nick_name}}
					</view>
				</view>
				<view class="introduce">
					{{repairInfo.content}}
				</view>
				<view class="baseInfo">
					<view class="baseInfoIcon">
						<image class="icon" src="../../static/icon_timer.png" mode=""></image>
						<text>{{repairInfo.update_time}}</text>
					</view>
					<view class="baseInfoIcon addressIcon" @click="mapNavigation">
						<view class="addressInfo">
							<image class="icon" src="../../static/icon_addr-line.png" mode=""></image>
							<text>{{repairInfo.address}}</text>
						</view>
						<view class="shopIcon">
							<image src="../../static/icon_location.png" mode=""></image>
							<text>导航</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作 -->
		<!-- <view class="bottomOperation baseflex" :style="isIphoneX ? 'height: 166rpx;' : 'height: 98rpx;'"> -->
		<view class="bottomOperation baseflex">
			<view class="operationIcon">
				<view class="operationIconItem">
					<image src="../../static/icon_share-line.png" mode=""></image>
					<view class="txt">
						分享
					</view>
					<button open-type="share" class="friend">好友</button>
				</view>
				<view class="operationIconItem" @click="follow" v-if="repairInfo.is_like == 0">
					<image src="../../static/icon_follow-goods.png" mode=""></image>
					<view class="txt">
						收藏
					</view>
				</view>
				<view class="operationIconItem" @click="follow" v-else>
					<image src="../../static/icon_follow-video.png" mode=""></image>
					<view class="txt">
						取消收藏
					</view>
				</view>
			</view>
			<view class="operationBtn" @click="callTel">
				一键联系
			</view>
		</view>
	</view>
</template>

<script>
	let app = getApp()
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				isIphoneX: false, // iphoneX手机
				callNum: '800-820-8820',
				id: '',
				repairInfo: '', 
				www: http.rootDocument,
				
				isFollow: false, // 是否关注
			}
		},
		onLoad(options) {
			this.isIphoneX = app.globalData.isIphoneX;
			this.id = options.id;
			console.log(options);
			this.getRepairDetail()
		},
		methods:{
			getRepairDetail(){
				let that = this;
				http.postJSON('api/message/getServerInfo',{
					id: this.id
				},function(res){
					console.log(res,'信息详情');
					if(res.code != 200){
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						setTimeout(function(){
							uni.navigateBack()
						},1000)
						return
					}
					that.repairInfo = res.data;
					that.repairInfo.imageList = that.repairInfo.message_img.split(',');
				})
			},
			
			callTel(){
				// 拨打电话
				http.postJSON('api/user/getMobile',{
					id: this.repairInfo.id,
					type: 4
				},function(res){
					console.log(res,'拨打电话');
					if(res.code == 200){
						uni.makePhoneCall({
						  phoneNumber: res.data,
						  success(res) {
						    console.log(res, '拨打电话');
						  },
						  fail(err) {
						    console.log(err);
						  }
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			follow(){
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
				console.log('点击收藏');
				// this.isFollow = !this.isFollow;
				let is_like = this.repairInfo.is_like == 1 ? 0 : 1;
				this.$set(this.repairInfo, 'is_like', is_like);
				http.postJSON('api/user/likeShop',{
					id: this.id,
					is_like: is_like
				},function(res){
					console.log(res,'收藏商品');
					uni.showToast({
						title: is_like == 0 ? '取消收藏' : '点击收藏',
						icon: 'none'
					})
				})
			},
			
			// 打开地图导航
			mapNavigation() {
				let latitude = this.repairInfo.lat;
				let longitude = this.repairInfo.lng;
				let name = this.repairInfo.address;
				// 打开地图并导航
				uni.openLocation({
					latitude: latitude-0,
					longitude: longitude-0,
					name,
					success(res) {
						console.log(res,'成功');
					},
					fail: (err) => {
						console.log(err,'失败');
						uni.showModal({
							content: '打开地图失败,请重'
						})
					}
				})
			},
		}
	}
</script>

<style lang="less">
	.infoDetails {
		padding: 20rpx 30rpx;
		padding-bottom: calc(98rpx + env(safe-area-inset-bottom));
		.infoImgs {
			width: 690rpx;
			height: 690rpx;
			overflow: hidden;
			border-radius: 20rpx;
			swiper-item{
				width: 100%;
				height: 100%;
				.swiper-item{
					width: 100%;
					height: 100%;
				}
			}
		}
		.detailsContent{
			padding: 40rpx 20rpx;
			.userInfo{
				display: flex;
				align-items: center;
				.userImg{
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;
					border-radius: 50%;
					overflow: hidden;
				}
				.userName{
					font-size: 36rpx;
					color: #333;
				}
			}
			.introduce{
				font-size: 28rpx;
				color: #333;
				line-height: 32rpx;
				margin: 20rpx 0 40rpx;
			}
			.baseInfoIcon{
				display: flex;
				margin-bottom: 20rpx;
				.icon{
					width: 24rpx;
					height: 24rpx;
					margin-right: 10rpx;
					padding-top: 6rpx;
					flex-shrink: 0;
				}
				text{
					font-size: 24rpx;
					color: #999;
				}
			}
			.addressIcon{
				justify-content: space-between;
				.shopIcon{
					display: flex;
					flex-direction: column;
					align-items: center;
					image{
						width: 40rpx;
						height: 40rpx;
					}
					text{
						color: #333;
						font-size: 20rpx;
						margin-top: 8rpx;
					}
				}
			}
		}
	}

	.bottomOperation {
		width: 750rpx;
		height: 98rpx;
		background: #ffffff;
		box-shadow: 0rpx 0rpx 8rpx 2rpx rgba(0, 0, 0, 0.25);
		padding: 6rpx 30rpx;
		position: fixed;
		left: 0;
		bottom: 0;
		height: calc(98rpx + env(safe-area-inset-bottom));
		align-items: flex-start;

		.operationIcon {
			display: flex;
			align-items: center;

			.operationIconItem {
				margin-right: 64rpx;
				padding: 6rpx 0;
				position: relative;
				text-align: center;
				image {
					width: 48rpx;
					height: 48rpx;
				}

				.txt {
					font-size: 24rpx;
					color: #333;
				}
				
				button{
					position: absolute;
					left: 0;
					top: 0;
					height: 94rpx;
					opacity: 0;
				}
			}
		}

		.operationBtn {
			width: 172rpx;
			height: 64rpx;
			line-height: 64rpx;
			text-align: center;
			font-size: 28rpx;
			color: #fff;
			background: #ff2d2d;
			margin-top: 14rpx;
		}
	}
</style>
