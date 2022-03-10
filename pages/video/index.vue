<template>
	<view @touchmove.stop.prevent="disabledScroll">
		<swiper 
			:style="'width:' + windowWidth + 'px;height:' + windowHeight + 'px;'" 
			:vertical="true" 
			@change="change"
			:current="current" 
			:indicator-dots="false" 
			v-if="dataList.length > 0">
			<swiper-item v-for="(list,index) in dataList" :key="index">
				<!-- 滚动视频 -->
				<view class="swiper-item">
					<!--
						1.v-if：用于控制视频在节点的渲染数
						2.muted的默认值是 false，代表默认是禁音视频的
						3.http-cache默认开启视频缓存
						4.poster（封面（方案一））：这里的封面默认处理存储在阿里云的视频
						5.page-gesture：在非全屏模式下，是否开启亮度与音量调节手势
						6.show-loading：这里默认去掉播放转圈的标志
						7.show-fullscreen-btn：是否显示全屏按钮
						8.show-center-play-btn：是否显示视频中间的播放按钮
						9.enable-progress-gesture：是否开启控制进度的手势
					 -->
					<video 
						v-if="Math.abs(k-index)<=1" 
						:id="list.id" 
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
						:poster="list.cover_url"
						:src="list.video_url" 
						@ended="ended" 
						@timeupdate="timeupdate" 
						@click="tapVideoHover(list.state,$event)"></video>
				</view>

				<!-- 播放状态：pause 的时候就会暂停 -->
				<view class="videoHover" @click="tapVideoHover(list.state,$event)"
					:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px;'">
					<image v-if="list.state=='pause'" class="playState" src="../../static/player.png" mode=""></image>
				</view>

				<!-- 顶部搜索 -->
				<view class="topSearch">
					<view class="searchContent">
						<image src="../../static/icon_search.png" mode=""></image>
						<input type="text" placeholder-style="color:#fff;" v-model="searchContent"
							placeholder="输入需要查询的内容" />
					</view>
				</view>

				<!-- tab栏 -->
				<view class="topTabs">
					<view :class="activeTabs == 0 ? 'tabsItem activeItem' : 'tabsItem'" @click="changeTabs(0)">关注
					</view>
					<view :class="activeTabs == 1 ? 'tabsItem activeItem' : 'tabsItem'" @click="changeTabs(1)">推荐
					</view>
				</view>

				<!-- 右侧信息 -->
				<view class="userInfo">
					<!-- 头像 -->
					<view class="userHead">
						<image class="headPic" :src="list.user.head_img" mode="aspectFill"></image>
						<image class="userFollow" v-if="list.user_id != myUserId && list.user.is_focus == 0"
							@click="clickFollow(list.user_id, index)" src="../../static/icon_add-red.png" mode=""></image>
					</view>

					<!-- 点赞 -->
					<view class="thumbsUp flexColumn" @click="giveLike(list.id,index)">
						<image v-if="list.user.is_like == 0" src="../../static/icon_unFollow-video.png" mode=""></image>
						<image v-else src="../../static/icon_follow-video.png" mode=""></image>
						<text>{{list.like_num}}</text>
					</view>

					<!-- 评论 -->
					<view class="userComment flexColumn" @click="showCommentPopup(list.id, index)">
						<image src="../../static/icon_news.png" mode=""></image>
						<text>{{list.message_num}}</text>
					</view>

					<!-- 分享 -->
					<view class="share flexColumn" @click="shareSharePopup(index)">
						<image src="../../static/icon_share.png" mode=""></image>
						<text>{{list.share_num}}</text>
					</view>
				</view>

				<!-- 底部文字 -->
				<view class="content" v-if="Math.abs(k-index)<=1">
					<view class="vedioGoods" @click="showGoodsPopup(list.goods.id)">
						<image src="../../static/icon_video-cat.png" mode=""></image>
						<text>购物 </text>
						<text class="line"></text>
						<text> {{list.goods.goods_name}}</text>
					</view>
					<view class="myFollow" v-if="list.id != myUserId && list.user.is_focus != 0">
						你的关注
					</view>
					<view class="userName singleHide">
						{{list.user.nick_name}}
					</view>
					<view class="words multiHide">
						{{list.description}}
					</view>
				</view>

			</swiper-item>
		</swiper>
		<view class="videoNull" v-else>
			<!-- 顶部搜索 -->
			<view class="topSearch">
				<view class="searchContent">
					<image src="../../static/icon_search.png" mode=""></image>
					<input type="text" placeholder-style="color:#fff;" v-model="searchContent"
						placeholder="输入需要查询的内容" />
				</view>
			</view>
			
			<!-- tab栏 -->
			<view class="topTabs">
				<view :class="activeTabs == 0 ? 'tabsItem activeItem' : 'tabsItem'" @click="changeTabs(0)">关注
				</view>
				<view :class="activeTabs == 1 ? 'tabsItem activeItem' : 'tabsItem'" @click="changeTabs(1)">推荐
				</view>
			</view>
			
			<!-- 暂无关注内容 -->
			<view class="followNull">
				<view class="nullImg">
					<image src="../../static/follow_null.png" mode="aspectFill" class="pic"></image>
				</view>
				<view class="nullText">
					<text>{{myUserId ? '还没有关注的博主，快去逛逛吧' : '请先登录才能查看视频'}}</text>
				</view>
			</view>
		</view>

		<!-- 分享 -->
		<luPopupWrapper ref="luPopupWrapperShare" :type="type" :transition="transition"
			:backgroundColor="backgroundColor" :active="active" :height="height" :width="width" :popupId="1"
			:maskShow="maskShow" :maskClick="maskClick" :closeCallback="closeCallback">
			<!-- <view class="shareBox bottmPopup" :style="isIphoneX ? 'padding-bottom:88rpx;' : 'padding-bottom:20rpx;'"> -->
			<view class="shareBox bottmPopup">
				<view class="shareList">
					<view class="shareItem" @click="shareFriend">
						<image src="../../static/share-friend.png" mode=""></image>
						<text>微信好友</text>
						<button open-type="share" class="friend">好友</button>
					</view>
					<view class="shareItem" @click="shareMoments">
						<image src="../../static/share-moments.png" mode=""></image>
						<text>朋友圈</text>
					</view>
				</view>
				<view class="close" @click="close">
					<image class="pic" src="../../static/icon_clone-yuan.png" mode=""></image>
				</view>
			</view>
		</luPopupWrapper>

		<!-- 商品 -->
		<luPopupWrapper ref="luPopupWrapperGoods" :type="type" :transition="transition"
			:backgroundColor="backgroundColor" :active="active" :height="height" :width="width" :popupId="2"
			:maskShow="maskShow" :maskClick="false" :closeCallback="closeCallbackGoods">
			<view class="vedioGoodsBox bottmPopup">
				<view class="goodsImg" v-if="goodsInfo.goods_img[0]">
					<image class="pic" :src="www + goodsInfo.goods_img[0]" mode="aspectFill"></image>
				</view>
				<view class="goodsInfo">
					<view class="goodsName baseflex" @click="jumpGoodsDetail(goodsInfo.id)">
						<text class="singleHide">{{goodsInfo.goods_name}}</text>
						<image src="../../static/icon_arrow-right.png" mode=""></image>
					</view>
					<view class="goodsEnsure">
						<view class="goodsTitle">
							保证
						</view>
						<view class="goodsContent singleHide">
							{{goodsInfo.goods_des_title}}
						</view>
					</view>
				</view>
				<!-- <view class="goodsOperation" :style="isIphoneX ? 'padding-bottom:88rpx;' : 'padding-bottom:20rpx;'"> -->
				<view class="goodsOperation">
					<view class="operationItem" @click="jumpGoodsDetail(goodsInfo.id)">
						查看详情
					</view>
					<view class="operationItem nowBuy" @click="nowBuyGoods">
						立即购买
					</view>
				</view>
				<view class="close" @click="hideGoods">
					<image class="pic" src="../../static/icon_clone-yuan.png" mode=""></image>
				</view>
			</view>
		</luPopupWrapper>

		<!-- 规格 -->
		<luPopupWrapper ref="luPopupWrapperSpecs" :type="type" :transition="transition"
			:backgroundColor="backgroundColor" :active="active" :height="height" :width="width" :popupId="3"
			:maskShow="maskShow" :maskClick="maskClick" :closeCallback="closeCallback">
			<!-- <scroll-view scroll-y="true" class="specsExplain" :style="isIphoneX ? 'padding-bottom:88rpx;' : 'padding-bottom:20rpx;'"> -->
			<scroll-view scroll-y="true" class="specsExplain">
				<view class="specGoodsInfo">
					<view class="specGoodsImg" v-if="goodsInfo.goods_img[0]">
						<image class="pic" v-if="activeSpec == null" :src="www + goodsInfo.goods_img[0]"
							mode="aspectFill"></image>
						<image class="pic" v-else
							:src="www + (goodsSpec[activeSpec].goods_img || goodsInfo.goods_img[0])" mode="aspectFill">
						</image>
					</view>
					<view class="specGoodsContent">
						<view class="specGoodsName singleHide">
							{{goodsInfo.goods_name}}
						</view>
						<view class="specGoodsPrice" v-if="!activeSpec && activeSpec!= 0">
							￥ <text>{{goodsSpec[0].goods_price}}</text> 起
						</view>
						<view class="specGoodsPrice" v-else>
							￥ <text>{{goodsSpec[activeSpec].goods_price}}</text>
						</view>
						<view class="specGoodsSpecs multiHide">
							{{activeSpec == 0 || activeSpec ? goodsSpec[activeSpec].goods_spec_title : '请选择口味'}}
						</view>
					</view>
				</view>
				<view class="goodsSpecAll">
					<view class="specTitle">
						口味
					</view>
					<view class="selGoodsSpec">
						<view
							:class="(activeSpec == 0 || activeSpec) && activeSpec === index ? 'goodsSpecItem activeSpecs' : 'goodsSpecItem'"
							v-for="(item,index) in goodsSpec" :key="index" @click="changeSpec(index)">
							{{item.goods_spec_title}}
						</view>
					</view>
				</view>
				<view class="buyGoodsNum baseflex">
					<view class="buyTitle">
						购买数量
					</view>
					<view class="changeNum">
						<view class="sub numBtn" @click="sub">-</view>
						<input type="number" v-model="buyNum" @input="verification($event)" @blur="blurInput" />
						<view class="add numBtn" @click="add">+</view>
					</view>
				</view>
				<view class="buyOperation" @click="buyClick">
					{{buy ? '立即购买' : '立即加入'}}
				</view>
				<view class="close" @click="hideSpec">
					<image class="pic" src="../../static/icon_clone-line.png" mode=""></image>
				</view>
			</scroll-view>
		</luPopupWrapper>

		<!-- 评论 -->
		<luPopupWrapper ref="luPopupWrapperComment" :type="type" :transition="transition"
			:backgroundColor="backgroundColor" :active="active" :height="height" :width="width" :popupId="4"
			:maskShow="maskShow" :maskClick="maskClick" :closeCallback="closeCallbackComment">
			<!-- <scroll-view scroll-y="true" class="comment bottmPopup" @scrolltolower="loadMoreComment" :style="isIphoneX ? 'padding-bottom:88rpx;' : 'padding-bottom:20rpx;'"> -->
			<scroll-view scroll-y="true" class="comment bottmPopup" @scrolltolower="loadMoreComment">
				<view class="commentTitle" v-if="commentTotal > 0">{{commentTotal}}条评论</view>
				<view class="commentTitle" v-else>无评论</view>
				<view class="commentMain" v-if="commentTotal > 0">
					<view class="commentContent" v-for="(item,index) in commentList" :key="index">
						<view class="commentUser">
							<view class="commentUserHead">
								<image class="pic" :src="item.head_img" mode="aspectFill"></image>
							</view>
							<view class="commentUserInfo">
								<view class="commentUserName">
									{{item.user_name}} <text v-if="dataList[currentVideoIdx].user_id == item.user_id">作者</text>
								</view>
								<view class="commentUserContent">
									{{item.content}}
								</view>
								<view class="commentTime">
									{{item.timesText}}
									<text @click="replyUser(item.id)"> 回复</text>
								</view>
								<view class="reply" :id="'reply' + index">
									<view class="replyUser" v-for="(val,idx) in item.childrenComment" :key="idx">
										<view class="replyUserHead">
											<image class="pic" :src="val.head_img" mode="aspectFill"></image>
										</view>
										<view class="replyUserInfo">
											<view class="replyUserName" v-if="val.to_user_name">
												{{val.user_name}} <image src="../../static/icon_arrow-right.png" mode="aspectFill"></image>
												{{val.to_user_name}}
											</view>
											<view class="replyUserName" v-else>
												{{val.user_name}} <text v-if="dataList[currentVideoIdx].user_id == item.user_id">作者</text>
											</view>
											<view class="commentUserContent">
												{{val.content}}
											</view>
											<view class="commentTime">
												{{val.timesText}}
												<text @click="replyUser(item.id, val.user_id)"> 回复</text>
											</view>
										</view>
									</view>
								</view>
								<view 
									class="commentMore" 
									v-if="item.count > 0 && item.count > item.childrenComment.length" 
									@click="getReply(item.id, item.currentPage, index)">
									展开更多 <text></text>
								</view>
							</view>
						</view>
					</view>

					<view class="nullComment">
						没有更多啦
					</view>
				</view>
				<view class="commentMain nullComment" v-else>
					暂无评论，快留下你的想法吧
				</view>
				<!-- <view class="commentInput" :style="isIphoneX ? 'padding-bottom:88rpx;' : 'padding-bottom:20rpx;'"> -->
				<view class="commentInput">
					<input 
						type="text" 
						:focus="focus" 
						value="" 
						v-model="repalyContent" 
						:placeholder="myUserId ? '留下你精彩的评论吧' : '请先登录才能进行评论'"
						:disabled="!myUserId"
						@confirm="repalyComment"
						@blur="blur"/>
				</view>
				<view class="close" @click="hideCommentPopup">
					<image class="pic" src="../../static/icon_clone-line.png" mode=""></image>
				</view>
			</scroll-view>
		</luPopupWrapper>
	</view>
</template>

<script>
	let app = getApp();
	let self = null;
	import userList from '../../utils/data.js' //这个是假数据
	import luPopupWrapper from "../../components/lu-popup-wrapper/lu-popup-wrapper.vue";
	import http from "@/utils/http.js"
	export default {
		components: {
			luPopupWrapper
		},
		data() {
			return {
				isIphoneX: false, // iphoneX手机
				type: "bottom", // left right top bottom center
				transition: "slider", //none slider fade
				backgroundColor: '#FFF',
				active: false,
				height: "auto",
				width: "100%",
				popupId: 1,
				maskShow: true,
				maskClick: true,

				activeTabs: 1, // tabs
				searchContent: '',

				www: http.rootDocument, // 根路径

				goodsInfo: {}, // 商品详情
				goodsSpec: [], // 规格为空
				activeSpec: null, // 选中的规格

				windowWidth: '', // 屏幕宽度
				windowHeight: '', // 屏幕高度

				showMoreReply: true, // 显示更多回复
				animationReply: {}, // 动画 更多评论
				repalyHeight: 0, // 回复的评论高度

				repalyContent: '', // 回复评论的内容
				focus: false, // 输入框聚焦
				buyNum: 1, // 购买数量
				moreComment: true, // 显示评论数

				commentTotal: 0, // 评论数
				commentList: [], // 评论列表
				tempComment: [], // 临时数组
				commentPage: 1, // 评论列表页码
				commentLast_page: 1, // 评论列表总页码
				total: 0,
				
				currentVideoIdx: '', // 选中的视频索引

				currentCommentVideoId: '', // 选中评论的视频id
				currentReplyPid: 0, // 选中的回复人的pid
				currentReplyToUserId: '', // 选中回复人的id

				dataList: [], // 视频数据
				page: 1,
				last_page: 1,
				total: 0,
				k: 0, // 当前播放的视频
				oldVideo: "",
				voice: "",
				timeout: "",
				current: 0,
				boxStyle: { //视频，图片封面样式🌟💗
					'height': 0,
					'width': 0,
				},

				myUserId: '', // 我的用户id
				information: {}, // 用户信息
			}
		},
		onLoad() {
			this.isIphoneX = app.globalData.isIphoneX;
			self = this;

			// this.get(); // 刚进入页面加载数据

			this.getVideoList();

			// 获取屏幕宽高
			this.windowWidth = uni.getSystemInfoSync().windowWidth;
			this.windowHeight = uni.getSystemInfoSync().windowHeight;
		},
		onShow() {
			let information = uni.getStorageSync('information');
			if (information) {
				this.myUserId = information.id;
				this.information = information;
			}
			
			if(this.dataList.length == 0){
				// this.getVideoList();
			}
		},
		watch: {
			k(k, old_k) {
				console.log(k, 'watch', old_k);
				this.dataList[old_k].playIng = false; // 如果视频暂停，就加载封面
				this.dataList[old_k].isplay = true;
				this.dataList[old_k].state = 'pause';

				uni.createVideoContext(this.dataList[old_k].id, this).play();
				clearTimeout(this.oldVideo);
				this.oldVideo = setTimeout(() => {
					uni.createVideoContext(this.dataList[old_k].id, this).seek(0);
					uni.createVideoContext(this.dataList[old_k].id, this).pause();
					console.log('watch中预留第' + (old_k + 1) + '个视频：' + this.dataList[old_k].id);
				}, 500)

				// 2.0版本已经去掉了下面这一句，视频不用暂停，只需要把声音禁止就行
				// uni.createVideoContext(this.dataList[old_k].id + '' + old_k,this).stop()//如果视频暂停，那么旧视频停止，这里的this.dataList[old_k].id + '' + old_k，后面加 old_k 是为了每一个视频的 id 值不同，这样就可以大程度的避免串音问题
				console.log('已经暂停 --> 第' + (old_k + 1) + '个视频～') //提示
				this.dataList[k].state = 'play'
				uni.createVideoContext(this.dataList[k].id, this).play()
				clearTimeout(this.voice)
				this.voice = setTimeout(() => {
					this.dataList[k].isplay = false
				}, 300)
				setTimeout(() => {
					this.dataList[k].playIng = true
				}, 850)
				//【2.0版本更新内容】- start
				var p = k
					++p
				
				if(!this.dataList[p]){
					return
				}
				setTimeout(() => {
					uni.createVideoContext(this.dataList[p].id.toString(), this).play()
				}, 20)
				clearTimeout(this.timeout)
				this.timeout = setTimeout(() => {
					uni.createVideoContext(this.dataList[p].id.toString(), this).seek(0)
					uni.createVideoContext(this.dataList[p].id.toString(), this).pause()
					console.log('watch中预加载第' + (p + 1) + '个视频 2 号：' + this.dataList[p].id.toString())
				}, 1800)
			}
		},
		methods: {
			// 获取视频信息
			getVideoList() {
				let that = this;
				http.postJSON('api/Video/queryPlayVideoList', {
					type: Number(this.activeTabs) + 1,
					title: this.searchContent,
					page: this.page,
				}, function(res) {
					uni.hideLoading()
					console.log(res, '视频列表');
					if (res.code == 200) {
						that.page = res.data.current_page;
						that.last_page = res.data.last_page;
						that.total = res.data.total;
						let videoList = res.data.data;
						for (let k in that.workFeedbackInfo) {
							console.log(that.workFeedbackInfo[k],'that.workFeedbackInfo[k]');
							let calcNum = Number(that.workFeedbackInfo[k]);
							
							if(calcNum >= 10000){
								that.workFeedbackInfo[k] = (calcNum / 10000).toFixed(1) + 'W'
							}
						}
						// like_num   message_num   share_num
						videoList.forEach(item => {
							item.state = 'pause';
							item.playNumStatus = false;
							item.isplay = true;
							if(Number(item.like_num) >= 10000){
								item.like_num = (item.like_num / 10000).toFixed(1) + 'W'
							}
							if(Number(item.message_num) >= 10000){
								item.message_num = (item.message_num / 10000).toFixed(1) + 'W'
							}
							if(Number(item.share_num) >= 10000){
								item.share_num = (item.share_num / 10000).toFixed(1) + 'W'
							}
						})
						if(videoList.length > 0){
							that.get(videoList);
						}
						
					}
				})
			},


			// 点击视频播放与暂停
			tapVideoHover(state, event) {
				if (state == 'play' || state == 'continue') { // 初次点击时视频默认播放
					this.dataList[this.k].state = 'pause'
				} else {
					this.dataList[this.k].state = 'continue'
				}
				if (this.dataList[this.k].state == 'pause') {
					uni.createVideoContext(this.dataList[this.k].id, this).pause(); // 播放时点击暂停
				}

				if (this.dataList[this.k].state == 'continue') {
					uni.createVideoContext(this.dataList[this.k].id, this).play(); // 暂停是点击播放
				}
			},

			// 视频播放结束
			ended() {
				// 1.播放当前视频结束时触发，自动切换下一个视频
				// this.current = this.k + 1;
			},

			// 滑动切换下一个视频
			change(event) {
				// console.log(event,'滑动切换下一个视频');
				this.dataList[this.k].playNumStatus = false; 
				this.current = event.detail.current;
				this.k = event.detail.current;
				// 1.这里进行判断，如果是最后一个视频就进入 get() 方法加载视频进入列表
				if (this.k == this.dataList.length - 1) {
					this.page++;
					this.getVideoList();
				}
			},

			// 获取视频数据
			get(videoList) {
				// 1. 从接口调用数据获取视频
				// let msg = userList;
				let msg = videoList;
				// 2. 将视频添加进视频列表
				for (let i = 0; i < msg.length; i++) {
					this.dataList.push(msg[i])
				}
				// 3. 播放视频
				setTimeout(() => {
					this.dataList[this.k].playIng = true;
					this.dataList[this.k].state = 'play';
					uni.createVideoContext(this.dataList[this.k].id.toString(), this).play()
				}, 200)
				console.log(this.dataList, 'this.dataList');
				// start -- 预加载
				if (this.k == this.total) {
					// 若加载的是最后一个视频，则不进行预加载
					return
				}
				var p = this.k;
				++p;
				setTimeout(() => {
					uni.createVideoContext(this.dataList[p].id.toString(), this).play()
				}, 20)
				clearTimeout(this.timeout)
				this.timeout = setTimeout(() => {
					uni.createVideoContext(this.dataList[p].id.toString(), this).seek(0);
					uni.createVideoContext(this.dataList[p].id.toString(), this).pause();
					console.log('get中预加载第' + (p + 1) + '个视频：' + this.dataList[p].id.toString());
				}, 1500)
			},

			// 滑动结束后才会触发的事件
			animationfinish(event){
				console.log(event,'滑动结束后才会触发的事件');
			},
			
			// 视频播放几秒算播放量
			timeupdate(e){
				// console.log(e,'视频播放中');
				let duration = e.detail.duration;
				let currentTime = e.detail.currentTime;
				if(this.dataList.length <= 0){
					return
				}
				
				if(this.dataList[this.k].playNumStatus){
					return
				}
				if(currentTime < 5){
					if(currentTime == duration){
						this.calcNum();
					}
				}else{
					if(duration > 5){
						this.calcNum();
					}
				}
			},

			// 计算播放量
			calcNum(){
				let id = this.dataList[this.k].id;
				let that = this;
				http.postJSON('api/Video/playVideo',{
					id: id
				},function(res){
					if(res.code == 200){
						console.log('播放量加1');
						that.dataList[that.k].playNumStatus = true;
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},


			// 点赞
			giveLike(id, index) {
				if(!this.myUserId){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
						duration: 2000
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},2000)
				}
				
				let is_like = this.dataList[index].user.is_like;
				let like_num = Number(this.dataList[index].like_num);

				let that = this;
				http.postJSON('api/Video/likeVideo', {
					id: id
				}, function(res) {
					if (res.code == 200) {
						if (is_like == 0) {
							// 当前是未点赞状态
							that.dataList[index].user.is_like = 1;
							that.dataList[index].like_num += 1;
						} else {
							that.dataList[index].user.is_like = 0;
							that.dataList[index].like_num -= 1;
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},


			// 关注
			clickFollow(id, index) {
				if(!this.myUserId){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
						duration: 2000
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},2000)
				}
				let that = this;
				let currentClick = this.dataList[index];
				uni.showLoading()
				http.postJSON('api/Video/focusUser', {
					user_id: id
				}, function(res) {
					uni.hideLoading()
					if (res.code == 200) {
						currentClick.user.is_focus = 1;
						uni.showToast({
							title: '关注成功',
							icon: 'success'
						})
						
						if(index + 1 > that.dataList.length){
							// that.dataList[index + 1].user.is_focus = 1;
							that.$set(that.dataList[index + 1].user, 'is_focus', 1);
						}
						that.dataList.forEach(item => {
							if (item.id == id) {
								console.log('点击关注', item);
								// item.user.is_focus = 1;
								that.$set(item.user, 'is_focus', 1);
								that.$forceUpdate()
							}
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},

			// 回复评论
			replyUser(pid, to_user_id) {
				if(!this.myUserId){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
						duration: 2000
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},2000)
				}
				this.currentReplyPid = pid;
				this.currentReplyToUserId = to_user_id || '';
				console.log(this.currentReplyToUserId,'currentReplyToUserId',this.currentReplyPid,'currentReplyPid');
				this.focus = true;
			},
			
			// 失去焦点
			blur(){
				this.focus = false;
			},
			
			// 评论
			repalyComment() {
				if(!this.myUserId){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
						duration: 2000
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},2000)
				}
				let video_id = this.currentCommentVideoId || this.commentList[0].video_id;
				let to_user_id = this.currentReplyToUserId;
				let pid = this.currentReplyPid;
				let information = this.information;

				let that = this;
				http.postJSON('api/Video/addVideoMessage', {
					video_id: video_id,
					pid: pid || 0,
					content: this.repalyContent,
					to_user_id: to_user_id
				}, function(res) {
					if (res.code == 200) {
						that.repalyContent = '';
						that.commentList = [];
						that.commentPage = 1;
						that.showCommentPopup(video_id, that.currentVideoIdx);
						
						if(!pid){
							// pid 不存在评论的是当前视频，一级评论
							console.log('评论的是视频，一级评论');
						}else if(pid && !to_user_id){
							// pid 存在 to_user_id 不存在代表回复的是一级评论
							console.log('评论的是一级评论 没有回复他人');
						}else if(pid && to_user_id){
							// 两个都存在代表回复的是一级下面的他人，有回复人
							console.log('评论的是一级评论下的评论， 回复他人的评论');
						}
						
						that.currentReplyToUserId = '';
						that.currentReplyPid = '';
						that.focus = false;
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			// 滚动到底部查看更多评论
			loadMoreComment(){
				console.log('滚动到了底部');
				if (this.commentPage < this.commentLast_page) {
					this.commentPage++;
					this.showCommentPopup(this.currentCommentVideoId, this.currentVideoIdx)
				} else {
					uni.showToast({
						title: '没有更多了',
						icon: 'none'
					})
				}
			},


			// 分享好友
			shareFriend() {
				if(!this.myUserId){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
						duration: 2000
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},2000)
				}
				let index = this.currentVideoIdx;
				let id = this.dataList[index].id;
				let that = this;
				http.postJSON('api/Video/shareVideo',{
					id: id
				},function(res){
					if(res.code == 200){
						console.log('分享成功');
						setTimeout(function(){
							that.dataList[index].share_num ++;
						},1500)
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},



			// 切换tabs
			changeTabs(idx) {
				this.activeTabs = idx;
				this.page = 1;
				this.dataList = [];
				uni.showLoading({
					title: '加载中'
				})
				this.getVideoList();
			},


			show: function(ref) {
				console.log('隐藏底部tab');
				uni.hideTabBar({
					animation: false
				})
				this.$refs[ref].show();
			},
			close: function(ref) {
				console.log('显示底部tab');
				setTimeout(function() {
					uni.showTabBar({
						animation: false
					})
				}, 200)
				this.$refs[ref].close();
			},
			closeCallback: function() {
				console.log("关闭后回调 显示底部tab");
				uni.showTabBar({
					animation: false
				})
			},
			closeCallbackGoods: function() {
				console.log('关闭商品的回调');
			},
			closeCallbackComment(){
				self.commentList = [];
				self.commentPage = 1;
				uni.showTabBar({
					animation: false
				})
			},

			disabledScroll() {
				return
			},

			// 弹出分享弹窗
			shareSharePopup(index) {
				this.show('luPopupWrapperShare');
				this.currentVideoIdx = index;
			},

			// 隐藏分享弹窗
			hideShare() {
				this.close('luPopupWrapperShare')
			},

			// 分享朋友圈
			shareMoments() {
				uni.showToast({
					title: "点击右上角分享到朋友圈",
					icon: 'none',
					duration: 3000
				})

				setTimeout(function() {
					uni.hideToast()
				}, 3000)
			},

			// 弹出商品信息
			showGoodsPopup(id) {
				let that = this;
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/goods/getGoodsInfo', {
					goods_id: id
				}, function(res) {
					uni.hideLoading()
					if (res.code == 200) {
						that.show('luPopupWrapperGoods');
						that.goodsInfo = res.data;
						that.goodsSpec = res.data.spec_list;
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})

			},

			// 隐藏商品
			hideGoods() {
				this.close('luPopupWrapperGoods')
			},

			// 跳转商品详情
			jumpGoodsDetail(id) {
				this.hideGoods()
				setTimeout(() => {
					uni.navigateTo({
						url: "../goods/details?id=" + id
					})
				}, 300)
			},

			// 立即购买
			nowBuyGoods() {
				this.$refs.luPopupWrapperGoods.close()


				if (this.goodsSpec.length > 0) {
					// uni.hideTabBar({
					// 	animation: false
					// })
					this.showSpec()
				} else {
					setTimeout(function() {
						uni.showTabBar({
							animation: false
						})
						// uni.navigateTo({
						// 	url: "../confirmOrder/confirmOrder"
						// })
					}, 200)
				}
			},

			// 切换选中的规格
			changeSpec(idx) {
				this.activeSpec = idx;
			},

			// 购买商品 or 添加购物车
			showSpec() {
				this.show('luPopupWrapperSpecs')
			},

			// 隐藏规格
			hideSpec() {
				this.close('luPopupWrapperSpecs')
			},

			// 减少数量
			sub() {
				let buyNum = parseInt(this.buyNum)
				if (buyNum <= 1) {
					console.log('不能再少了');
					return
				}
				buyNum -= 1
				this.buyNum = buyNum
			},

			// 增加数量
			add() {
				let buyNum = parseInt(this.buyNum)
				buyNum += 1
				this.buyNum = buyNum;
			},

			// 数字校验
			verification(e) {
				console.log(e.detail.value);
				this.buyNum = e.detail.value.replace(/[^\d]/g, '')
			},
			blurInput(e) {
				let buyNum = e.detail.value;
				buyNum = buyNum.replace(/[^\d]/g, '');

				parseInt(buyNum);
				if (buyNum <= 1) {
					this.buyNum = 1;
					return
				}
				this.buyNum = buyNum
			},

			// 加入购物车 or 立即购买
			buyClick() {
				let lgn = this.goodsSpec.length;
				if (lgn > 0) {
					console.log(this.activeSpec);
					if (!this.activeSpec) {
						if (this.activeSpec != 0) {
							uni.showToast({
								title: '请选择规格',
								icon: 'none'
							})
							return
						}

					}
				}
				let that = this;
				http.postJSON('api/cart/incCartNum', {
					goods_id: this.goodsInfo.id,
					spec_id: this.goodsSpec[this.activeSpec].id,
					num: this.buyNum
				}, function(res) {
					console.log(res, '点击加入购物车');
					if (res.code == 200) {
						if (that.buy) {
							uni.switchTab({
								url: '../car/car'
							})
						} else {
							uni.showToast({
								title: '加入购物车成功',
								icon: 'none',
								duration: 1500
							})
						}

					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
				this.hideSpec()
				// setTimeout(function() {
				// 	uni.showTabBar({
				// 		animation: false
				// 	})
				// 	uni.navigateTo({
				// 		url: "../confirmOrder/confirmOrder"
				// 	})
				// }, 200)
			},

			// 显示评论
			showCommentPopup(video_id, index) {
				if(index !== ''){
					this.currentVideoIdx = index;
				}
				
				// this.commentList = [];
				console.log(this.commentList,'评论列表');
				let that = this;
				this.currentCommentVideoId = video_id;
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/Video/queryVideoMessageList', {
					video_id: video_id,
					pid: 0,
					page: this.commentPage,
				}, function(res) {
					uni.hideLoading()
					if (res.code == 200) {
						that.show('luPopupWrapperComment');

						that.commentTotal = res.data.count;
						that.commentPage = res.data.list.current_page;
						that.commentLast_page = res.data.list.last_page;
						that.total = res.data.list.total;
						
						that.tempComment = res.data.list.data;
						that.tempComment.forEach((item,index) => {
							item.showMoreReply = false;
							item.childrenComment = [];
							item.currentPage = 1;
							item.timesText = that.setCommentTimer(item.create_time);
						})
						
						that.commentList = that.commentList.concat(that.tempComment);
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			// 设置评论时间
			setCommentTimer(create_time){
				var temp = (new Date().getTime()).toString();	
				var timestamp = temp.substring(0, temp.length - 3);
				
				var now_temp = new Date(create_time).getTime().toString();
				var now_time = now_temp.substring(0, now_temp.length - 3);
				
				let comment_time = create_time.split(' ');
				let comment_date = comment_time[0].split('-');
				let timesText = '';
				let num = timestamp - now_time;
				if (Math.floor(num / (3600 * 24 * 30 * 12))) { // 具体年  (3600 * 24 * 30 * 12)
				  timesText = comment_date[0] + '年' + comment_date[1] + '月' + comment_date[2] + '日'
				} else if (Math.floor(num / (3600 * 24 * 30))) { // 具体月  时间小于1年  (3600 * 24 * 30)
				  timesText = comment_date[1] + '月' + comment_date[2] + '日'
				} else if (Math.floor(num / (3600 * 24 * 6))) { // 具体4天  时间小于1月  (3600 * 24 * 7)
				  timesText = comment_date[1] + '月' + comment_date[2] + '日'
				} else if (Math.floor(num / (3600 * 24))) { // 具体天  时间小于1周  (3600 * 24)
				  timesText = Math.floor(num / (3600 * 24)) + '天前'
				} else if (Math.floor(num / 3600)) { // 具体小时  时间小于1天  (3600)
				  timesText = Math.floor(num / 3600) + '小时前'
				} else if (Math.floor(num / 60)) { // 具体分钟  时间小于1小时，(60)
				  timesText = Math.floor(num / 60) + '分钟前'
				} else if (Math.floor(num) < 60) { // 刚刚  时间小于60秒 (小于60)
				  timesText = '刚刚'
				}
				return timesText
			},

			// 隐藏评论
			hideCommentPopup() {
				console.log(this,'===================');
				this.commentList = [];
				console.log(this.commentList,'关闭评论后');
				this.commentPage = 1;
				this.close('luPopupWrapperComment')
			},

			// 获取回复高度  获取隐藏的评论
			getReply(pid, page, index) {
				let video_id = this.currentCommentVideoId;
				
				let hideComment = [];
				let that = this;
				let childrenComment = that.commentList[index].childrenComment;
				uni.showLoading({
					title: '加载中'
				})
				http.postJSON('api/Video/queryVideoMessageList',{
					video_id: video_id,
					pid: pid,
					page: page
				},function(res){
					uni.hideLoading()
					if(res.code == 200){
						hideComment = res.data.list.data;
						let data = res.data.list;
						childrenComment.push(...hideComment);
						
						childrenComment.forEach(item => {
							item.timesText = that.setCommentTimer(item.create_time);
						})
						if(data.current_page <= data.last_page){
							// 判断当前页是否是最后一页，不是的话就页码+1
							that.commentList[index].currentPage = Number(data.current_page) + 1;
						}else{
							that.commentList[index].currentPage = Number(data.current_page);
						}
						// that.$set(that.commentList[index], 'childrenComment', childrenComment);
						that.$forceUpdate()
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
		},
		onShareAppMessage() {
			let that = this;
			const promise = new Promise(resolve => {
			    setTimeout(() => {
					resolve({
			          title: '转发好友这个视频',
					})
					that.close('luPopupWrapperShare')
			    }, 1500)
			})
			return {
				title: '转发好友这个视频',
				promise 
			}


		},
		onShareTimeline() {
			this.shareFriend()
		},
	}
</script>

<style lang="less">
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

	.topSearch {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		padding: 20rpx 30rpx;

		.searchContent {
			width: 690rpx;
			height: 64rpx;
			border: 2rpx solid #ffffff;
			border-radius: 34rpx;
			display: flex;
			align-items: center;
			overflow: hidden;

			image {
				width: 40rpx;
				height: 40rpx;
				margin-left: 20rpx;
				vertical-align: middle;
			}

			input {
				height: 100%;
				font-size: 28rpx;
				color: #fff;
				width: 576rpx;
				padding-left: 20rpx;
			}
		}
	}

	.topTabs {
		position: absolute;
		top: 104rpx;
		left: 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 20rpx 30rpx;

		.tabsItem {
			color: #fff;
			font-size: 36rpx;
			width: 50%;
			height: 66rpx;
			text-align: center;
		}

		.activeItem {
			position: relative;

			&::after {
				content: "";
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 48rpx;
				height: 4rpx;
				background: #ffffff;
				border-radius: 2rpx;
			}
		}
	}

	.userInfo {
		position: absolute;
		right: 10rpx;
		bottom: 120rpx;
		display: flex;
		flex-direction: column;
		z-index: 9;

		.userHead {
			position: relative;
			margin-bottom: 50rpx;
			border-radius: 50%;

			.headPic {
				width: 80rpx;
				height: 80rpx;
				border: 2rpx solid #fff;
				border-radius: 50%;
				overflow: hidden;
			}

			.userFollow {
				position: absolute;
				left: 50%;
				bottom: -14rpx;
				transform: translateX(-50%);
				width: 28rpx;
				height: 28rpx;
			}
		}
	}

	.flexColumn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 30rpx;

		image {
			width: 52rpx;
			height: 52rpx;
			margin-bottom: 10rpx;
		}

		text {
			color: #fff;
			font-size: 20rpx;
		}
	}

	.content {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		color: #fff;
		padding: 40rpx 30rpx;

		.vedioGoods {
			position: relative;
			height: 36rpx;
			display: inline-block;
			padding-right: 10rpx;
			line-height: 36rpx;
			background: rgba(255, 255, 255, 0.10);
			border-radius: 10rpx;
			margin-bottom: 20rpx;

			image {
				width: 36rpx;
				height: 36rpx;
				margin-right: 8rpx;
				// vertical-align: middle;
			}

			text {
				font-size: 20rpx;
				color: #fff;
				vertical-align: super;
			}

			.line {
				display: inline-block;
				width: 2rpx;
				height: 12rpx;
				background: #e5e5e5;
				margin: 0 8rpx;
			}
		}

		.myFollow {
			width: 124rpx;
			height: 36rpx;
			line-height: 36rpx;
			text-align: center;
			background: #ffffff;
			border-radius: 10rpx;
			color: #333;
			font-size: 24rpx;
			margin-bottom: 20rpx;
		}

		.userName {
			font-size: 28rpx;
			max-width: 300rpx;
			margin-bottom: 20rpx;
		}

		.words {
			font-size: 24rpx;
			max-width: 580rpx;
			max-height: 130rpx;
			-webkit-line-clamp: 4;
		}
	}

	.videoNull{
		width: 100vw;
		height: 100vh;
		background-color: #000000;
		position: relative;
		
		.followNull{
			margin: 0 auto;
			padding-top: 300rpx;
			.nullImg{
				width: 480rpx;
				height: 480rpx;
				margin: 0 auto 20rpx;
			}
			.nullText{
				color: #fff;
				font-size: 28rpx;
				text-align: center;
				margin: 0 auto;
			}
		}
	}



	.mask {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 999;
		width: 100%;
		height: 100%;
	}

	.bottmPopup {
		background: #ffffff;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
		overflow: hidden;
		box-sizing: initial;
	}

	.shareBox {
		width: calc(100% - 60rpx);
		padding: 50rpx 30rpx 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		position: relative;

		.close {
			position: absolute;
			right: 20rpx;
			top: 20rpx;
			width: 28rpx;
			height: 28rpx;
		}
	}

	.shareList {
		display: flex;
		align-items: center;
		width: 100%;

		.shareItem {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-right: 60rpx;
			position: relative;

			image {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 12rpx;
			}

			text {
				color: #333;
				font-size: 32rpx;
			}

			button {
				position: absolute;
				left: 0;
				top: 0;
				height: 134rpx;
				opacity: 0;
			}
		}
	}

	.vedioGoodsBox {
		width: 100%;
		position: relative;

		.goodsImg {
			height: 748rpx;
			width: 100%;
		}

		.goodsInfo {
			padding: 20rpx 30rpx 38rpx;

			.goodsName {
				color: #333;
				font-size: 28rpx;
				margin-bottom: 20rpx;

				text {
					display: inline-block;
					max-width: 584rpx;
				}

				image {
					width: 24rpx;
					height: 24rpx;
				}
			}

			.goodsEnsure {
				font-size: 28rpx;
				display: flex;
				align-items: center;

				.goodsTitle {
					color: #333;
					margin-right: 20rpx;
				}

				.goodsContent {
					color: #999;
					max-width: 500rpx;
				}
			}
		}

		.goodsOperation {
			padding: 20rpx 30rpx;
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
			border-top: 2rpx solid #E5E5E5;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.operationItem {
				width: 330rpx;
				height: 68rpx;
				background: #ffc7c7;
				border-radius: 10rpx;
				color: #FF2D2D;
				font-size: 28rpx;
				text-align: center;
				line-height: 68rpx;
			}

			.nowBuy {
				color: #fff;
				background-color: #FF2D2D;
			}
		}

		.close {
			position: absolute;
			left: 30rpx;
			top: 28rpx;
			width: 40rpx;
			height: 40rpx;
		}
	}

	.specsExplain {
		width: 100%;
		background: #ffffff;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
		padding: 40rpx 30rpx 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		position: relative;

		.specGoodsInfo {
			display: flex;
			align-items: center;

			.specGoodsImg {
				width: 200rpx;
				height: 200rpx;
				border-radius: 8rpx;
				overflow: hidden;
				margin-right: 20rpx;
				flex-shrink: 0;
			}

			.specGoodsContent {
				flex-shrink: 0;
				max-width: 400rpx;
			}

			.specGoodsName {
				color: #333;
				font-size: 32rpx;
			}

			.specGoodsPrice {
				color: #FF2D2D;
				font-size: 28rpx;
				margin: 14rpx 0;

				text {
					font-size: 42rpx;
					margin: 0 4rpx;
				}
			}

			.specGoodsSpecs {
				color: #999;
				font-size: 28rpx;
				height: 76rpx;
			}
		}

		.goodsSpecAll {
			margin-top: 40rpx;

			.specTitle {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 20rpx;
			}

			.selGoodsSpec {
				width: 100%;
				height: auto;
				display: flex;
				align-items: center;
				flex-wrap: wrap;

				.goodsSpecItem {
					background: #e5e5e5;
					border-radius: 6rpx;
					padding: 12rpx;
					font-size: 28rpx;
					color: #666;
					margin-right: 20rpx;
					margin-bottom: 20rpx;
				}

				.activeSpecs {
					color: #fff;
					background-color: #FF2D2D;
				}
			}
		}

		.buyGoodsNum {
			margin: 50rpx 0 40rpx;

			.changeNum {
				display: flex;
				align-items: center;
			}

			.numBtn {
				width: 40rpx;
				height: 40rpx;
				background: #f2f2f2;
				border-radius: 4rpx;
				font-size: 32rpx;
				font-weight: 600;
				line-height: 40rpx;
				text-align: center;
			}

			input {
				height: 40rpx;
				max-width: 84rpx;
				text-align: center;
				font-size: 28rpx;
				color: #333;
			}
		}

		.buyOperation {
			width: 690rpx;
			height: 72rpx;
			background: #ff2d2d;
			border-radius: 10rpx;
			line-height: 72rpx;
			text-align: center;
			font-size: 28rpx;
			color: #fff;
		}

		.close {
			position: absolute;
			right: 30rpx;
			top: 20rpx;
			width: 40rpx;
			height: 40rpx;
		}
	}

	.comment {
		width: 100%;
		// max-height: 900rpx;
		height: 900rpx;
		padding-top: 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		position: relative;

		.commentTitle {
			color: #333333;
			font-size: 24rpx;
			text-align: center;
		}

		.commentMain {
			padding: 20rpx 30rpx;
			width: calc(100% - 60rpx);
			margin: 40rpx auto;

			.commentContent {
				margin-bottom: 40rpx;
			}

			.commentUser {
				display: flex;

				.commentUserHead {
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;
					border-radius: 50%;
					overflow: hidden;
				}

				.commentUserInfo {
					max-width: 480rpx;
					font-size: 24rpx;
					color: #333;

					.commentUserName {
						color: #666;
						
						text {
							display: inline-block;
							font-size: 16rpx;
							width: 44rpx;
							height: 20rpx;
							line-height: 20rpx;
							text-align: center;
							background: #ff2d2d;
							border-radius: 4rpx;
							margin-left: 10rpx;
							color: #fff;
						}
						
					}

					.commentUserContent {
						max-width: 480rpx;
						margin: 16rpx 0;
					}

					.commentTime {
						color: #999;
						margin-bottom: 16rpx;

						text {
							color: #666;
							margin-left: 20rpx;
						}
					}

					.commentMore {
						color: #666;

						text {
							display: inline-block;
							width: 0;
							height: 0;
							margin-left: 12rpx;
							border-width: 10rpx;
							border-color: #999999 transparent transparent transparent;
							border-style: solid;
							vertical-align: bottom;
						}
					}

					.reply {
						overflow: hidden;
					}

					.replyUser {
						display: flex;

						.replyUserHead {
							width: 26rpx;
							height: 26rpx;
							margin-right: 10rpx;
							border-radius: 50%;
							overflow: hidden;
						}

						.replyUserName {
							color: #666;
							font-size: 20rpx;

							text {
								display: inline-block;
								font-size: 16rpx;
								width: 44rpx;
								height: 20rpx;
								line-height: 20rpx;
								text-align: center;
								background: #ff2d2d;
								border-radius: 4rpx;
								margin-left: 10rpx;
								color: #fff;
							}

							image {
								width: 16rpx;
								height: 16rpx;
								margin: 0 8rpx;
								vertical-align: middle;
							}
						}
					}
				}

			}
		}

		.nullComment {
			text-align: center;
			font-size: 24rpx;
			color: #333;
			margin-bottom: 170rpx;
		}

		.commentInput {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			border-top: 2rpx solid #E5E5E5;
			padding: 16rpx 30rpx;
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
			background-color: #fff;

			input {
				width: 100%;
				height: 52rpx;
				font-size: 28rpx;
				color: #000;
				padding: 0 20rpx;
				background-color: #E5E5E5;
				box-sizing: border-box;
				border-radius: 26px;
			}
		}

		.close {
			position: absolute;
			right: 30rpx;
			top: 20rpx;
			width: 28rpx;
			height: 28rpx;
		}
	}
</style>
