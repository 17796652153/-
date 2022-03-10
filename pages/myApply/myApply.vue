<template>
	<view class="">
		<view class="headerCategory">
			<view class="showCategory baseflex" @click="showMore = !showMore">
				<text>{{categoryList[activeCategory]}}</text>
				<image :class="showMore ? 'rotateTransform' : ''" src="../../static/apply_down.png" mode=""></image>
			</view>
			<view :class="showMore ? 'moreCategory' : 'moreCategory moreTransform'">
				<view :class="activeCategory == index ? 'moreItem activeMore' : 'moreItem'"
					v-for="(item,index) in categoryList" :key="index" @click="changeCategory(index)">
					<text>{{item}}</text>
				</view>
			</view>
		</view>
		<view class="headNavigation">
			<view :class="activeNav == 0 ? 'navItem activeNav' : 'navItem'" @click="changeNav(0)">全部</view>
			<view :class="activeNav == 1 ? 'navItem activeNav' : 'navItem'" @click="changeNav(1)">审核中</view>
			<view :class="activeNav == 2 ? 'navItem activeNav' : 'navItem'" @click="changeNav(2)">已通过</view>
			<view :class="activeNav == 3 ? 'navItem activeNav' : 'navItem'" @click="changeNav(3)">未通过</view>
		</view>

		<view class="applyStatus">
			<!-- 申请优惠券 -->
			<view class="applyAll" v-if="activeCategory == 0">
				<block v-if="couponList.length > 0">
					<view 
						v-for="(item,index) in couponList"
						:key="index"
						:class="{'applyItem': true, 'review': item.status == 1, 'success': item.status == 2, 'fail': item.status == 3}" >
						<view class="applyTitle">
							申请{{item.num}}张{{item.reason}}
						</view>
						<view class="statusBtn" v-if="item.status == 1">
							审核中
						</view>
						<view class="statusBtn" v-else-if="item.status == 2">
							已通过
						</view>
						<view class="refuse" v-else-if="item.status == 3">
							<view class="refuseTitle">
								查看被拒原因
							</view>
							<view class="reason" :id="'reasonCoupon' + index" :animation="item.animationShow">
								{{item.remark}}
							</view>
							<view class="moreImg" @click="seekMore(index)">
								<image :animation="item.animationFlip" class="pic" src="../../static/icon_arrow-downGray.png"
									mode=""></image>
							</view>
						</view>
						<view class="statusBtn" v-if="item.status == 3" @click="reapplyCoupon(item.id)">
							再次申请
						</view>
						<view class="statusBtn" style="color: #ccc;background: #f5f5f5;" v-else-if="item.status == 4">
							已过期
						</view>
					</view>
				</block>
				<view class="goodsNull" v-else>
					暂无申请纪录
				</view>
			</view>

			<!-- 代理申请 -->
			<view class="applyAll" v-else-if="activeCategory == 1">
				<block v-if="agentList.length > 0">
					<view 
						:class="{'applyItem': true, 'review': item.status == 1, 'success': item.status == 2, 'fail': item.status == 3}"
						v-for="(item,index) in agentList" 
						:key="index">
						<view class="applyTitle">
							申请成为{{item.agent_type == 1 ? '个人代理' : '区域代理'}}
						</view>
						<view class="statusBtn" v-if="item.status == 1">
							审核中
						</view>
						<view class="statusBtn" v-else-if="item.status == 2">
							已通过
						</view>
						<view class="refuse" v-else-if="item.status == 3">
							<view class="refuseTitle">
								查看被拒原因
							</view>
							<view class="reason" :id="'reasonAgent' + index" :animation="item.animationShow">
								{{item.remark}}
							</view>
							<view class="moreImg" @click="seekMore(index)">
								<image :animation="item.animationFlip" class="pic" src="../../static/icon_arrow-downGray.png"
									mode=""></image>
							</view>
						</view>
						<view class="statusBtn" v-if="item.status == 3" @click="reapply">
							再次申请
						</view>
					</view>
				</block>
				<view class="goodsNull" v-else>
					暂无申请纪录
				</view>
			</view>

			<!-- 提现申请 -->
			<view class="applyAll" v-else-if="activeCategory == 2">
				<block v-if="withdrawalList.length > 0">
					<view 
						:class="{'applyItem': true, 'review': item.status == 1, 'success': item.status == 2, 'fail': item.status == 3}"
						v-for="(item,index) in withdrawalList" :key="index">
						<view class="applyTitle">
							申请提现{{item.money}}元
						</view>
						<view class="statusBtn" v-if="item.status == 1">
							审核中
						</view>
						<view class="statusBtn" v-else-if="item.status == 2">
							已通过
						</view>
						<view class="refuse" v-else-if="item.status == 3">
							<view class="refuseTitle">
								查看被拒原因
							</view>
							<view class="reason" :id="'reasonWithdrawal' + index" :animation="item.animationShow">
								{{item.remark}}
							</view>
							<view class="moreImg" @click="seekMore(index)">
								<image :animation="item.animationFlip" class="pic" src="../../static/icon_arrow-downGray.png"
									mode=""></image>
							</view>
						</view>
						<view class="statusBtn" v-if="item.status == 3" @click="reapplyWithdrawal">
							再次申请
						</view>
					</view>
				</block>
				<view class="goodsNull" v-else>
					暂无申请纪录
				</view>
			</view>
		</view>

		<!-- 弹窗  选择年份 -->
		<showModel :showModel="showYearModel" :showPicker="true" :selectArr="timerArr" :currentIdx="timerIdx"
			:title="'请选择入驻年限'" @selectArrs="selectTime" @cancel="cancel" @confirm="confirmYear"></showModel>

		<!-- 弹窗  优惠券 -->
		<showModel :showModel="showCouponModel" :showInput="true" :title="'请输入优惠券码'" @cancel="cancel"
			@confirm="confirmCoupon"></showModel>
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
				categoryList: ['优惠券申请', '代理申请', '提现申请'],
				activeCategory: 0,
				showMore: false,

				activeNav: 0, // 选中的头部导航
				animationFlip: {}, // 翻转动画
				animationShow: {}, // 显示动画
				showMoreGoods: false, // 显示更多

				showYearModel: false, // 显示年限弹窗
				showCouponModel: false, // 显示优惠券弹窗
				timerIdx: 0, // 选择的年份
				timerArr: ['一年', '两年', '三年'],

				agentList: [], // 代理申请列表
				couponList: [], // 优惠券申请列表
				withdrawalList: [], // 提现申请列表
				
				firstFailHeight: true, // 第一次加载拒绝的高度

				page: 1,
				last_page: 1,
				total: 0,
			}
		},
		onLoad() {
			if (this.activeCategory == 1) {
				this.getAgentApply()
			} else if (this.activeCategory == 0) {
				this.getCouponApply()
			} else {
				this.getWithdrawalApply()
			}

		},
		methods: {
			// 切换头部导航
			changeNav(idx) {
				this.activeNav = idx;
				this.page = 1;
				if (this.activeCategory == 1) {
					this.agentList = [];
					this.getAgentApply()
				} else if (this.activeCategory == 0) {
					this.couponList = [];
					this.getCouponApply()
				} else {
					this.withdrawalList = [];
					this.getWithdrawalApply()
				}
			},

			// 切换分类
			changeCategory(idx) {
				this.activeCategory = idx;
				this.showMore = false;
				this.firstFailHeight = true;
				this.page = 1;
				if (this.activeCategory == 1) {
					this.agentList = [];
					this.getAgentApply()
				} else if (this.activeCategory == 0) {
					this.couponList = [];
					this.getCouponApply()
				} else {
					this.withdrawalList = [];
					this.getWithdrawalApply()
				}
			},

			// 获取拒绝的高度
			getFailHeight(id) {
				var animation2 = uni.createAnimation({
					duration: 0,
					timingFunction: 'ease',
				})
				this.animation2 = animation2
				this.animation2.height(0).step();
				
				let data = [];
				if (this.activeCategory == 0) {
					data = this.couponList;
				} else if (this.activeCategory == 1) {
					data = this.agentList;
				} else {
					data = this.withdrawalList;
				}
				
				data.forEach((item,index) => {
					if(item.status == 3){
						item.animationShow = this.animation2;
						console.log('#' + id + index);
						//代码演示
						const query = uni.createSelectorQuery().in(this);
						query.select('#' + id + index).boundingClientRect(dataInfo => {
							console.log("得到布局位置信息" + JSON.stringify(dataInfo));
							console.log("节点高度" + dataInfo.height);
							item.reasonHeight = dataInfo.height
						}).exec();
					}
				})
			},

			// 查看申请代理列表
			getAgentApply() {
				let that = this;
				if (this.hidePage) {
					this.hidePage = false;
					return
				}
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/agent/queryAgent', {
					status: this.activeNav,
					page: this.page
				}, function(res) {
					console.log(res, '查看申请代理列表');
					uni.hideLoading()
					if (res.code == 200) {
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						res.data.data.forEach(item => {
							item.animationFlip = {};
							item.animationShow = {};
							item.showMoreGoods = false;
						})

						that.agentList = that.agentList.concat(res.data.data);
						if(that.agentList.length > 0){
							setTimeout(function() {
								that.getFailHeight('reasonAgent')
							}, 0)
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},


			// 查看申请优惠券列表
			getCouponApply() {
				let that = this;
				if (this.hidePage) {
					this.hidePage = false;
					return
				}
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/agent/queryCouponList', {
					status: this.activeNav,
					page: this.page
				}, function(res) {
					console.log(res, '查看申请优惠券列表');
					uni.hideLoading()
					if (res.code == 200) {
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						res.data.data.forEach(item => {
							item.animationFlip = {};
							item.animationShow = {};
							item.showMoreGoods = false;
						})

						that.couponList = that.couponList.concat(res.data.data);
						if(that.couponList.length > 0){
							setTimeout(function() {
								that.getFailHeight('reasonCoupon')
							}, 0)
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},

			// 查看申请提现列表
			getWithdrawalApply() {
				let that = this;
				if (this.hidePage) {
					this.hidePage = false;
					return
				}
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/User/queryWithdrawList', {
					status: this.activeNav,
					page: this.page
				}, function(res) {
					console.log(res, '查看申请提现列表');
					uni.hideLoading()
					if (res.code == 200) {
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						res.data.data.forEach(item => {
							item.animationFlip = {};
							item.animationShow = {};
							item.showMoreGoods = false;
						})
						
						that.withdrawalList = that.withdrawalList.concat(res.data.data);
						if(that.withdrawalList.length > 0){
							setTimeout(function() {
								that.getFailHeight('reasonWithdrawal')
							}, 0)
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},


			seekMore(idx) {
				let data = [];
				if (this.activeCategory == 0) {
					data = this.couponList;
				} else if (this.activeCategory == 1) {
					data = this.agentList;
				} else {
					data = this.withdrawalList;
				}
				let currentItem = data[idx];
				this.$set(currentItem, 'showMoreGoods', !currentItem.showMoreGoods);
				console.log(currentItem,'currentItem');
				
				var animation = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				var animation2 = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				this.animation = animation
				this.animation2 = animation2;
				if (currentItem.showMoreGoods) {
					this.animation.rotate(180).step()
					this.animation2.height(data[idx].reasonHeight).step()
				} else {
					this.animation.rotate(0).step()
					this.animation2.height(0).step()
				}
				this.$set(currentItem, 'animationFlip', this.animation.export());
				this.$set(currentItem, 'animationShow', this.animation2.export());

				
			},

			// 再次申请 代理
			reapply(){
				uni.navigateTo({
					url: '../applyCoupon/applyAgent?reapply=' + true
				})
			},
			
			// 再次申请 优惠券
			reapplyCoupon(id){
				uni.navigateTo({
					url: '../applyCoupon/applyCoupon?id=' + id
				})
			},
			
			// 再次申请 提现
			reapplyWithdrawal(){
				uni.navigateTo({
					url: '../user/withdrawal/withdrawal'
				})
			},
			

			// 支付入驻金
			paySettled() {
				this.showYearModel = true
			},

			// 选择年限
			selectTime(data) {
				console.log(data);
				this.timerIdx = data
			},

			// 取消
			cancel() {
				this.showCouponModel = false;
				this.showYearModel = false;
			},

			// 点击年限的确认
			confirmYear() {
				this.showYearModel = false;
				this.showCouponModel = true
			},

			// 点击优惠券的确认
			confirmCoupon(data) {
				console.log(data);
				this.showCouponModel = false
			},

		},
		onHide() {
			console.log('离开页面');
			this.hidePage = true;
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				if (this.activeCategory == 1) {
					this.getAgentApply()
				} else if (this.activeCategory == 0) {
					this.getCouponApply()
				} else {
					this.getWithdrawalApply()
				}
			} else {
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
		onPullDownRefresh() {
			console.log('下拉刷新了');
			this.page = 1;
			if (this.activeCategory == 1) {
				this.agentList = [];
				this.getAgentApply()
			} else if (this.activeCategory == 0) {
				this.couponList = [];
				this.getCouponApply()
			} else {
				this.withdrawalList = [];
				this.getWithdrawalApply()
			}
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	.showCategory {
		width: 750rpx;
		background: #ffebeb;
		padding: 30rpx 50rpx;
		font-size: 32rpx;
		color: #FF2D2D;
		position: relative;
		z-index: 9;
	}

	.showCategory image {
		width: 24rpx;
		height: 24rpx;
		transition: all 0.3s;
	}

	.moreCategory {
		position: absolute;
		top: 92rpx;
		left: 0;
		z-index: 1;
		width: 100%;
		background-color: #FFEBEB;
		opacity: 1;
		transition: all 0.6s;
	}

	.moreTransform {
		transform: translateY(-400rpx);
		opacity: 0;
	}

	.rotateTransform {
		transform: rotate(180deg);
	}

	.moreCategory .moreItem {
		color: #FF2D2D;
		font-size: 32rpx;
		padding: 30rpx 50rpx;
		transition: all 0.3s;
	}

	.moreCategory .activeMore {
		background-color: #fff;
		padding-left: 60rpx;
		transition: all 0.3s;
	}




	.headNavigation {
		width: 750rpx;
		height: 92rpx;
		opacity: 1;
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


	.applyStatus {
		padding: 40rpx 30rpx;

		.applyItem {
			width: 690rpx;
			min-height: 140rpx;
			background: #ffffff;
			border-radius: 30rpx;
			box-shadow: 0rpx 0rpx 8rpx 0rpx rgba(0, 0, 0, 0.10);
			position: relative;
			padding: 20rpx;
			margin-bottom: 40rpx;
			overflow: hidden;

			.applyTitle {
				font-size: 32rpx;
				color: #333;
			}

			.statusBtn {
				line-height: 28rpx;
				padding: 10rpx 20rpx;
				background: #dbfbff;
				border-radius: 30rpx;
				text-align: center;
				color: #0FD0EB;
				font-size: 28rpx;
				position: absolute;
				right: 20rpx;
				top: 72rpx;
			}

			&::after {
				content: "";
				position: absolute;
				left: -164rpx;
				top: -92rpx;
				width: 236rpx;
				height: 168rpx;
				background: #11d8f3;
				filter: blur(150rpx);
			}
		}

		.fail {
			padding-bottom: 25rpx;

			.statusBtn {
				background-color: #FFE3E3;
				color: #FF2D2D;
			}

			.refuse {
				margin-top: 88rpx;

				.refuseTitle {
					color: #999;
					font-size: 24rpx;
					text-align: center;
					margin-bottom: 20rpx;
				}

				.reason {
					color: #FF2D2D;
					font-size: 24rpx;
					overflow: hidden;
				}

				.moreImg {
					width: 100%;
					text-align: center;
					image{
						margin-top: 20rpx;
						width: 24rpx;
						height: 24rpx;
						margin: 0 auto;
					}
				}
			}

			&::after {
				content: "";
				background: #FF2D2D;
			}
		}

		.success {
			.statusBtn {
				background-color: #D8FFD8;
				color: #04B901;
			}

			&::after {
				content: "";
				background: #05E500;
			}
		}
	}

	.mask {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.60);
		z-index: 99;
	}

	.model {
		position: fixed;
		left: 50%;
		top: 40%;
		z-index: 999;
		transform: translateX(-50%) translateY(-40%);
		width: 488rpx;
		background: #ffffff;
		border-radius: 10rpx;

		.title {
			font-size: 32rpx;
			color: #333;
			padding: 20rpx;
		}

		.content {
			margin-left: 20rpx;
			width: 448rpx;
			height: 56rpx;
			background: #f5f5f5;
			border-radius: 8rpx;
			margin-bottom: 35rpx;
			position: relative;

			font-size: 24rpx;

			.selPicker {
				display: inline-block;
				height: 100%;
				width: 100%;
				padding: 16rpx 20rpx;
				box-sizing: border-box;
			}

			image {
				position: absolute;
				top: 16rpx;
				right: 20rpx;
				width: 24rpx;
				height: 24rpx;
			}
		}

		.operation {
			height: 80rpx;
			width: 100%;
			border-top: 2rpx solid #EBEBEB;
			display: flex;
			align-items: center;
			justify-content: space-around;

			view {
				flex: 1;
				font-size: 32rpx;
				text-align: center;
			}

			.cancel {
				color: #999999
			}

			.confirm {
				color: #FF2D2D;
			}
		}
	}
</style>
