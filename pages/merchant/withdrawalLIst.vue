<template>
	<view class="">
		<view class="historyList" v-if="withdrawalList.length > 0">
			<view class="historyItem" v-for="(item,index) in withdrawalList" :key="index">
				<view class="historyInfo baseflex">
					<view class="historyContent">
						<view class="contentTitle">余额提现</view>
						<view class="contentTime">提现时间：{{item.create_time}}</view>
						<view class="contentTime" v-if="item.comfirm_time">{{item.status == 3 ? '处理时间' : '到账时间'}}：{{item.comfirm_time}}</view>
					</view>
					<view class="historyMoney">
						<view class="">
							+{{item.money}}
						</view>
						<view class="withdrawalTips" style="color: #0FD0EB;" v-if="item.status == 1">待审核</view>
						<view class="withdrawalTips" style="color: #04B901;" v-else-if="item.status == 2">已提现</view>
						<view class="withdrawalTips" style="color: #FF2D2D;" v-else-if="item.status == 3">已拒绝</view>
					</view>
				</view>
				<view class="refuseReason" v-if="item.status == 3">
					<view class="refuseTitle">
						查看被拒原因
					</view>
					<view class="refuseTxt" id="reason" :animation="item.animationShow">
						BCABC节哀顺变刺激不刺激插件那是从今年参加南京城市那就吃你家是长三角才能搜承诺书
					</view>
					<view class="moreImg" @click="seekMore(index)">
						<image :animation="item.animationFlip" class="pic" src="../../static/icon_arrow-downGray.png" mode=""></image>
					</view>
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无纪录
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				page: 1,
				last_page: 1,
				total: 0,
				withdrawalList: [],
				
				animationFlip: {}, // 翻转动画
				animationShow: {}, // 显示动画
				showMoreGoods: false, // 显示更多
			}
		},
		onLoad() {
			this.getWithdrawalList()
		},
		methods:{
			// 获取拒绝的高度
			getFailHeight(id) {
				//代码演示
				const query = uni.createSelectorQuery().in(this);
				query.select(id).boundingClientRect(data => {
					console.log("得到布局位置信息" + JSON.stringify(data));
					console.log("节点高度" + data.height);
					this.reasonHeight = data.height
				}).exec();
				var animation2 = uni.createAnimation({
					duration: 0,
					timingFunction: 'ease',
				})
				this.animation2 = animation2;
				this.animation2.height(0).step();
				this.withdrawalList.forEach((item,index) => {
					if(item.status == 3){
						item.animationShow = this.animation2;
					}
				})
			},
			
			
			getWithdrawalList(){
				let that = this;
				http.postJSON('api/Store/queryWithdrawList',{
					status: 0,
					page: this.page,
				},function(res){
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.total = res.data.last_page;
					res.data.data.forEach(item => {
						item.animationFlip = {};
						item.animationShow = {};
						item.showMoreGoods = false;
					})
					
					that.withdrawalList = that.withdrawalList.concat(res.data.data);
					if(that.withdrawalList.length > 0){
						setTimeout(function() {
							that.getFailHeight('#reason')
						}, 0)
					}
				})
			},
			
			seekMore(idx) {
				let currentItem = this.withdrawalList[idx];
				this.$set(currentItem, 'showMoreGoods', !currentItem.showMoreGoods);
				
			
				var animation = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				var animation2 = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				this.animation = animation
				this.animation2 = animation2
				if (currentItem.showMoreGoods) {
					this.animation.rotate(180).step()
					this.animation2.height(this.reasonHeight).step()
				} else {
					this.animation.rotate(0).step()
					this.animation2.height(0).step()
				}
			
				this.$set(currentItem, 'animationFlip', this.animation.export());
				this.$set(currentItem, 'animationShow', this.animation2.export());
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getWithdrawalList()
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
			this.withdrawalList = [];
			this.getWithdrawalList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style>
	.historyList {
		padding: 0 30rpx;
	}
	
	.historyItem {
		width: 690rpx;
		opacity: 1;
		padding: 20rpx;
	}
	
	.historyInfo{
		
	}
	
	.contentTitle {
		color: #333;
		font-size: 28rpx;
		margin-bottom: 12rpx;
	}
	
	.contentTime {
		color: #999;
		font-size: 24rpx;
	}
	
	.historyMoney {
		
		color: #FF0000;
		font-size: 28rpx;
	}
	
	.subMoney {
		color: #333333;
	}
	
	.refuseTitle{
		font-size: 24rpx;
		color: #999;
		text-align: center;
		margin: 20rpx auto;
	}
	
	.refuseTxt{
		color: #FF2D2D;
		font-size: 24rpx;
		overflow: hidden;
	}
	
	.moreImg{
		width: 24rpx;
		height: 24rpx;
		margin: 0 auto;
	}
</style>
