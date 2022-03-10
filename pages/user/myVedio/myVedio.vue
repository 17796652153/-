<template>
	<view class="">
		<view class="videoList" v-if="videoList.length > 0">
			<view class="videoItem" v-for="(item,index) in videoList" :key="index" @click="seeVideo(item.id, index)">
				<image class="bgvideo" v-if="!item.isPlayer" :src="item.cover_url" mode="aspectFill"></image>
				<video
					class="bgvideo" 
					v-if="false"
					object-fit="contain" 
					play-btn-position="center"
					controls="false"
					show-fullscreen-btn="false"
					@play="playVedio()" 
					@pause="pauseVideo"
					@ended="endedVideo"
					@controlstoggl="controlstogglVideo"
					@fullscreenchange="fullscreenchangeVideo"
					autoplay="true" 
					:muted="muted"
					:src="item.video_url" 
					direction="0"></video>
				<view class="playNum">
					<image src="../../../static/icon_play.png" mode=""></image>
					<text>{{item.play_num}}</text>
				</view>
			</view>
		</view>
		
		<view class="goodsNull" v-else>
			暂无视频上传
		</view>
		
		
		<view class="videoBox" v-if="currentVideo != null">
			<video 
				:src="videoList[currentVideo].video_url" 
				:autoplay="true" 
				:id="videoList[currentVideo].id"
				object-fit="contain" 
				:controls="true"
				@click="tapVideoHover($event)"></video>
			<image src="../../../static/icon_left.png" @click="exitPlay" mode="aspectFill"></image>
				
			<!-- 播放状态：pause 的时候就会暂停 -->
			<view class="videoHover" @click="tapVideoHover($event)"
				:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px;'">
				<image v-if="player=='play'" class="playState" src="../../../static/player.png" mode=""></image>
			</view>
		</view>
		
			
		
		<!-- 提交按钮 -->
		<view class="confirmBtn" @click="jumpRepair">发布视频</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				videoList: [],
				page: 1,
				last_page: 1,
				total: 0,
				muted: true,
				
				currentVideo: null,
				player: 'pause',
				windowWidth: '', // 屏幕宽度
				windowHeight: '', // 屏幕高度
			}
		},
		onLoad() {
			this.getMyVideoList();
			// 获取屏幕宽高
			this.windowWidth = uni.getSystemInfoSync().windowWidth;
			this.windowHeight = uni.getSystemInfoSync().windowHeight;
		},
		methods:{
			// 获取我的视频列表
			getMyVideoList(){
				let that = this;
				http.postJSON('api/Video/queryVideoList',{},function(res){
					if(res.code == 200){
						that.page = res.data.page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						res.data.data.forEach(item => {
							item.isPlayer = false;
						})
						that.videoList = that.videoList.concat(res.data.data)
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			// 开始/继续播放时触发
			playVedio(){
				console.log('点击播放');
			},
			
			// 暂停播放时触发
			pauseVideo(){
				console.log('暂停播放');
			},
			
			// 视频播放到末尾时触发
			endedVideo(){
				console.log('视频播放结束');
			},
			
			// 切换显示controls控制器
			controlstogglVideo(){
				console.log('切换控制器');
			},
			
			// 进入或退出全屏时触发
			fullscreenchangeVideo(e){
				console.log(e);
				console.log('点击全屏');
				let fullScreen = e.detail.fullScreen; // 当前是否全屏
				this.muted = !fullScreen;
			},
			
			// 退出播放
			exitPlay(){
				this.currentVideo = null;
			},
			
			// 点击视频播放与暂停
			tapVideoHover(e){
				// console.log(e,'点击暂停');
				if(this.player == 'play'){
					this.player = 'pause'
				}else{
					this.player = 'play'
				}
				if (this.player == 'play') {
					console.log('点击暂停');
					uni.createVideoContext(this.videoList[this.currentVideo].id.toString(), this).pause(); // 播放时点击暂停
				}
				
				if (this.player == 'pause') {
					console.log('点击播放');
					uni.createVideoContext(this.videoList[this.currentVideo].id.toString(), this).play(); // 暂停是点击播放
				}
			},
			
			// 查看大屏
			seeVideo(id, index){
				let that = this;
				this.currentVideo = index;
				// if(this.videoList[index].isPlayer){
				// 	return
				// }
				http.postJSON('api/Video/playVideo',{
					id: id
				},function(res){
					if(res.code == 200){
						// that.videoList.forEach(item => {
						// 	item.isPlayer = false;
						// })
						// that.videoList[index].isPlayer = true;
						let play_num = that.videoList[index].play_num;
						that.videoList[index].play_num = Number(play_num) + 1;
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			jumpRepair(){
				console.log(456);
				uni.navigateTo({
					url: "./repairVedio"
				})
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getMyVideoList()
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
			this.videoList = [];
			this.getMyVideoList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	.videoList{
		padding: 0 30rpx 140rpx;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		.videoItem{
			width: 230rpx;
			height: 300rpx;
			background: #000000;
			border: 1rpx solid #ffffff;
			position: relative;
			background-color: #000;
			.bgvideo{
				width: 100%;
				height: 100%;
			}
			.playNum{
				position: absolute;
				right: 10rpx;
				bottom: 10rpx;
				display: flex;
				align-items: center;
				image{
					width: 24rpx;
					height: 24rpx;
					margin-right: 8rpx;
				}
				text{
					color: #fff;
					font-size: 24rpx;
				}
			}
		}
	}
	
	.videoBox{
		width: 100vw;
		height: 100vh;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 99;
		video{
			width: 100%;
			height: 100%;
		}
		image{
			width: 40rpx;
			height: 40rpx;
			position: absolute;
			left: 24rpx;
			top: 36rpx;
			z-index: 999;
		}
	}
	
	.videoHover {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	
		.playState {
			position: absolute;
			left: 50%;
			top: 50%;
			width: 100rpx;
			height: 100rpx;
			opacity: 0.85;
			transform: translateX(-50%) translateY(-50%);
		}
	}
	
	.confirmBtn {
		position: fixed;
		z-index: 9;
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
