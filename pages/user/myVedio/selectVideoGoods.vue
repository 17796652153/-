<template>
	<view class="">
		<!-- 头部搜索框 -->
		<view class="searchHeader baseflex">
			<view class="search">
				<image src="../../../static/icon_search-red.png" mode=""></image>
				<input type="text" v-model="searchGoods" @confirm="search" placeholder="输入商品名称"/>
			</view>
			<view class="searchBtn" @click="search">
				搜索
			</view>
		</view>
		
		<!-- 商品列表 -->
		<view class="goodsList" v-if="goodsList.length > 0">
			<view class="goodsItem baseflex" v-for="(item,index) in goodsList" :key="index" @click="selectGoods(index)">
				<view class="goodsSelect">
					<image class="pic" v-if="!item.checked" src="../../../static/icon_unSel.png" mode=""></image>
					<image class="pic" v-else src="../../../static/icon_sel.png" mode=""></image>
				</view>
				<view class="goodsContent baseflex">
					<view class="goodsImg">
						<image class="pic" :src="www + item.goods_icon" mode=""></image>
					</view>
					<view class="goodsName singleHide">
						{{item.goods_name}}
					</view>
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无商品
		</view>
		
		<!-- 提交按钮 -->
		<view class="confirmBtn" @click="jumpRepair">确定商品</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				searchGoods: '', // 搜索的商品
				www: http.rootDocument,
				goodsList: [], // 商品列表
				id: '', // 商品id
				firstEnter: true, // 第一次进入
				
				page: 1,
				last_page: 1,
				total: 0,
			}
		},
		onLoad(options) {
			this.getGoodsList();
			if(options.id){
				this.id = options.id;
			}
			
		},
		methods: {
			// 获取商品列表
			getGoodsList(){
				let that = this;
				http.postJSON('api/Video/queryStoreGoods',{
					goods_name: this.searchGoods,
					page: this.page
				},function(res){
					if(res.code == 200){
						that.total = res.data.total;
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						res.data.data.forEach(item => {
							item.checked = false
						})
						that.goodsList = that.goodsList.concat(res.data.data)
						
						if(that.id && that.firstEnter){
							that.goodsList.forEach(item => {
								console.log(item.id);
								if(that.id == item.id){
									console.log(item,'item');
									item.checked = true;
									that.firstEnter = false;
								}
							})
						}
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						
					}
				})
			},
			
			// 搜索商品
			search(){
				this.page = 1;
				this.goodsList = [];
				this.getGoodsList();
			},
			
			selectGoods(idx){
				this.goodsList.forEach((item,index) => {
					if(idx == index){
						item.checked = !item.checked
					}else{
						item.checked = false
					}
				})
			},
			
			jumpRepair(){
				this.goodsList.forEach((item,index) => {
					if(item.checked){
						uni.$emit("selGoods",{data: item,index: index});
						uni.navigateBack({
							delta: 1
						})
					}
				})
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getGoodsList()
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
			this.goodsList = [];
			this.getGoodsList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #F5F5F5;
	}
	
	.searchHeader{
		padding: 20rpx 30rpx;
		background-color: #fff;
		.search{
			width: 540rpx;
			height: 64rpx;
			background: #ffffff;
			border: 2rpx solid #ff2d2d;
			border-radius: 34rpx;
			position: relative;
			overflow: hidden;
			image{
				width: 40rpx;
				height: 40rpx;
				position: absolute;
				left: 20rpx;
				top: 12rpx;
			}
			input{
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				padding-left: 80rpx;
				padding-right: 30rpx;
				box-sizing: border-box;
			}
		}
		.searchBtn{
			width: 120rpx;
			height: 64rpx;
			background: linear-gradient(61deg,#ff8d4d 0%, #ee2b00 100%);
			border-radius: 10rpx;
			font-size: 28rpx;
			color: #fff;
			line-height: 64rpx;
			text-align: center;
		}
	}
	
	.goodsList{
		background-color: #fff;
	}
	.goodsItem{
		padding: 20rpx 30rpx;
		justify-content: flex-start;
		.goodsSelect{
			width: 32rpx;
			height: 32rpx;
		}
		.goodsContent{
			justify-content: flex-start;
			margin-left: 20rpx;
			.goodsImg{
				width: 80rpx;
				height: 80rpx;
				border-radius: 8rpx;
				overflow: hidden;
				margin-right: 20rpx;
			}
			.goodsName{
				color: #333;
				font-size: 36rpx;
				max-width: 450rpx;
			}
		}
	}
	
	.confirmBtn {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: 40rpx;
		width: 650rpx;
		height: 88rpx;
		opacity: 1;
		background: #FF2D2D;
		border-radius: 54rpx;
		font-size: 36rpx;
		color: #fff;
		text-align: center;
		line-height: 88rpx;
	}
</style>
