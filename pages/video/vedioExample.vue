<template>
	<!-- 插件地址 https://ext.dcloud.net.cn/plugin?id=5656 -->
	<view>
		<swiper 
			:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px;'" 
			:vertical="true" 
			@change="change" 
			:current="current" 
			:indicator-dots="false"
		>
			<swiper-item v-for="(list,index) in dataList">
				<view>
					<!-- 
					1.v-if：用于控制视频在节点的渲染数
					2.muted的默认值是 false，代表默认是禁音视频的
					3.http-cache默认开启视频缓存
					4.poster（封面（方案一））：这里的封面默认处理存储在阿里云的视频
					5.show-loading：这里默认去掉播放转圈的标志
					 -->
					<video
					v-if="Math.abs(k-index)<=1"
					:id="list._id"
					:loop="true"
					:muted="list.isplay"
					:controls="false"
					:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px;'"
					:http-cache="true"
					:page-gesture="false"
					:show-fullscreen-btn="false"
					:show-loading="false"
					:show-center-play-btn="false"
					:enable-progress-gesture="false"
					:poster="list.src+'?x-oss-process=video/snapshot,t_100,f_jpg'"
					:src="list.src"
					@ended="ended"
					@click="tapVideoHover(list.state,$event)"
					></video>
					<!-- 
					1.这里是封面（方案二）：这里的封面可以自定义。
					2.也在代码中做了批注，两种方案可以共存，不会相互影响。
					-->
					<image
					v-if="!list.playIng"
					:src="list.src+'?x-oss-process=video/snapshot,t_100,f_jpg'"
					:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; position: absolute;'"
					mode="aspectFit"
					></image>
				</view>
				<!-- 播放状态：pause 的时候就会暂停 -->
				<view class="videoHover" @click="tapVideoHover(list.state,$event)" :style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px;'">
					<image v-if="list.state=='pause'" class="playState" src="../../static/player.png"></image>
				</view>
				<view class="userInfo">
					<!-- 1.头像 -->
					<image @click="tozuozhe" class="userAvatar" :src="list.href" mode="aspectFill"></image>
					<!-- 2.点赞 -->
					<view @click="cLike(list.like);" style="opacity: 0.9; margin-top: 17px;">
						<image v-if="list.like" src="../../static/icon_follow-video.png" style="width: 40px; height: 40px; position: absolute; right: 6px;"></image>
						<image v-if="!list.like" src="../../static/icon_unFollow-video.png" style="width: 40px; height: 40px; position: absolute; right: 6px;"></image>
						<text style="color: #FFFFFF; margin-top: 5px; font-size: 14px; text-align: center; margin-top: 40px; font-weight: bold;" :class="{'likeNumActive':list.like}">{{list.like_n}}</text>
					</view>
					<!-- 3.评论 -->
					<view class="comment" @click="toComment(index)" style="opacity: 0.9; margin-top: 17px;">
						<image src="../../static/icon_news.png" style="width: 35px; height: 35px; position: absolute; right: 7px;"></image>
						<text style="color: #FFFFFF; margin-top: 5px; font-size: 14px; font-weight: bold; text-align: center; margin-top: 40px;">{{list.sms_n}}</text>
					</view>
					<!-- 4.分享 -->
					<view @click="share" style="opacity: 0.9; margin-top: 17px;">
						<image src="../../static/icon_share.png" style="width: 40px; height: 40px; position: absolute; right: 5px;"></image>
						<text style="color: #FFFFFF; margin-top: 5px; font-size: 14px; text-align: center; font-weight: bold; margin-top: 40px;">分享</text>
					</view>
				</view>
				<!-- 最底下的文字部分 -->
				<view class="content">
					<text class="userName" :style="'width: '+ (windowWidth - 90) +'px;'">{{list.title}}</text><!-- i={{i}} -->
					<text class="words" :style="'width: '+ (windowWidth - 90) +'px;'">{{list.msg}}-{{k+1}}</text><!-- k={{k}} -->
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import userList from '../../utils/data.js'//这个是假数据
	export default {
		data() {
			return {
				windowWidth: 0,
				windowHeight: 0,
				dataList: [],
				k: 0,
				oldVideo: "",
				voice: "",
				timeout: "",
				current: 0,
				boxStyle:{//视频，图片封面样式🌟💗
					'height': 0,
					'width': 0,
				}
			}
		},
		watch:{
			k(k,old_k){
				console.log(k)
				this.dataList[old_k].playIng = false//如果视频暂停，就加载封面
				this.dataList[old_k].isplay = true
				this.dataList[old_k].state = 'pause'
				uni.createVideoContext(this.dataList[old_k]._id,this).play()
				clearTimeout(this.oldVideo)
				this.oldVideo = setTimeout(()=>{
					uni.createVideoContext(this.dataList[old_k]._id,this).seek(0)
					uni.createVideoContext(this.dataList[old_k]._id,this).pause()
					console.log('预留第' + (old_k + 1) + '个视频：' + this.dataList[old_k]._id)
				},500)
				// 2.0版本已经去掉了下面这一句，视频不用暂停，只需要把声音禁止就行
				// uni.createVideoContext(this.dataList[old_k]._id + '' + old_k,this).stop()//如果视频暂停，那么旧视频停止，这里的this.dataList[old_k]._id + '' + old_k，后面加 old_k 是为了每一个视频的 id 值不同，这样就可以大程度的避免串音问题
				console.log('已经暂停 --> 第' + (old_k + 1) + '个视频～')//提示
				this.dataList[k].state = 'play'
				uni.createVideoContext(this.dataList[k]._id,this).play()
				clearTimeout(this.voice)
				this.voice = setTimeout(()=>{
					this.dataList[k].isplay = false
				},300)
				setTimeout(()=>{
					this.dataList[k].playIng = true
				},850)
				//【2.0版本更新内容】- start
				var p = k
				++p
				setTimeout(()=>{
					uni.createVideoContext(this.dataList[p]._id,this).play()
				},20)
				clearTimeout(this.timeout)
				this.timeout = setTimeout(()=>{
					uni.createVideoContext(this.dataList[p]._id,this).seek(0)
					uni.createVideoContext(this.dataList[p]._id,this).pause()
					console.log('预加载第' + (p + 1) + '个视频：' + this.dataList[p]._id)
				},1800)
			}
		},
		onLoad() {
			this.windowWidth = uni.getSystemInfoSync().windowWidth
			this.windowHeight = uni.getSystemInfoSync().windowHeight
			this.boxStyle.width = this.windowWidth + 'px'//给宽度加px
			this.boxStyle.height = this.windowHeight + 'px'//可以自行更改视频高度，想视频不那么高，就把0改大一点
			this.get() //刚进入页面加载数据
		},
		methods: {
			ended(){
				// 1.播放当前视频结束时触发，自动切换下一个视频
				this.current = this.k+1
			},
			//点击播放&&暂停
			tapVideoHover(state,event){
				console.log('state--',state);
				if(state=='play'||state=='continue'){
					this.dataList[this.k].state = 'pause';
				}else{
					this.dataList[this.k].state = 'continue';
				}
				if(this.dataList[this.k].state == 'continue'){
					uni.createVideoContext(this.dataList[this.k]._id,this).play();//暂停以后继续播放
				}
				if(this.dataList[this.k].state == 'pause'){
					uni.createVideoContext(this.dataList[this.k]._id,this).pause();//暂停以后继续播放
				}
			},
			change(event){
				this.k = event.detail.current
				this.current = this.k
				// 1.这里进行判断，如果是最后一个视频就进入 get() 方法加载视频进入列表
				if(this.k == this.dataList.length - 1){
					this.get()
				}
			},
			get(){
				// 1.这里引入后端请求数据
				var msg = userList
				// 2.这里把视频添加到视频列表
				for (let i = 0; i < 10; i++) {
					this.dataList.push(msg[i])
				}
				// 3.播放当前视频
				setTimeout(()=>{
					this.dataList[this.k].isplay = false
					this.dataList[this.k].state = 'play'
					uni.createVideoContext(this.dataList[this.k]._id,this).play()
					this.dataList[this.k].playIng = true
				},200)
				// start - 预加载开始
				var p = this.k
				++p
				setTimeout(()=>{
					uni.createVideoContext(this.dataList[p]._id,this).play()
				},20)
				clearTimeout(this.timeout)
				this.timeout = setTimeout(()=>{
					uni.createVideoContext(this.dataList[p]._id,this).seek(0)
					uni.createVideoContext(this.dataList[p]._id,this).pause()
					console.log('预加载第' + (p + 1) + '个视频：' + this.dataList[p]._id)
				},1500)
				// end - 预加载结束
			},
			toComment(index){
				
			}
		}
	}
</script>

<style>
	.container {background-color: #000000;}
	.item {
		/* width : 750rpx; */
		background-color: #000000;
		position: relative;
	}
	.videoHover{
		position: absolute;
		top: 0;
		left: 0;
		flex: 1;
		background-color: rgba(0,0,0,0.1);
		justify-content: center;
		align-items: center;
		
		/* border-style: dashed;
		border-color: #DD524D;
		border-width: 1px; */
	}
	.playState{
		width:  160rpx;
		height: 160rpx;
		opacity: 0.2;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translateX(-50%) translateY(-50%);
	}
	.userInfo{
		position: absolute;
		bottom:110px;
		right: 10px;
		flex-direction: column;
		
	}
	.userAvatar{
		border-radius: 500%;
		margin-bottom: 15px;
		border-style: solid;
		border-width: 2px;
		border-color: #ffffff;
	}
	.userAvatar{
		width : 100rpx;
		height: 100rpx;
	}
	.likeIco,.shareIco,.commentIco{
		width : 60rpx;
		height: 60rpx;
		margin-top: 15px;
	}
	.likeNum,.commentNum,.shareTex{
		color: #ffffff;
		font-size: 30rpx;
		text-align: center;
		margin: 5px;
	}
	.likeNumActive{
		color: red;
	}
	.content{
	  width: 720rpx;
	  z-index: 99;
	  position: absolute;
	  bottom: 30px;
	  /* justify-content: center; */
	  padding: 15rpx;
	  flex-direction: column;
	  justify-content: flex-start;
	  color: #ffffff;
	}
	.userName {
	  font-size: 30rpx;
	  color: #ffffff;
	  margin-top: 80upx;
	}
	.words {
	  margin-top: 10rpx;
	  font-size: 30rpx;
	  color: #ffffff;
	}
	.root{
		background-color: #000000;
	}
</style>
