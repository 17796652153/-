<template>
	<view style="padding:0 30rpx;">
		<!-- 提现 -->
		<view class="withdrawal">
			<view class="title">提现方式</view>
			<view class="switchBtn">
				<view :class="activeType == 0 ? 'switchItem activeType' : 'switchItem'" @click="activeType = 0">支付宝</view>
				<view :class="activeType == 1 ? 'switchItem activeType' : 'switchItem'" @click="activeType = 1">微信</view>
			</view>
		</view>
		<view class="withdrawal">
			<view class="title">到账账户</view>
			<view class="switchBtn">
				<input type="number" style="color: #333;" value="0.00" v-model.number="account" placeholder="请输入提现到账账号" />
			</view>
		</view>
		<view class="withdrawal-money">
			<view class="W-title">提现金额</view>
			<view class="W-switchBtn">
				<image src="../../../static/price.png"></image>
				<input type="number" v-model="writeNum" class="moneyNum" />
			</view>
			<view class="w-bottom">
				当前余额{{money}}，<text @click="allWithdrawal">全部提现</text>
			</view>

			<view class="w-tips">提现会扣取0.01%的手续费</view>
		</view>

		<!-- 按钮 -->
		<view class="btn" @click="withdrawal">提现</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default{
		data(){
			return {
				activeType: 0,
				
				writeNum: 0,
				money: '',
				account: '', // 提现账户
				
				information: {}, // 用户信息
				
				type: 'user',
			}
		},
		onLoad(options) {
			if(options.type){
				this.type = options.type;
				// 查询商家金额
				let that = this;
				http.postJSON('api/Store/getStoreMoney',{},function(res){
					if(res.code == 200){
						that.money = res.data.store_money;
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						setTimeout(function(){
							uni.navigateBack()
						},800)
					}
					
				})
				return
			}
			
			this.information = uni.getStorageSync('information');
			if(!this.information){
				this.getUserInfo();
				return
			}
			this.money = this.information.user_money;
		},
		methods:{
			// 全部提现
			allWithdrawal(){
				this.writeNum = this.money
			},
			
			// 获取用户信息
			getUserInfo(){
				let that = this;
				http.postJSON('api/User/getUserInfo',{},function(res){
					if(res.code == 200){
						that.information = res.data;
						that.money = res.data.user_money;
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						setTimeout(function(){
							uni.navigateBack()
						},800)
					}
				})
			},
			
			// 提现
			withdrawal(){
				
				if(Number(this.writeNum) * 100 <= 0){
					uni.showToast({
						title: '提现金额必须大于0',
						icon: 'none'
					})
					return
				}
				if(Number(this.writeNum) * 100 > Number(this.money) * 100){
					uni.showToast({
						title: '提现金额不能大于余额',
						icon: 'none'
					})
					return
				}
				if(!this.account){
					uni.showToast({
						title: '请填写到账到户',
						icon: 'none'
					})
					return
				}
				
				if(this.type == 'store'){
					// 商家提现
					http.postJSON('api/Store/applyWithdraw',{
						type: Number(this.activeType) + 1,
						account: this.account,
						money: this.writeNum
					},function(res){
						if(res.code == 200){
							uni.showToast({
								title: '提现成功,请耐心等待',
								icon: 'none',
								duration: 2000
							})
							setTimeout(function(){
								uni.redirectTo({
									url: "./withdrawalOk"
								})
							},2000)
						}else{
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					})
					return
				}
				
				http.postJSON('api/User/applyWithdraw',{
					type: Number(this.activeType) + 1,
					account: this.account,
					money: this.writeNum
				},function(res){
					if(res.code == 200){
						uni.showToast({
							title: '提现成功,请耐心等待',
							icon: 'none',
							duration: 2000
						})
						setTimeout(function(){
							uni.redirectTo({
								url: "./withdrawalOk"
							})
						},2000)
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
				return
				
			},
		}
	}
</script>

<style lang="less">
	
	.withdrawal{
	  width: 100%;
	  height: 112rpx;
	  line-height: 112rpx;
	  border-bottom: 2rpx solid #E5E5E5;
	  display: flex;
	  align-items: center;
	}
	.title{
	  width: 200rpx;
	  color: #333333;
	  font-size: 28rpx;
	}
	.switchBtn{
	  display: flex;
	  align-items: center;
	  height: 100%;
	  width: 100%;
	  color: #999;
	}
	.switchItem{
	  width: 112rpx;
	  height: 48rpx;
	  opacity: 1;
	  background: #f5f5f5;
	  font-size: 24rpx;
	  border-radius: 4rpx;
	  text-align: center;
	  line-height: 48rpx;
	  color: #999999;
	  margin: 0 10rpx;
	}
	.activeType{
	  width: 112rpx;
	  height: 48rpx;
	  opacity: 1;
	  line-height: 44rpx;
	  border: 2rpx solid #FF2D2D;
	  border-radius: 4rpx;
	  color: #FF2D2D;
	  background-color: #fff;
	}
	.switchBtn input{
	  font-size: 28rpx;
	  color: #999;
	  width: 100%;
	  height: 100%;
	}
	
	.withdrawal-money{
	  width: 610rpx;
	  opacity: 1;
	}
	.moneyNum{
	  font-size: 72rpx;
	  color: red;
	}
	.W-title{
	  font-size: 28rpx;
	  color: #000;
	  margin: 20rpx 0;
	}
	.W-switchBtn{
	  border-bottom: 2rpx solid #e5e5e5;
	  display: flex;
	  align-items: flex-end;
	}
	.W-switchBtn image{
	  width: 114rpx;
	  height: 72rpx;
	  opacity: 1;
	}
	.W-switchBtn input{
	  height: 70rpx;
	  margin-left: 20rpx;
	}
	.w-bottom{
	  font-size: 32rpx;
	  color: #999;
	  margin: 20rpx 0;
	}
	.w-bottom text{
	  color: #FF4F4F;
	}
	.w-tips{
	  font-size: 24rpx;
	  color: #333;
	  margin-top: 70rpx;
	}
	.btn{
	  width: 400rpx;
	  height: 100rpx;
	  opacity: 1;
	  border-radius: 55rpx;
	  background-color: #FF2D2D;
	  text-align: center;
	  line-height: 100rpx;
	  font-size: 34rpx;
	  color: #fff;
	  margin: 120rpx auto;
	}
	
	
	.moneyDetails{
	  text-align: center;
	  color: #999;
	}
</style>
