<template>
	<view class="">
		<view class="collNum" v-if="total > 0">
			收藏 <text>{{total}}</text>
		</view>
		<view class="collShop" v-if="dataList.length > 0">
			<view class="goods" :animation="item.data.animationLate" v-for="(item,index) in dataList" :key="index">
				<view
					class="goodsContent" 
					@touchstart.stop="touchstart($event)" 
					@touchmove.stop="touchmove(index,$event)" 
					@touchend.stop="touchend(item.data.id)">
					<view class="shopGoods">
						<view class="goodsImg">
							<image class="pic" :src="www + item.data.goods_icon" mode=""></image>
						</view>
						<view class="goodsInfo">
							<view class="goodsName multiHide">
								{{item.data.goods_name}}
							</view>
							<view class="goodsOperation baseflex">
								<view class="goodsPrice">
									￥<text>{{item.data.goods_price}}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="operation">
					<view class="operationBox" @click="similar(item.data.cate_one,index)">
						找相似
					</view>
					<view class="operationBox operationDel" @click="delCollection(item.data.id,index)">
						删除
					</view>
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无收藏商品
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	export default {
		data() {
			return {
				dataList: [], // 我的收藏
				dragTargetX: 0, // 起始X坐标
				activeItem: null,
				threshold: 50, // 默认滑多长可以显示
				
				touchStart: 0, // 滑动起始
				
				animationLate: {}, // 动画 显示更多
				
				page: 1,
				last_page: 1,
				total: 0,
				www: http.rootDocument,
				
				hidePage: false, // 离开页面
			}
		},
		onShow() {
			this.getCollection()
		},
		methods: {
			getCollection(){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				http.postJSON('api/user/getUserLike',{
					type: 1,
					page: this.page
				},function(res){
					console.log(res,'我的收藏 -- 商品');
					if(res.code == 200){
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						that.dataList = that.dataList.concat(res.data.data);
						
						that.dataList.forEach(item => {
							that.$set(item.data, 'animationLate', {})
						})
					}else if(res.code == 2){
						uni.showToast({
							title: '请先登录',
							icon: 'none',
							duration: 2000
						})
						setTimeout(function(){
							uni.navigateTo({
								url: '../../login/login'
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
			
			
			
			touchstart(e) {
				this.dragTargetX = e.touches[0].pageX;
				
				this.touchStart = e.touches[0].pageX;
			},
			touchmove(index,e) {
				let newX = e.touches[0].pageX;
				
				this.activeItem = index
				this.dragTargetX = newX;
			},
			touchend(goodsType) {
				let touchdistance = parseInt(this.dragTargetX) - parseInt(this.touchStart)
				console.log(touchdistance,'滑动的距离',this.activeItem,'滑动的商品');
				if(touchdistance > 0){
					if(Math.abs(touchdistance) >= this.threshold){
						console.log('右滑距离大于50');
						var animation = uni.createAnimation({
						  duration: 400,
						  timingFunction: 'ease',
						})
						this.dataList.forEach((item,index) => {
							if(this.activeItem != null && this.activeItem == index){
								this.$set(item.data, 'animationLate', animation.translateX(0).step().export())
							}
						})
					}else{
						console.log('右滑距离小于50');
					}
				}else if(touchdistance < 0){
					if(Math.abs(touchdistance) >= this.threshold){
						console.log('左滑距离大于50');
						var animation = uni.createAnimation({
						  duration: 400,
						  timingFunction: 'ease',
						})
						this.dataList.forEach((item,index) => {
							if(this.activeItem != null && this.activeItem == index){
								this.$set(item.data, 'animationLate', animation.translateX('-240rpx').step().export())
							}else{
								this.$set(item.data, 'animationLate', animation.translateX(0).step().export())
							}
						})
					}else{
						console.log('左滑距离小于50');
					}
				}else{
					console.log('点击');
					this.jumpDetail(goodsType)
				}
			},
			
			// 查看详情
			jumpDetail(id){
				console.log(id,'点击查看详情');
				uni.navigateTo({
					url: "../../goods/details?id=" + id
				})
				
			},
			
			// 点击删除
			delCollection(id,index){
				let that = this;
				http.postJSON('api/user/likeGoods',{
					goods_id: id,
					is_like: 0
				},function(res){
					if(res.code == 200){
						uni.showToast({
							title: "删除成功",
							icon:"none"
						})
						that.dataList.splice(index,1)
					}
					else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			// 找相似
			similar(cate_one,index){
				console.log('找相似');
				uni.navigateTo({
					url: '../../search/searchGoods?cate_one=' + cate_one
				})
				var animation = uni.createAnimation({
				  duration: 400,
				  timingFunction: 'ease',
				})
				this.$set(this.dataList[index].data, 'animationLate', animation.translateX(0).step().export())
			},
			
			// 店铺详情
			jumpShophome(){
				uni.navigateTo({
					url: "../../shophome/shophome"
				})
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
				this.getCollection()
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
			this.dataList = [];
			this.getCollection();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	.collNum {
		width: 750rpx;
		height: 76rpx;
		line-height: 76rpx;
		padding-left: 30rpx;
		background: #ffffff;
		color: #333;
		font-size: 28rpx;
		margin-right: 20rpx;

		text {
			color: #FF0000;
			font-size: 28rpx;
			margin-left: 10rpx;
		}
	}

	.shopHeader {
		width: 750rpx;
		height: 68rpx;
		background: #ffffff;
		padding: 20rpx 50rpx 20rpx 30rpx;

		.shopName {
			font-size: 28rpx;
			color: #333;
		}

		.shopMore {
			width: 28rpx;
			height: 28rpx;
		}
	}

	.goods{
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		// transform: translateX(-248rpx);
		transform: translateX(0);
	}
	
	.goodsContent {
		padding: 0 30rpx 40rpx;
		width: 750rpx;
		flex-shrink: 0;
	}

	.shopGoods {
		display: flex;
		align-items: center;
		// padding: 20rpx 0;
		flex-shrink: 0;

		.goodsImg {
			width: 200rpx;
			height: 200rpx;
			border-radius: 8rpx;
			overflow: hidden;
			margin-right: 20rpx;
		}

		.goodsInfo {
			width: 418rpx;

			.goodsName {
				width: 420rpx;
				height: 70rpx;
				font-size: 28rpx;
				color: #333333;
			}

			.goodsSpec {
				height: 44rpx;
				line-height: 44rpx;
				background: #f5f5f5;
				border-radius: 4rpx;
				color: #999;
				font-size: 28rpx;
				position: relative;
				padding-right: 42rpx;
				padding-left: 12rpx;
				margin-top: 12rpx;

				text {
					margin-right: 20rpx;
				}

				image {
					width: 20rpx;
					height: 20rpx;
					position: absolute;
					right: 18rpx;
					top: 50%;
					transform: translateY(-50%);
				}
			}

			.goodsOperation {
				margin-top: 32rpx;

				.goodsPrice {
					font-size: 20rpx;
					color: #FF2D2D;

					text {
						font-size: 32rpx;
					}
				}
			}
		}

		.manufactor {
			width: 418rpx;

			.manufactorName {
				width: 420rpx;
				font-size: 36rpx;
				color: #333333;
			}

			.range {
				color: #28C50F;
				font-size: 28rpx;
				margin: 10rpx 0 26rpx;
			}

			.advantage {
				color: #333;
				font-size: 28rpx;

				text {
					margin-right: 20rpx;
				}
			}

			.goodsAddr {
				color: #999;
				font-size: 28rpx;

				text {
					margin-right: 20rpx;
					vertical-align: middle;
				}

				image {
					width: 28rpx;
					height: 28rpx;
					vertical-align: middle;
				}
			}
		}
	}

	.operation{
		display: flex;
		align-items: center;
		flex-shrink: 0;
		.operationBox{
			width: 124rpx;
			height: 260rpx;
			background: #ff2d2d;
			text-align: center;
			line-height: 240rpx;
			color: #fff;
			font-size: 28rpx;
		}
		.operationDel{
			background-color: #FD9E9E;
		}
	}
</style>
