<template>
	<view class="">
		<view class="headerMember">
			<view class="card" :style="userInfo.is_vip == 0 ? '' : 'background: linear-gradient(65deg,#f5f5f5 0%,' + userInfo.vip_color + ' 100%);'">
				<view class="myLevel">
					<view class="cardInfo">
						<view class="userHead">
							<image class="pic" :src="userInfo.head_img" mode=""></image>
						</view>
						<view class="userInfo">
							<view class="userName singleHide">
								{{userInfo.nick_name}}
							</view>
							<view class="userIdentity" v-if="userInfo.is_store == 1">
								商家
							</view>
						</view>
					</view>
					<view class="memberLevel" v-if="userInfo.is_vip == 0">
						您还未开通会员
					</view>
					<view class="memberLevel" v-else>
						您的{{userInfo.vip_name}}会员于{{userInfo.vip_end_time}}到期
					</view>
				</view>
				<view class="memberImg">
					<image class="pic" src="../../../static/open-member.png" mode=""></image>
				</view>
			</view>
		</view>
		
		<!-- <view class="memberMain" :style="isIphoneX ? 'padding-bottom: 166rpx;' : 'padding-bottom: 98rpx;'"> -->
		<view class="memberMain">
			<view class="memberType">
				<swiper class="swiperView" @change="changeLevel" :current="current" :circular="true" next-margin="99" :interval="2000" :duration="1000">
					<swiper-item v-for="(item,index) in membetType" :key="index">
						<view :class="current == index ? 'swiper-item currentCard' : 'swiper-item'" :style="'background: linear-gradient(65deg,#f5f5f5 0%,' + item.color + ' 100%);'">
							<view class="cardInfo">
								<view class="openPrice">
									<text>{{Number(item.money).toFixed(0)}}</text>元
								</view>
								<view class="openLevel">
									{{item.vip_name}} 
								</view>
								<view class="openRights">
									({{item.vip_des}})
								</view>
							</view>
							<view class="openMemberImg">
								<image class="pic" src="../../../static/open-member.png" mode=""></image>
							</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
			<view class="memberRights">
				<view class="rightsTitle">
					会员权益
				</view>
				<view class="rightsContent">
					<!-- <view class="rightsItem">
						1、查看商家联系方式
					</view>
					<view class="rightsItem">
						2、发布部分信息免费
					</view>
					<view class="rightsItem">
						3、查看全部工厂信息
					</view> -->
					<text class="rightsItem">
						{{rightsInfo}}
					</text>
				</view>
			</view>
			<view class="advertisement" v-if="bannerInfo.banner_img">
				<image class="pic" :src="www + bannerInfo.banner_img" mode=""></image>
			</view>
		</view>
		
		<!-- <view class="bottomOperation" :style="isIphoneX ? 'height: 166rpx;' : 'height: 98rpx;'"> -->
		<view class="bottomOperation">
			<view class="payMoney">
				合计：<text>￥</text><text class="price">{{membetType[current].money}}</text>
			</view>
			<view class="payBtn" @click="openMember">
				{{userInfo.is_vip == 0 ? '开通' : '续费'}}
			</view>
		</view>
	</view>
</template>

<script>
	let app = getApp();
	import http from "@/utils/http.js";
	export default{
		data(){
			return {
				isIphoneX: false, // iphoneX手机
				www: http.rootDocument,
				
				membetType: [],
				current: 0, // 默认选中的
				
				bannerInfo: {},
				rightsInfo: '', // 会员权益
				
				userInfo: {},
			}
		},
		onLoad() {
			this.isIphoneX = app.globalData.isIphoneX;
		},
		onShow() {
			let utoken = uni.getStorageSync('utoken');
			if(utoken){
				this.getUserInfo();
			}
			this.getMemberList()
		},
		methods:{
			// 切换选中的会员卡
			changeLevel(e){
				this.current = e.detail.current
			},
			
			// 获取用户信息
			getUserInfo(){
				let that = this;
				http.postJSON('api/User/getUserInfo',{},function(res){
					console.log(res,'用户信息');
					if(res.code == 200){
						that.userInfo = res.data;
						let arr = res.data.vip_time.split(' ');
						that.userInfo.vip_end_time = arr[0];
					}else if(res.code == 2){
						console.log('登录过期');
						uni.navigateTo({
							url: '../../login/login'
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						setTimeout(function(){
							uni.navigateBack()
						},500)
					}
					
				})
			},
			
			// 获取会员列表
			getMemberList(){
				let that = this;
				http.postJSON('api/vip/queryVipList',{},function(res){
					console.log(res,'会员列表');
					that.bannerInfo = res.data.banner;
					that.rightsInfo = res.data.vipContent;
					
					that.membetType = res.data.list;
				})
			},
			
			// 开通会员
			openMember(){
				let that = this;
				let id = this.membetType[this.current].id;
				http.postJSON('api/vip/openVip',{
					id: id
				},function(res){
					console.log(res,'开通会员');
					if (res.code == 200) {
						uni.getProvider({ //获取支付类型
							service: 'payment',
							success(reson) {
								uni.hideLoading()
								uni.requestPayment({ //下面参数为必传
									provider: reson.provider[0], //支付类型
									timeStamp: res.data.timestamp,
									nonceStr: res.data.nonceStr,
									package: res.data.package,
									signType: res.data.signType,
									paySign: res.data.paySign,
									success(res) {
										uni.showToast({
											title: '支付成功',
											icon: 'none',
											duration: 2000
										})
										that.getUserInfo()
									},
									fail(err) {
										uni.showToast({
											title: '取消支付',
											icon: 'none',
											duration: 2000
										})
									}
								})
							}
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.headerMember{
		width: 750rpx;
		height: 320rpx;
		background: #333333;
		padding: 30rpx 60rpx;
		.card{
			width: 630rpx;
			height: 260rpx;
			border-radius: 20rpx;
			background: linear-gradient(67deg,#ffffff 2%, #bcbcbc 100%);
			position: relative;
			padding: 20rpx;
			.cardInfo{
				display: flex;
				align-items: center;
				.userHead{
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
					overflow: hidden;
					margin-right: 20rpx;
				}
				.userInfo{
					.userName{
						max-width: 220rpx;
						font-size: 36rpx;
						color: #333;
					}
					.userIdentity{
						width: 72rpx;
						height: 32rpx;
						background: #333333;
						border-radius: 8rpx;
						text-align: center;
						line-height: 32rpx;
						font-size: 24rpx;
						color: #FFB82D;
						margin-top: 20rpx;
					}
				}
			}
			.memberLevel{
				font-size: 28rpx;
				color: #333;
				position: absolute;
				left: 20rpx;
				bottom: 20rpx;
			}
			.memberImg{
				position: absolute;
				right: 20rpx;
				top: 20rpx;
				width: 166rpx;
				height: 150rpx;
			}
		}
	}

	.memberMain{
		padding: 20rpx 30rpx;
		height: calc(98rpx + env(safe-area-inset-bottom));
		.memberType{
			width: 100%;
			height: 220rpx;
			margin-bottom: 40rpx;
			.swiperView{
				width: 100%;
				height: 220rpx;
				swiper-item{
					width: 482rpx;
					height: 220rpx;
					.swiper-item{
						width: calc(100% - 40rpx);
						height: 100%;
						background: linear-gradient(65deg,#eaccaa 0%, #e3c6a6 1%, #cfb094 100%);
						border-radius: 20rpx;
						overflow: hidden;
						position: relative;
						transition: all .2s;
						
						.cardInfo{
							width: 100%;
							height: 100%;
							padding: 30rpx;
							.openPrice{
								font-size: 30rpx;
								color: #333;
								text{
									font-size: 64rpx;
									color: #000;
								}
							}
							.openLevel,.openRights{
								font-size: 28rpx;
								color: #333;
							}
						}
						.openMemberImg{
							position: absolute;
							top: 30rpx;
							right: 30rpx;
							width: 166rpx;
							height: 150rpx;
						}
					}
					.currentCard{
						border: 4rpx solid #FF5555;
					}
					.mount{
						// background: linear-gradient(65deg,#eaccaa 0%, #e3c6a6 1%, #cfb094 100%);
						background: linear-gradient(65deg,#f5f5f5 0%, #cfb094 100%);
					}
					.quarter{
						background: linear-gradient(65deg,#f5f5f5 0%, #949494 100%);
						// background: linear-gradient(65deg,#bebebe 0%, #bfbfbf 1%, #949494 100%);
					}
					.halfYear{
						background: linear-gradient(65deg,#e5c177 0%, #e3c6a6 1%, #d19d52 100%);
					}
					.year{
						background: linear-gradient(65deg,#7ce8f6 0%, #5ed0f4 100%);
					}
				}
			}
		}
		.memberRights{
			width: 690rpx;
			min-height: 360rpx;
			background: #ffffff;
			border-radius: 10rpx;
			box-shadow: 0rpx 0rpx 16rpx 0rpx rgba(0,0,0,0.10); 
			margin-bottom: 40rpx;
			.rightsTitle{
				font-size: 36rpx;
				color: #333;
				padding: 16rpx 20rpx;
				border-bottom: 2rpx solid #EBEBEB;
			}
			.rightsContent{
				padding: 20rpx;
				.rightsItem{
					font-size: 28rpx;
					color: #333;
					line-height: 48rpx;
					text-indent: 1em;
				}
			}
		}
		.advertisement{
			width: 690rpx;
			height: 240rpx;
			border: 20rpx;
			overflow: hidden;
			margin-bottom: 40rpx;
			image{
				border-radius: 20rpx;
			}
		}
	}

	.bottomOperation{
		width: 750rpx;
		height: 98rpx;
		background: #ffffff;
		box-shadow: 0rpx 0rpx 8rpx 2rpx rgba(0, 0, 0, 0.25);
		padding: 20rpx 30rpx;
		position: fixed;
		left: 0;
		bottom: 0;
		height: calc(98rpx + env(safe-area-inset-bottom));
		display: flex;
		justify-content: flex-end;
		.payMoney{
			font-size: 24rpx;
			color: #666;
			margin-top: 12rpx;
			text{
				color: #FF2D2D;
				margin-left: 10rpx;
			}
			.price{
				font-size: 32rpx;
				margin-left: 0;
			}
		}
		.payBtn{
			width: 136rpx;
			height: 64rpx;
			background: #ff4646;
			border-radius: 32rpx;
			font-size: 28rpx;
			color: #fff;
			text-align: center;
			line-height: 64rpx;
			margin-left: 40rpx;
		}
	}
</style>
