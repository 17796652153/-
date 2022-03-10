<template>
	<view class="">
		<view class="headNavigation">
			<view :class="activeNav == 0 ? 'navItem activeNav' : 'navItem'" @click="changeNav(0)">邀请列表</view>
			<view :class="activeNav == 1 ? 'navItem activeNav' : 'navItem'" @click="changeNav(1)">邀请新人</view>
		</view>

		<!-- 邀请列表 -->
		<view class="invitationList" v-if="activeNav == 0">
			<block v-if="invitationList.length > 0">
				<view class="invitationItem baseflex" v-for="(item,index) in invitationList" :key="index">
					<view class="invitationInfo">
						<view class="infoImg">
							<image class="pic" :src="item.head_img" mode=""></image>
						</view>
						<view class="infoContent">
							<view class="name">
								{{item.nick_name}}
							</view>
							<view class="timer">
								{{item.create_time}}
							</view>
						</view>
					</view>
					<view class="invitationPrice add">
						＋{{item.money}}
					</view>
				</view>
			</block>
			<view class="goodsNull" v-else>
				暂无邀请人
			</view>
		</view>

		<!-- 邀请新人 -->
		<view class="invitationNews" v-if="activeNav == 1">
			<view class="title">
				是否赠送优惠券
			</view>
			<radio-group class="radioGroup" @change="radioChange">
				<label class="uni-list-cell uni-list-cell-pd">
					<view>
						<radio class="radio" color="#FF2D2D" value="0" :checked="0 == current" />
					</view>
					<view>是</view>
				</label>
				<label class="uni-list-cell uni-list-cell-pd">
					<view>
						<radio class="radio" color="#FF2D2D" value="1" :checked="1 == current" />
					</view>
					<view>否</view>
				</label>
			</radio-group>
		</view>
	
		<!-- 邀请新人 生成二维码 -->
		<view class="ewmBtn" v-if="activeNav == 1" @click="generateEwm">
			生成二维码
		</view>
		
		<!-- 首次进入弹窗 -->
		<showModel 
			:showModel="showModel"
			:title="'优惠券数量不够，是否重新申请'" 
			@cancel="cancel" 
			@confirm="confirm"
		></showModel>
	</view>
</template>

<script>
	import showModel from "../../components/showModel/showModel.vue"
	import http from "@/utils/http.js"
	export default {
		components: {
			showModel
		},
		data() {
			return {
				activeNav: 0, // 选中的头部导航
				type: 0,
				current: 1, // 单选
				
				showModel: false, // 显示弹窗
				
				haveCoupon: false, // 优惠券数量
				
				page: 1,
				last_page: 1,
				total: 0,
				invitationList: [],// 邀请列表
			}
		},
		onLoad() {
			this.getInvitationList();
			this.getCouponNum();
		},
		methods: {
			// 切换头部导航
			changeNav(idx) {
				this.activeNav = idx;
			},
			
			// 获取邀请列表
			getInvitationList(){
				let that = this;
				http.postJSON('api/agent/queryAgentUserList',{
					page: this.page,
				},function(res){
					console.log(res,'查询邀请列表');
					if(res.code == 200){
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						
						that.invitationList = that.invitationList.concat(res.data);
						console.log(that.invitationList,'invitationList');
					}else{
						uni.showModal({
							title: '提示',
							content: res.msg,
							cancelText: '取消',
							cancelColor: '#CCCCCC',
							success(result) {
								console.log(result, '成功');
								if(result.confirm){ // 点击确认
									uni.navigateTo({
										url: '../applyCoupon/applyAgent'
									})
								}else{ // 点击取消
									uni.navigateBack()
								}
							},
							fail(err) {
								console.log(err,'失败');
							}
						})
					}
				})
			},
			
			// 获取优惠券数量
			getCouponNum(){
				let that = this;
				http.postJSON('api/Agent/getCouponInfo',{},function(res){
					console.log(res,'获取优惠券数量');
					if(res.code == 200){
						// 有优惠券
						that.haveCoupon = true;
					}else{
						// 没有优惠券
						that.haveCoupon = false;
					}
				})
			},
			

			// 切换单选
			radioChange: function(evt) {
				console.log(evt);
				this.current = evt.detail.value
				if(evt.detail.value == 0){
					if(this.haveCoupon){
						return
					}
					this.showModel = true;
				}
			},
			
			// 取消
			cancel(){
				this.current = 1;
				this.showModel = false;
			},
			
			// 点击年限的确认
			confirm(){
				this.showModel = false;
				uni.navigateTo({
					url: "../applyCoupon/applyCoupon"
				})
			},
			
			// 生成二维码
			generateEwm(){
				let firstInvitation = uni.getStorageSync("firstInvitation") || '';
				if(false){
					this.showModel = true;
					return
				}
				uni.navigateTo({
					url: "./QRCode?is_use=" + this.current
				})
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getInvitationList()
			} else {
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
		onPullDownRefresh() {
			if(this.activeNav == 1){
				uni.stopPullDownRefresh();
				return
			}
			console.log('下拉刷新了');
			this.page = 1;
			this.invitationList = [];
			this.getInvitationList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.headNavigation {
		width: 750rpx;
		height: 92rpx;
		opacity: 1;
		background: #FFEBEB;
		display: flex;
	}

	.navItem {
		width: 50%;
		text-align: center;
		line-height: 92rpx;
		color: #999;
		font-size: 32rpx;
		position: relative;
	}

	.activeNav {
		color: #FF2D2D;
	}

	.activeNav::after {
		content: "";
		width: 32rpx;
		height: 8rpx;
		opacity: 1;
		background: #FF2D2D;
		border-radius: 12rpx;
		position: absolute;
		left: 50%;
		bottom: 8rpx;
		transform: translateX(-50%);
	}

	.invitationList {
		

		.invitationItem {
			background-color: #fff;
			padding: 20rpx 30rpx 20rpx 50rpx;

			.invitationInfo {
				display: flex;
				align-items: center;

				.infoImg {
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;
					border-radius: 50%;
					overflow: hidden;
				}

				.infoContent {
					.name {
						color: #333;
						font-size: 28rpx;
					}

					.timer {
						color: #999;
						font-size: 24rpx;
					}
				}
			}

			.invitationPrice {
				color: #333;
				font-size: 28rpx;
			}

			.add {
				color: #FF2D2D;
			}
		}
	}

	.invitationNews {
		width: 750rpx;
		height: 108rpx;
		background: #ffffff;
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;

		.radioGroup {
			display: flex;

			label {
				display: flex;
				margin-left: 40rpx;

				.radio {
					transform: scale(0.8);
					margin-right: 20rpx;
				}
			}
		}

		.title {
			font-size: 28rpx;
			color: #333;
		}
	}
	
	.ewmBtn{
		width: 400rpx;
		height: 100rpx;
		border-radius: 50rpx;
		background-color: #FF2D2D;
		color: #fff;
		font-size: 32rpx;
		text-align: center;
		line-height: 100rpx;
		margin: 220rpx auto;
	}
</style>
