<template>
	<view class="">
		<!-- 头部搜索框 -->
		<view class="searchHeader baseflex">
			<view class="search">
				<image src="../../static/icon_search-red.png" mode=""></image>
				<input type="text" v-model="searchGoods" placeholder="输入商品名称" @confirm="search"/>
			</view>
			<view class="searchBtn" @click="search">
				搜索
			</view>
		</view>
		
		<!-- 搜索历史 -->
		<view class="history">
			<view class="historyHeader baseflex" v-if="history.length > 0">
				<view class="historyTitle">
					历史搜索
				</view>
				<view class="empty" @click="emptyHistory">
					清空
				</view>
			</view>
			<view class="historyList">
				<view 
					class="historyItem" 
					v-for="(item,index) in history" 
					:key="index" 
					@touchstart="bindTouchStart" 
					@touchend="bindTouchEnd"
					
					@click="bindTap(item,index)"
					@longtap="bingLongTap(index)"
					>
					{{item}}
				</view>
			</view>
		</view>
	
		<!-- 清除搜索历史 单个 -->
		<showModel 
			:showModel="showModelSingle"
			:title="'确认删除该历史记录'"
			@cancel="cancel"
			@confirm="confirmSingle"
		></showModel>
		
		<!-- 清除搜索历史 全部 -->
		<showModel
			:showModel="showModelAll"
			:title="'确认删除全部历史记录'"
			@cancel="cancel"
			@confirm="confirmAll"
		></showModel>
	</view>
</template>

<script>
	import showModel from "../../components/showModel/showModel.vue"
	export default{
		components:{
			showModel
		},
		data(){
			return {
				searchGoods: '', // 搜索内容
				history: [], // 历史搜索
				showModelSingle: false, // 单个删除 弹窗
				showModelAll: false, // 全部删除 弹窗
				
				activeHistory: '', // 选中的删除历史
				
				startTime: 0,
				endTime: 0,
			}
		},
		onLoad() {
			this.history = uni.getStorageSync('history') || [];
		},
		methods:{
			bindTouchStart: function(e) {
			    this.startTime = parseInt(e.timeStamp);
			},
			bindTouchEnd: function(e) {
			    this.endTime = parseInt(e.timeStamp);
			},
			
			// 点击历史进行搜索
			bindTap: function(content,idx) {
			    if(this.endTime  - this.startTime < 350) {
			        let history = this.history;
			        console.log('点击搜索的是：' + content);
			        if(content != ''){
			        	history.splice(idx,1);
			        	
			        	history.unshift(content)
			        	this.history = history
			        	uni.setStorageSync('history',history)
			        	uni.navigateTo({
			        		url: "./searchGoods?searchContent=" + content
			        	})
			        	
			        	this.searchGoods = '';
			        }
			    }
			},
			// 长按显示弹窗
			bingLongTap: function(idx) {
			    this.showModelSingle = true;
			    this.activeHistory = idx
			},
			

			
			// 取消删除
			cancel(){
				this.showModelSingle = false;
				this.showModelAll = false;
			},
			
			// 确认删除单个
			confirmSingle(){
				this.history.splice(this.activeHistory,1);
				this.showModelSingle = false;
				uni.setStorageSync('history',this.history)
			},
			
			// 确认删除全部
			confirmAll(){
				this.showModelAll = false;
				this.history = [];
				uni.setStorageSync('history',[])
			},
			
			// 点击出现清空弹窗
			emptyHistory(){
				this.showModelAll = true;
			},
			
			// 搜索商品
			search(){
				let searchContent = this.searchGoods.trim();
				let history = this.history;
				
				let idx = history.indexOf(searchContent);
				
				if(searchContent!= ''){
					if(idx != -1){
						history.splice(idx,1);
					}
					history.unshift(searchContent)
					this.history = history
					uni.setStorageSync('history',history)
					
					uni.navigateTo({
						url: "./searchGoods?searchContent=" + searchContent
					})
					
					this.searchGoods = '';
				}
			},
		},
	}
</script>

<style lang="less">
	.searchHeader{
		padding: 20rpx 30rpx;
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

	.historyHeader{
		padding: 20rpx 50rpx 20rpx 30rpx;
		.historyTitle{
			font-size: 28rpx;
			color: #333;
		}
		.empty{
			font-size: 28rpx;
			color: #999;
		}
	}
	.historyList{
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		.historyItem{
			font-size: 24rpx;
			color: #999;
			padding: 8rpx 16rpx;
			background-color: #F5F5F5;
			border-radius: 8rpx;
			margin-right: 20rpx;
			margin-bottom: 20rpx;
			display: inline-block;
		}
	}
</style>
