<template>
	<view class="">
		<!-- 头部个人卡片 -->
		<view class="headerCard">
			<view class="headerUser baseflex" v-if="hasUserInfo">
				<view class="userInfo" @click="jumpInformation">
					<view class="userHead">
						<image class="pic" :src="userInfo.head_img" mode="aspectFill"></image>
					</view>
					<view class="userMember">
						<view class="identity">
							<view class="myMember" v-if="userInfo.is_vip == 1">
								<image src="../../static/icon_user-vip2.png" mode=""></image>
								<text>{{userInfo.vip_name}}会员</text>
							</view>
							<view class="myMember" v-else>
								<image src="../../static/icon_user-vipNull.png" mode=""></image>
								<text style="color: #BCBCBC;">非会员</text>
							</view>
							<view class="myIdentity" v-if="userInfo.is_store == 1">
								商家
							</view>
						</view>
						<view class="gender">
							<image v-if="userInfo.sex == 0" src="../../static/icon_sex-null.png" mode=""></image>
							<image v-else-if="userInfo.sex == 1" src="../../static/icon_sex-man.png" mode=""></image>
							<image v-else-if="userInfo.sex == 2" src="../../static/icon_sex-wuman.png" mode=""></image>
							<text>{{userInfo.nick_name}}</text>
						</view>
					</view>
				</view>
				<view class="headerEdit" @click="jumpInformation">
					<image class="pic" mode="aspectFit" src="../../static/icon_edit.png"></image>
				</view>
			</view>
			<view class="headerUser baseflex" v-else>
				<view class="userInfo" @click="login">
					<view class="userHead">
						<image class="pic" src="../../static/user-head.png" mode=""></image>
					</view>
					<view class="userMember">
						<view class="gender">
							<text>点击登录</text>
						</view>
					</view>
				</view>
			</view>
			<view class="honor baseflex">
				<view class="honorItem">
					<view class="honorName">
						粉丝
					</view>
					<view class="honorNum">
						{{workFeedbackInfo.focused || 0}}
					</view>
				</view>
				<view class="honorItem">
					<view class="honorName">
						获赞
					</view>
					<view class="honorNum">
						{{workFeedbackInfo.like || 0}}
					</view>
				</view>
				<view class="honorItem" @click="jumpFollowUser">
					<view class="honorName">
						关注
					</view>
					<view class="honorNum">
						{{workFeedbackInfo.focus || 0}}
					</view>
				</view>
			</view>
		</view>
		<view class="main">
			<!-- 会员 -->
			<view class="exhibition" v-if="hasUserInfo && userInfo.is_vip != 0" @click="jumpMember">
				<view class="exhibitionBg">
					<image class="pic" src="../../static/vip-bg.png" mode=""></image>
				</view>
				<text class="memberTxt" style="color: #333;">您已开通{{userInfo.vip_name}}会员，将拥有所有会员权益</text>
			</view>
			<!-- 非会员展示 -->
			<view class="exhibition" v-else @click="jumpMember">
				<view class="exhibitionBg">
					<image class="pic" src="../../static/unVip-bg.png" mode=""></image>
				</view>
				<text class="memberTxt">开通会员获得更多权益</text>
				<view class="openBtn">
					开通
				</view>
			</view>
			<!-- 我的钱包 -->
			<view class="shopcar">
				<view class="all">
					<text>我的余额</text>
					<view class="allgo" @click="jumpFundDetails">查看钱包明细
						<image src="../../static/icon_arrow-rightGray.png" mode=""></image>
					</view>
				</view>
				<view class="orderbox orderbox1" style="height:108rpx;">
					<view class="order1">
						资金（元）<text>{{userInfo.user_money || 0.00}}</text>
					</view>
					<view @click="jumpWithdrawal">
						<text class="btnsmall">提现</text>
					</view>
				</view>
			</view>
			<!-- 个人操作 - 优惠券浏览历史等 -->
			<view class="shopcar">
				<view class="imgcar1">
					<view class="cargo" @click="jumpCoupon">
						<image src="../../static/user_icon1.png" mode=""></image>
						<view>优惠券</view>
					</view>
					<view class="cargo" @click="jumpCollection">
						<image src="../../static/user_icon2.png" mode=""></image>
						<view>我的收藏</view>
					</view>
					<view class="cargo" @click="jumpShopFollow">
						<image src="../../static/user_icon3.png" mode=""></image>
						<view>店铺关注</view>
					</view>
					<view class="cargo" @click="jumpBrowse">
						<image src="../../static/user_icon4.png" mode=""></image>
						<view>浏览记录</view>
					</view>
				</view>
			</view>
			<!-- 我的订单 -->
			<view class="shopcar">
				<view class="all">
					<text>常用工具</text>
					<view class="allgo" @click="jumpOrder(0)">全部订单
						<image src="../../static/icon_arrow-redRight.png" mode=""></image>
					</view>
				</view>
				<view class="imgcar1">
					<view class="cargo" @click="jumpOrder(1)">
						<image src="../../static/user_order1.png" mode=""></image>
						<view>待付款</view>
					</view>
					<view class="cargo" @click="jumpOrder(2)">
						<image src="../../static/user_order2.png" mode=""></image>
						<view>待发货</view>
					</view>
					<view class="cargo" @click="jumpOrder(3)">
						<image src="../../static/user_order3.png" mode=""></image>
						<view>待收货</view>
					</view>
					<view class="cargo" @click="jumpOrder(4)">
						<image src="../../static/user_order4.png" mode=""></image>
						<view>售后</view>
					</view>
				</view>
			</view>
			<!-- 我的服务 -->
			<view class="shopcar">
				<view class="all">
					<text>常用工具</text>
				</view>
				<view class="imgcar1">
					<view class="cargo" @click="jumpInvitation">
						<image src="../../static/user_tool1.png" mode=""></image>
						<view>我的邀请</view>
					</view>
					<view class="cargo" @click="jumpAgent">
						<image src="../../static/user_tool2.png" mode=""></image>
						<view>代理商</view>
					</view>
					<view class="cargo" @click="jumpApply">
						<image src="../../static/user_tool3.png" mode=""></image>
						<view>我的申请</view>
					</view>
					<view class="cargo" @click="jumpSelfTakeOrder">
						<image src="../../static/user_tool4.png" mode=""></image>
						<view>自提订单</view>
					</view>
				</view>
				<view class="imgcar1">
					<view class="cargo" @click="jumpMerchant">
						<image src="../../static/user_tool5.png" mode=""></image>
						<view>收入流水</view>
					</view>
					<view class="cargo" @click="jumpVedio">
						<image src="../../static/user_tool6.png" mode=""></image>
						<view>我的视频</view>
					</view>
					<view class="cargo" @click="jumpWantBuy">
						<image src="../../static/user_tool7.png" mode=""></image>
						<view>求购信息</view>
					</view>
					<view class="cargo" @click="jumpInfoServer">
						<image src="../../static/user_tool8.png" mode=""></image>
						<view>信息服务</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				userInfo: {}, // 用户信息
				hasUserInfo: false, // 用户是否登录
				
				workFeedbackInfo: '', // 用户粉丝 点赞 关注量
			}
		},
		onLoad() {
			
		},
		onShow() {
			let utoken = uni.getStorageSync('utoken');
			if(utoken){
				this.hasUserInfo = true;
				this.getUserInfo(utoken)
			}
		},
		methods:{
			login(){
				let that = this;
				let userAddrInfo = {
					lat: '',
					lng: '',
					address: '',
					city: '',
					district: '',
				}
				let tempAd_info = uni.getStorageSync('tempAd_info');
				console.log(tempAd_info,'tempAd_info');
				
				if(tempAd_info){
					let newCode = tempAd_info.city_code.slice(tempAd_info.nation_code.length)
					userAddrInfo.lat = tempAd_info.location.lat;
					userAddrInfo.lng = tempAd_info.location.lng;
					userAddrInfo.address = tempAd_info.name;
					userAddrInfo.district = tempAd_info.adcode;
					userAddrInfo.city = newCode;
				}
				
				console.log(userAddrInfo,'userAddrInfo');
				// return
				uni.getUserProfile({
					desc: '用于完善用户信息',
					success(res) {
						// console.log(res,'登录');
						var userInfo = res.userInfo;
						uni.showLoading({
						  title: '加载中',
						})
						uni.login({
							success(req) {
								// console.log(req,'req');
								http.postJSON('api/Login/login',{
									code: req.code,
									nick_name: userInfo.nickName,
									head_img: userInfo.avatarUrl,
									lat: userAddrInfo.lat,
									lng: userAddrInfo.lng,
									address: userAddrInfo.address,
									city: userAddrInfo.city,
									district: userAddrInfo.district
								},function(result){
									console.log(result,'resultresult');
									uni.hideLoading()
									if(result.code == 200){
										uni.setStorageSync('utoken',result.data.utoken)
										uni.setStorageSync('token','api')
										that.getUserInfo(result.data.utoken)
										
									}
								})
							},
							fail(error) {
								console.log(error,'失败');
							}
						})
					},
					fail(err) {
						// 用户点了取消授权
						uni.showModal({
						  title: '警告',
						  content: '您点击了拒绝授权，将无法正常使用小程序，请授权之后再进入!!!',
						  showCancel: false,
						  confirmText: '返回授权',
						  success: function (res) {
						    // 用户没有授权成功，不需要改变 isHide 的值
						    if (res.confirm) {
						      console.log('用户点击了“返回授权”');
						    }
						  }
						})
					}
				})
			},
			
			// 获取用户信息
			getUserInfo(utoken){
				let that = this;
				http.postJSON('api/User/getUserInfo',{
					token: 'api',
					utoken: utoken
				},function(res){
					console.log(res,'用户信息');
					if(res.code == 200){
						that.userInfo = res.data;
						uni.setStorageSync('openid',res.data.openid)
						uni.setStorageSync('information',res.data);
						uni.setStorageSync('user_id',res.data.id)
						that.hasUserInfo = true;
						
						that.workFeedback()
					}else if(res.code == 2){
						console.log('登录过期');
						// that.login()
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
					
				})
			},
			
			// 查看作品反馈  用户粉丝量 关注量 点赞量
			workFeedback(){
				let that = this;
				http.postJSON('api/User/queryUserVideoInfo',{},function(res){
					if(res.code == 200){
						that.workFeedbackInfo = res.data;
						
						for (let k in that.workFeedbackInfo) {
							console.log(that.workFeedbackInfo[k],'that.workFeedbackInfo[k]');
							let calcNum = Number(that.workFeedbackInfo[k]);
							
							if(calcNum >= 10000){
								that.workFeedbackInfo[k] = (calcNum / 10000).toFixed(1) + 'W'
							}
						}
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			// 跳转个人资料
			jumpInformation(){
				uni.navigateTo({
					url: "./information/information"
				})
			},
			// 跳转我的关注
			jumpFollowUser(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: './myFollow/myFollow'
				})
			},
			// 跳转店铺关注
			jumpShopFollow(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../shopFollow/shopFollow"
				})
			},
			// 跳转优惠券
			jumpCoupon(){
				uni.navigateTo({
					url: "../coupon/coupon"
				})
			},
			// 跳转浏览历史
			jumpBrowse(){
				uni.navigateTo({
					url: "./myBrowse/myBrowse"
				})
			},
			// 跳转我的收藏
			jumpCollection(){
				// if(!this.hasUserInfo){
				// 	uni.showToast({
				// 		title: '请先登录',
				// 		icon: 'none'
				// 	})
				// 	return
				// }
				uni.navigateTo({
					url: "./myCollection/myCollection"
				})
			},
			// 跳转至提现余额
			jumpWithdrawal(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "./withdrawal/withdrawal"
				})
			},
			// 跳转查看钱包明细
			jumpFundDetails(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "./fundDetails/fundDetails"
				})
			},
			// 跳转我的申请
			jumpApply(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../myApply/myApply"
				})
			},
			// 跳转订单页面
			jumpOrder(idx){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../order/orderList?idx=" + idx
				})
			},
			// 跳转我的邀请
			jumpInvitation(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../myInvitation/myInvitation"
				})
			},
			// 跳转代理商
			jumpAgent(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				// uni.navigateTo({
				// 	url: "../applyCoupon/applyCoupon"
				// })
				// if(this.userInfo.agent_type != 0){
				// 	uni.showToast({
				// 		title: '您已是代理商，请勿重复申请',
				// 		icon: 'none'
				// 	})
				// 	return
				// }
				uni.navigateTo({
					url: '../applyCoupon/applyAgent'
				})
			},
			// 跳转自提订单
			jumpSelfTakeOrder(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../selfTakeOrder/selfTakeOrder"
				})
			},
			// 跳转收入流水
			jumpMerchant(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../merchant/merchant"
				})
			},
			// 跳转我的求购
			jumpWantBuy(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../wantBuy/myWantBuy"
				})
			},
			// 跳转信息服务
			jumpInfoServer(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "../infoServer/myInfoServer"
				})
			},
			// 跳转会员中心
			jumpMember(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "./openMember/openMember"
				})
			},
			// 跳转我的视频
			jumpVedio(){
				if(!this.hasUserInfo){
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "./myVedio/myVedio"
				})
			},
		}
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.headerCard{
		width: 750rpx;
		height: 298rpx;
		border-radius: 0rpx 0rpx 60rpx 60rpx;
		background-color: #FF2D2D;
		padding: 20rpx 30rpx;
	}
	.headerUser{
		align-items: flex-start;
		padding-bottom: 40rpx;
		border-bottom: 2rpx solid rgba(255,255,255,0.8);
		.userInfo{
			display: flex;
			align-items: center;
			.userHead{
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				overflow: hidden;
				margin-right: 20rpx;
			}
			
			.identity{
				display: flex;
				align-items: center;
				margin-bottom: 16rpx;
				.myMember{
					height: 28rpx;
					line-height: 24rpx;
					background: #333333;
					position: relative;
					margin-right: 20rpx;
					margin-left: 18rpx;
					text-align: right;
					padding-right: 8rpx;
					border-radius: 8rpx;
					image{
						position: absolute;
						left: -18rpx;
						top: 0;
						width: 28rpx;
						height: 28rpx;
					}
					text{
						font-size: 24rpx;
						color: #E5C177;
						margin-left: 18rpx;
					}
				}
				.myIdentity{
					width: 64rpx;
					height: 28rpx;
					background: #333333;
					border-radius: 8rpx;
					text-align: center;
					line-height: 28rpx;
					color: #FFB82D;
					font-size: 20rpx;
				}
			}
			.gender{
				image{
					width: 28rpx;
					height: 28rpx;
					margin-right: 20rpx;
				}
				text{
					color: #fff;
					font-size: 28rpx;
				}
			}
		}
		.headerEdit{
			width: 48rpx;
			height: 48rpx;
		}
	}
	.honor{
		justify-content: space-around;
		.honorItem{
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-top: 26rpx;
			.honorName,.honorNum{
				font-size: 24rpx;
				color: #fff;
				margin-bottom: 12rpx;
			}
		}
	}

	.main{
		padding: 0 30rpx 30rpx;
	}
	.exhibition{
		width: 690rpx;
		height: 108rpx;
		background: #f5f5f5;
		border-radius: 20rpx;
		box-shadow: 0rpx 0rpx 16rpx 0rpx rgba(0,0,0,0.10); 
		margin-top: 20rpx;
		position: relative;
		.exhibitionBg{
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
		}
		.memberTxt{
			font-size: 28rpx;
			color: #666;
			position: absolute;
			left: 20rpx;
			top: 50%;
			transform: translateY(-50%);
		}
		.openBtn{
			width: 96rpx;
			height: 44rpx;
			line-height: 44rpx;
			text-align: center;
			background: linear-gradient(114deg,#ff9c55, #ff2d2d 100%);
			border-radius: 22rpx;
			box-shadow: 0rpx 0rpx 16rpx 0rpx rgba(0,0,0,0.10);
			font-size: 28rpx;
			color: #fff;
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-50%);
		}
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
	
	.imgcar {
	   display: flex;
	   font-size: 26rpx;
	   font-family: PingFang SC, PingFang SC-Regular;
	   padding-bottom: 15rpx;
	}
	
	.cargo {
	   text-align: center;
	   flex: 1;
	}
	
	.cargofirst {
	   margin-left: 30rpx;
	}
	
	.cargolast {
	   margin-right: 0 !important;
	}
	
	.cargo image {
	   width: 52rpx;
	   height: 52rpx;
	}
	
	.orderbox {
	   display: flex;
	   align-items: center;
	   justify-content: space-between;
	}
	
	.order {
	   /* border: 1px solid #ebebeb; */
	   padding-bottom: 40rpx;
	}
	
	.order-top {
	   font-size: 36rpx;
	   font-family: PingFang SC, PingFang SC-Medium;
	   display: flex;
	   margin: 20rpx 30rpx 40rpx 50rpx;
	   justify-content: space-between;
	   align-items: center;
	}
	
	.order1 {
	   margin-left: 20rpx;
	}
	
	.order1 text {
	   color: #fe6668;
	   font-size: 48rpx;
	   font-family: PingFang SC, PingFang SC-Regular;
	}
	
	.btnsmall {
	   width: 96rpx;
	   height: 48rpx;
	   opacity: 1;
	   background: linear-gradient(297deg, #ff3e32 0%, #fb822a);
	   border-radius: 24rpx;
	   line-height: 48rpx;
	   font-size: 28rpx;
	   font-family: PingFang SC, PingFang SC-Medium;
	   color: #fff;
	   text-align: center;
	   margin-right: 20rpx;
	   display: inline-block;
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
	}
</style>
