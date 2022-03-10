<template>
	<view class="main">
		<view class="bgImg">
			<image class="pic" src="../../static/programBg.png" mode=""></image>
		</view>
		<view class="programInfo">
			<view class="programLogo">
				<image class="pic" src="../../static/programLogo.png" mode=""></image>
			</view>
			<view class="programName">
				电商
			</view>
			<view class="programTitle">
				一家有温度的多商户平台
			</view>
		</view>
		<view class="operation">
			<view class="loginBtn operationBtn" @click="login">
				微信授权登录
			</view>
			<view class="cancelBtn operationBtn" @click="cancelLogin">
				取消
			</view>
			<view class="agreement">
				<radio-group>
					<label class="radio">
						<radio value="read" :checked="checke" @click="changeRead" color="#FF2D2D" />
						<view class="content">
							我已认真阅读并同意<text @click.stop="jumpAgreement(5)">《电商用户协议》</text><text @click.stop="jumpAgreement(6)">《电商隐私政策》</text>
						</view>
					</label>
				</radio-group>
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data() {
			return {
				checke: false,
				up_user_id: '', // 上级id
				coupon_no: '', // 优惠券码
			}
		},
		onLoad(options) {
			if(options.uid){
				this.up_user_id = options.uid;
				this.coupon_no = options.coupon_no || '';
			}
		},
		methods: {
			changeRead() {
				this.checke = !this.checke;
			},
			
			// 查看协议
			jumpAgreement(type){
				uni.navigateTo({
					url: '../agreement/agreement?type=' + type
				})
			},
			
			login(){
				if(!this.checke){
					uni.showToast({
						title: '请先阅读并同意协议',
						icon: 'none'
					})
					return
				}
				let that = this;
				let userAddrInfo = {
					lat: '',
					lng: '',
					address: '',
					city: '',
					district: '',
				}
				let tempAd_info = uni.getStorageSync('tempAd_info');
				if(tempAd_info){
					let newCode = tempAd_info.city_code.slice(tempAd_info.nation_code.length)
					userAddrInfo.lat = tempAd_info.location.lat;
					userAddrInfo.lng = tempAd_info.location.lng;
					userAddrInfo.address = tempAd_info.name;
					userAddrInfo.district = tempAd_info.adcode;
					userAddrInfo.city = newCode;
				}
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
									district: userAddrInfo.district,
									up_user_id: that.up_user_id,
								},function(result){
									console.log(result,'resultresult');
									uni.hideLoading()
									if(result.code == 200){
										uni.setStorageSync('utoken',result.data.utoken);
										uni.setStorageSync('token','api');
										that.getUserInfo(result.data.utoken)
										
										uni.showToast({
											title: '登陆成功',
											icon: 'none',
											duration: 2000
										})
										if(that.up_user_id !== ''){
											setTimeout(function(){
												uni.navigateTo({
													url: '../merchant/merchantSettled?coupon_no=' + that.coupon_no + '&type=settled'
												})
											},2000)
											return
										}
										setTimeout(function(){
											uni.navigateBack()
										},2000)
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
						uni.setStorageSync('openid',res.data.openid)
						uni.setStorageSync('information',res.data);
						uni.setStorageSync('user_id',res.data.id)
					}else if(res.code == 2){
						console.log('登录过期');
						that.login()
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
					
				})
			},
			
			// 取消登录
			cancelLogin(){
				uni.navigateBack()
			},
		},
	}
</script>

<style>
	.main {
		position: relative;
		width: 100%;
		height: 100vh;
	}

	.bgImg {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
	}

	.programInfo {
		position: absolute;
		top: 200rpx;
		left: 0;
		width: 100%;
	}

	.programLogo {
		width: 160rpx;
		height: 160rpx;
		border-radius: 20rpx;
		margin: 0 auto;
	}

	.programLogo image {
		text-align: center;
	}

	.programName {
		font-size: 40rpx;
		color: #808080;
		font-weight: 600;
		margin: 40rpx 0 20rpx;
		text-align: center;
	}

	.programTitle {
		font-size: 28rpx;
		color: #333;
		max-width: 650rpx;
		text-align: center;
		margin: 0 50rpx;
	}

	.operation {
		position: absolute;
		top: 638rpx;
		left: 0;
		width: 100%;
		padding: 0 30rpx;
	}

	.operationBtn {
		width: 690rpx;
		height: 88rpx;
		text-align: center;
		line-height: 88rpx;
		font-size: 36rpx;
		color: #999;
		border-radius: 54rpx;
	}

	.loginBtn {
		color: #fff;
		background: #01ad19;
		margin-bottom: 40rpx;
	}

	.cancelBtn {
		border: 2rpx solid #999999;
		margin-bottom: 80rpx;
	}

	.radio {
		display: flex;
		align-items: flex-start;
	}

	.radio radio {
		transform: scale(.6);
	}

	.radio .content {
		color: #999;
		font-size: 28rpx;
	}

	.radio .content text {
		color: #FF4747;
	}
</style>
