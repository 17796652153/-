<template>
	<view class="myFollow">
		<view class="followList" v-if="followList.length > 0">
			<view class="followItem baseflex" v-for="(item,index) in followList" :key="index">
				<view class="followUser">
					<image :src="item.head_img" mode="aspectFill"></image>
					<text class="singleHide">{{item.nick_name}}</text>
				</view>
				<view class="followEdit" v-if="item.is_like == 1" @click="clickFollow(item.id, item.is_like, index)">
					取消关注
				</view>
				<view class="followEdit cancelFollow" v-else @click="clickFollow(item.id, item.is_like, index)">
					关注
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无关注
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js";
	export default {
		data() {
			return {
				page: 1,
				last_page: 1,
				total: 0,
				followList: [],
			}
		},
		onLoad() {
			this.getFollowList()
		},
		methods: {
			getFollowList() {
				let that = this;
				http.postJSON('api/Video/queryUserFocusList', {
					page: this.page,
				}, function(res) {
					if (res.code == 200) {
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						res.data.data.forEach(item => {
							item.is_like = 1
						})
						that.followList = that.followList.concat(res.data.data);
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},

			// 点击关注 or 取消关注
			clickFollow(id, is_like, index) {
				let currentUser = this.followList[index];

				if (is_like == 1) { // 点击取消关注
					uni.showModal({
						title: '是否取消关注？',
						success(res) {
							if (res.confirm) {
								console.log('用户点击确定');
								http.postJSON('api/Video/cancelFocusUser',{
									user_id: id
								},function(res){
									if(res.code == 200){
										currentUser.is_like = 0;
									}else{
										uni.showToast({
											title: res.msg,
											icon: 'none'
										})
									}
								})
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						},

					})
				} else { // 点击关注
					http.postJSON('api/Video/focusUser',{
						user_id: id
					},function(res){
						if(res.code == 200){
							currentUser.is_like = 1;
							uni.showToast({
								title: '关注成功',
								icon: 'none'
							})
						}else{
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					})
					
				}
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getFollowList()
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
			this.followList = [];
			this.getFollowList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page {
		background-color: #f5f5f5;
	}

	.followItem {
		padding: 0 50rpx;
		height: 100rpx;
		background-color: #fff;

		.followUser {
			display: flex;
			align-items: center;

			image {
				width: 60rpx;
				height: 60rpx;
				margin-right: 20rpx;
				border-radius: 50%;
			}

			text {
				font-size: 28rpx;
				color: #333;
				max-width: 240rpx;
			}
		}

		.followEdit {
			padding: 8rpx 20rpx;
			font-size: 28rpx;
			color: #999;
			background-color: #E5E5E5;
			border-radius: 22px;
		}

		.cancelFollow {
			background-color: #FF2D2D;
			color: #fff;
		}
	}
</style>
