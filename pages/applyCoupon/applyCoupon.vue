<template>
	<view class="">
		<view class="refundBox">
			<view class="refundType flexBox">
				<view class="title">
					申请类型
				</view>
				<view class="content">
					优惠券额度
				</view>
			</view>
			<view class="refundType flexBox">
				<view class="title">
					申请原因
				</view>
				<view class="content">
					邀请商家优惠券
				</view>
			</view>
		</view>
		
		<view class="refundBox">
			<view class="refundPrice">
				<view class="title">
					申请金额
				</view>
				<view class="content">
					￥<input type="text" placeholder="0.00" v-model="applyMoney" />
				</view>
			</view>
		</view>
		
		<view class="refundBox">
			<view class="refundPrice">
				<view class="title">
					使用限制 (需入驻年限不少于<text style="color: #FF2D2D;">{{yearArr[yearIdx].name}}</text>才可使用)
				</view>
				<view class="content ">
					<picker class="selPicker" mode="selector" :range="yearArr" range-key="name" @change="selectYear($event)">
						<view>{{yearArr[yearIdx].name}}</view>
						<image src="../../static/icon_arrow-down.png" mode=""></image>
					</picker>
				</view>
			</view>
		</view>
		
		<view class="refundBox">
			<view class="refundPrice">
				<view class="title">
					申请个数
				</view>
				<view class="content" @click="getInputNum">
					<input
						class="input"
						type="number"
						placeholder="1"
						maxlength="12"
						:focus="inputFocusNum"
						@blur="inputBlurNum"
						v-model.number="applyNum"
						:style="{ width: inputWidNum(applyNum) }"
					/> <text>天</text>
				</view>
			</view>
		</view>
		
		<view class="refundBox">
			<view class="refundPrice">
				<view class="title">
					有效使用期限 (申请成功<text style="color: #FF2D2D;">{{applyDay}}天</text>后过期)
				</view>
				<view class="content" @click="getInputFocus">
					<input
						class="input"
						type="number"
						placeholder="1"
						maxlength="12"
						:focus="inputFocus"
						@blur="inputBlur"
						v-model.number="applyDay"
						:style="{ width: inputWid(applyDay) }"
					/> <text>天</text>
				</view>
			</view>
		</view>
		
		<view class="refundBox">
			<view class="refundReason">
				<view class="title">
					申请说明
				</view>
				<view class="content">
					<textarea v-model="explain" placeholder="请您详细填写申请说明" />
				</view>
			</view>
		</view>
		
		<view class="refundBtn" @click="submitApply" v-if="!id">
			提交申请
		</view>
		<view class="refundBtn" @click="submitApply" v-else>
			修改申请
		</view>
		
		<!-- 首次进入弹窗 -->
		<showModel 
			:showModel="showModel"
			:title="'您还不是代理商无法申请优惠券，是否申请 成为代理商？'" 
			@cancel="cancel" 
			@confirm="confirm"
		></showModel>
	</view>
</template>

<script>
	import showModel from "../../components/showModel/showModel.vue";
	import http from "@/utils/http.js";
	export default {
		components: {
			showModel
		},
		data(){
			return {
				yearArr: [], // 使用限制
				yearIdx: 0,
				
				applyMoney: '', // 申请金额
				applyNum: 1, // 申请张数
				applyDay: 1, // 申请有效期限
				explain: '', // 申请说明
				
				showModel: false, // 显示弹窗
				inputFocus: false ,// 有效期限聚焦
				inputFocusNum: false ,// 申请张数聚焦
				
				id: '', // 申请的id
			}
		},
		onLoad(options) {
			let utoken = uni.getStorageSync('utoken');
			if(utoken){
				this.getUserInfo();
			}
			this.getTimeLimit();
			
			console.log(options,'options');
			if(options.id){
				this.id = options.id;
				this.getCouponInfo()
			}
		},
		computed: {
			// input输入框宽度自适应
			inputWid() {
				return function(value) {
					return String(value).length * 24 + 'rpx';
				};
			},
			inputWidNum() {
				return function(value) {
					return String(value).length * 24 + 'rpx';
				};
			},
		},
		methods:{
			getInputFocus:function(){
				this.inputFocus = true;
			},
			inputBlur:function(){
				this.inputFocus = false;
				if(Number(this.applyDay) <= 0){
					this.applyDay = 1;
					uni.showToast({
						title: '最少为一天',
						icon: 'none'
					})
				}
			},
			getInputNum:function(){
				this.inputFocusNum = true;
			},
			inputBlurNum:function(){
				this.inputFocusNum = false;
				if(Number(this.applyNum) <= 0){
					this.applyNum = 1;
					uni.showToast({
						title: '最少为一张',
						icon: 'none'
					})
				}
			},
			// 获取用户信息
			getUserInfo(){
				let that = this;
				http.postJSON('api/User/getUserInfo',{},function(res){
					if(res.code == 200){
						if(res.data.agent_type == 0){
							that.showModel = true;
						}
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
			
			// 使用时间限制
			getTimeLimit(){
				let that = this;
				http.postJSON('api/store/openStoreMoney',{},function(res){
					that.yearArr = res.data
				})
			},
			
			// 获取优惠券信息
			getCouponInfo(){
				let that = this;
				http.postJSON('api/Agent/getAgentCoupon',{
					id: this.id
				},function(res){
					console.log(res,'优惠券信息');
					that.applyMoney = res.data.money;
					that.applyNum = res.data.num;
					that.applyDay = res.data.expire_days;
					that.explain = res.data.remark;
					
					if(that.yearArr.length > 0){
						that.yearArr.forEach((item,index) => {
							if(item.days == res.data.use_limit){
								console.log(index);
								that.yearIdx = index;
							}
						})
					}
				})
			},
			
			// 提交申请
			submitApply(){
				if(!this.applyMoney){
					uni.showToast({
						title: '请填写金额',
						icon: 'none'
					})
					return
				}
				
				if(!this.applyNum){
					uni.showToast({
						title: '请填写申请张数',
						icon: 'none'
					})
					return
				}
				
				if(!this.applyDay){
					uni.showToast({
						title: '请填写申请有效期',
						icon: 'none'
					})
					return
				}
				
				if(this.id){
					// 修改申请
					http.postJSON('api/agent/onceApplyCoupon',{
						id: this.id,
						reason: '邀请商家优惠券',
						money: this.applyMoney,
						year: this.yearArr[this.yearIdx].name,
						num: this.applyNum,
						expire: this.applyDay,
						remark: this.explain
					},function(res){
						console.log(res,'提交申请');
						if(res.code == 200){
							uni.showToast({
								title: '申请成功，请耐心等待',
								icon: 'none',
								duration: 2000
							})
							setTimeout(function(){
								uni.reLaunch({
									url: '../myApply/myApply'
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
			
				http.postJSON('api/agent/applyCoupon',{
					reason: '邀请商家优惠券',
					money: this.applyMoney,
					year: this.yearArr[this.yearIdx].name,
					num: this.applyNum,
					expire: this.applyDay,
					remark: this.explain
				},function(res){
					console.log(res,'提交申请');
					if(res.code == 200){
						uni.showToast({
							title: '申请成功，请耐心等待',
							icon: 'none',
							duration: 2000
						})
						setTimeout(function(){
							uni.redirectTo({
								url: '../myApply/myApply'
							})
						},2000)
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			
			// 选择限制
			selectYear(e){
				this.yearIdx = e.detail.value
			},
			
			// 取消
			cancel(){
				this.showModel = false;
				uni.switchTab({
					url: "../user/user"
				})
			},
			
			// 点击年限的确认
			confirm(){
				this.showModel = false;
				uni.navigateTo({
					url: "./applyAgent"
				})
			},
		}
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
		.refundType{
			width: 750rpx;
			height: 68rpx;
			line-height: 68rpx;
			background: #ffffff;
			padding-left: 30rpx;
			font-size: 28rpx;
			.title{
				color: #666;
				margin-right: 40rpx;
			}
			.content{
				color: #333;
			}
		}
		.flexBox{
			display: flex;
			align-items: center;
		}
		.refundPrice{
			padding: 20rpx 30rpx;
			.content{
				font-size: 42rpx;
				margin-top: 20rpx;
				.selPicker{
					width: 100%;
					position: relative;
					image{
						width: 40rpx;
						height: 40rpx;
						position: absolute;
						right: 0;
						top: 50%;
						transform: translateY(-50%);
					}
				}
				input{
					display: inline-block;
					vertical-align: middle;
				}
			}
		}
		.refundReason{
			padding: 20rpx 30rpx;
			.content{
				textarea{
					min-height: 160rpx;
					margin-top: 20rpx;
				}
			}
			
		}
	}
	
	.refundBtn{
		width: 650rpx;
		height: 88rpx;
		background: #ff2d2d;
		border-radius: 54rpx;
		line-height: 88rpx;
		text-align: center;
		position: fixed;
		bottom: 40rpx;
		left: 50%;
		transform: translateX(-50%);
		color: #fff;
		font-size: 36rpx;
	}
</style>
