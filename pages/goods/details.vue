<template>
	<!-- <view :style="isIphoneX ? 'padding-bottom:180rpx;' : 'padding-bottom:100rpx;'"> -->
	<view class="root">
		<!-- 商品图片展示 -->
		<swiper class="detailImg" :indicator-dots="goodsDetailInfo.goods_img.length > 1">
			<swiper-item v-if="goodsDetailInfo.goods_video">
				<view class="swiper-item">
					<video 
						class="pic"
						:src="www + goodsDetailInfo.goods_video"
						:autoplay="false"
						:loop="false"
						:muted="true"
						:show-mute-btn="true"
						play-btn-position="center"
						:enable-progress-gesture="false"
						:show-fullscreen-btn="false">
					</video>
					<!-- 播放状态：pause 的时候就会暂停 -->
					<!-- <view class="videoHover" @click="tapVideoHover(list.state,$event)">
						<image v-if="list.state=='pause'" class="playState" src="../../static/player.png" mode=""></image>
					</view> -->
				</view>
			</swiper-item>
			<swiper-item v-for="(item,index) in goodsDetailInfo.goods_img" :key="index">
				<view class="swiper-item">
					<image class="pic" :src="www + item" mode="aspectFill"></image>
				</view>
			</swiper-item>
		</swiper>
		<!-- 商品价格展示 -->
		<view class="detailPrcie" v-if="goodsSpec[0]" :style="type != 4 ? 'height: 132rpx;' : ''">
			<view class="presentPrice" v-if="type != 4">
				<view class="price">
					折扣价￥<text>{{goodsSpec[0].goods_price}}</text>
				</view>
				<view class="priceReduction">
					限时直降{{(parseInt(goodsSpec[0].goods_money) - parseInt(goodsSpec[0].goods_price)).toFixed(2)}}
				</view>
			</view>
			<view class="originalPrice" v-if="type != 4">
				<text>即将恢复￥{{goodsSpec[0].goods_money}}</text> 丨 <text>仅剩{{goodsSpec[0].goods_num}}{{goodsDetailInfo.unit}}</text>
			</view>
			
			<!-- 限时秒杀 -->
			<view class="timeLimit" v-if="type == 2">
				<view class="limitBox">
					<view class="limitTItle">
						<image src="../../static/icon_timing.png" mode=""></image>
						<text>限时秒杀</text>
					</view>
					<view class="countDown">
						<!-- <text>00</text> : <text>00</text> : <text>00</text> -->
						<uni-countdown 
							:day="days"
							:hour="hours" 
							:minute="minutes" 
							:second="seconds" 
							:reset="false" 
							:color="'#333'"
							:border-color="'transparent'"
							@timeup="timeUp"
						> </uni-countdown>
					</view>
				</view>
			</view>
			
			<!-- 断码清仓 -->
			<view class="timeLimit clear" v-if="type == 3">
				<view class="limitBox">
					<view class="limitTItle">
						<image src="../../static/icon_clearance.png" mode=""></image>
						<text>断码清仓</text>
					</view>
					<view class="countDown">
						售完为止
					</view>
				</view>
			</view>
			
			<!-- 议价商品 -->
			<view class="bargainingTxt" v-if="type == 4">
				商品可议价——可直接联系店铺老板
			</view>
			<view class="bargainingBtn" v-if="type == 4" @click="callTel">
				价格可议
			</view>
		</view>
		
		<!-- 商品详情 -->
		<view class="goodsDetail">
			<!-- 商品名称 -->
			<view class="detailName baseflex">
				<view class="goodsName">
					{{goodsDetailInfo.goods_name}}
				</view>
				<view class="shareGoods">
					<view class="shareImg">
						<image class="pic" src="../../static/icon_share-red.png" mode=""></image>
					</view>
					<view class="shareTxt">
						<text>分享</text>
					</view>
					<button open-type="share" class="friend">好友</button>
				</view>
			</view>
			<!-- 商品保证 -->
			<view class="ensure baseflex">
				<view class="ensureTitle">
					保证
				</view>
				<view class="ensureContent singleHide" @click="showServer">
					{{goodsDetailInfo.goods_des_title}}
				</view>
				<view class="ensureMore" @click="showServer">
					<image class="pic" src="../../static/icon_arrow-right.png" mode=""></image>
				</view>
			</view>
			<!-- 商家地址 -->
			<view class="shopAddr baseflex">
				<view class="shopAddressTxt multiHide">
					{{storeInfo.address}}
				</view>
				<view class="shopOptions">
					<view class="shopIcon" @click="mapNavigation">
						<image src="../../static/icon_location.png" mode=""></image>
						<text>导航</text>
					</view>
					<view class="shopIcon" @click="callTel">
						<image src="../../static/icon_call.png" mode=""></image>
						<text>电话</text>
					</view>
				</view>
			</view>
			<!-- 店铺信息 -->
			<view class="shop baseflex">
				<view class="shopInfo">
					<view class="shopLogo" v-if="storeInfo.store_logo">
						<image class="pic" :src="www + storeInfo.store_logo" mode=""></image>
					</view>
					<view class="shopContent">
						<view class="shopName">
							{{storeInfo.store_name}}
						</view>
						<view class="shopSpec">
							<text style="margin-right: 40rpx;">商品：{{storeInfo.goods_count}} </text>
							<text> 已售：{{storeInfo.sales_num}}</text>
						</view>
					</view>
				</view>
				<view class="toShop" @click="jumpShophome(storeInfo.id)">
					进店逛逛
				</view>
			</view>
			<!-- 商品详情 - 信息 -->
			<view class="detailInfo">
				<view class="infoTitle">
					商品详情
				</view>
				<view class="infoMain" :style="showOperation ? 'padding-bottom:48rpx': ''" id="goodsInfo" :animation="animationHeight">
					<view class="infoItem" v-for="(item,index) in goodsInfo" :key="index">
						<view class="infoTItle-l">
							{{item.attr_key}}
						</view>
						<view class="infoContent-r">
							{{item.attr_title}}
						</view>
					</view>
					<view class="lastOperation" @click="exhibition" v-if="showOperation">
						<text>{{showMore ? '收起' : '展开'}}</text>
						<image :animation="animationData" class="pic" src="../../static/icon_arrow-redTop.png" mode=""></image>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 商品详情图片 -->
		<view class="goodsDetailImg">
			<image 
				v-for="(item,index) in goodsDetailInfo.goods_detail" 
				:key="index"
				class="pic" 
				:src="www + item"
				mode="widthFix"
				></image>
		</view>
		
		<!-- 展示更多 -->
		<view class="goodsMore" v-if="!showPriceExpalin" @click="this.showPriceExpalin = true">
			点击查看商品价格说明
		</view>
		
		<!-- 价格说明 -->
		<view class="priceExplain" v-if="showPriceExpalin">
			<view class="explainTitle">
				价格说明
			</view>
			<view class="explainLeft">
				<rich-text :nodes="goodsDetailInfo.goods_price_describe"></rich-text>
			</view>
			<!-- <view class="explainLeft">
				<text>原价</text> ：是物品原本的价格
			</view>
			<view class="explainLeft">
				<text>折扣价</text>：是打过折扣的价格
			</view>
			<view class="explainLeft">
				<text>特别提示</text>：实际的成交价格可能因您使用优惠券等发生 变化，最终以订单结算页的价格为准。若商家单独对价 格进行说明的，以商家的表述为准
			</view> -->
		</view>
	
		<!-- 服务说明 -->
		<view class="server">
			<view class="mask" @click="hideServer" v-if="showServerExpalin"></view>
			<view class="serverExplain" :animation="animationServer">
				<view class="title">
					服务说明
				</view>
				<scroll-view class="serverMain" scroll-y="true" >
					<view class="serverItem">
						<view class="serverTitle">
							{{goodsDetailInfo.goods_des_title}}
						</view>
						<view class="serverContent">
							{{goodsDetailInfo.goods_describe}}
						</view>
					</view>
					<!-- <view class="serverItem">
						<view class="serverTitle">
							全场包邮
						</view>
						<view class="serverContent">
							所有商品包邮（偏远地区除外）
						</view>
					</view>
					<view class="serverItem">
						<view class="serverTitle">
							7天无理由退货
						</view>
						<view class="serverContent">
							满足相应条件（不影响二次销售）时，消费者可申请“7天无理由 退货”
						</view>
					</view>
					<view class="serverItem">
						<view class="serverTitle">
							假一赔十
						</view>
						<view class="serverContent">
							若收到商品是假冒品牌，可获得十倍现金券赔偿
						</view>
					</view>
					<view class="serverItem">
						<view class="serverTitle">
							极速退款
						</view>
						<view class="serverContent">
							拼单成功6小时内，待发货状态下，提交退款申请将立即退款
						</view>
					</view> -->
				</scroll-view>
				<view class="close" @click="hideServer">
					<image class="pic" src="../../static/icon_clone-line.png" mode=""></image>
				</view>
			</view>
		</view>
		
		<!-- 底部操作 -->
		<!-- <view class="bottomOperation" :style="isIphoneX ? 'height: 166rpx;' : 'height: 98rpx;'"> -->
		<view class="bottomOperation">
			<view class="baseOperation">
				<view class="basicsItem" @click="jumpShophome(storeInfo.id)">
					<image src="../../static/icon_shop.png" mode=""></image>
					<text>店铺</text>
				</view>
				<view class="basicsItem" @click="follow" v-if="goodsDetailInfo.is_like != 1">
					<image src="../../static/icon_follow-goods.png" mode=""></image>
					<text>收藏</text>
				</view>
				<view class="basicsItem" @click="follow" v-else>
					<image src="../../static/icon_follow-video.png" mode=""></image>
					<text>取消收藏</text>
				</view>
				<!-- <view class="basicsItem" v-else>
					<image src="../../static/icon_follow-video.png" mode=""></image>
					<text>取消收藏</text>
				</view> -->
			</view>
			<view class="payOperation">
				<view class="payBtn shoppingCar" @click="goBuy">
					加入购物车
				</view>
				<view class="payBtn buyNow" @click="buyNow">
					立即购买
				</view>
			</view>
		</view>
		
		<!-- 返回顶部 -->
		<view class="goTop" v-if="showGoTop" @click="goTop">
			<image class="pic" src="../../static/go_top.png" mode=""></image>
		</view>
	
		<!-- 商品规格 -->
		<view class="specs">
			<view class="mask" @click="hideSpec" v-if="showSpecs"></view>
			<!-- <scroll-view scroll-y="true" class="specsExplain" :animation="animationSpec" :style="isIphoneX ? 'padding-bottom: 88rpx;' : 'padding-bottom: 20rpx;'"> -->
			<scroll-view scroll-y="true" class="specsExplain" :animation="animationSpec">
				<view class="specGoodsInfo">
					<view class="specGoodsImg">
						<image class="pic" v-if="activeSpec == null" :src="www + goodsDetailInfo.goods_img[0]" mode="aspectFill"></image>
						<image class="pic" v-else :src="www + (goodsSpec[activeSpec].goods_img || goodsDetailInfo.goods_img[0])" mode="aspectFill"></image>
					</view>
					<view class="specGoodsContent">
						<view class="specGoodsName singleHide">
							{{goodsDetailInfo.goods_name}}
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
							v-for="(item,index) in goodsSpec" 
							:key="index"
							@click="changeSpec(index)"
						>{{item.goods_spec_title}}</view>
					</view>
				</view>
				<view class="buyGoodsNum baseflex">
					<view class="buyTitle">
						购买数量
					</view>
					<view class="changeNum">
						<view class="sub numBtn" @click="sub">-</view>
						<input type="number" v-model="buyNum" @input="verification($event)" @blur="blurInput"/>
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
		</view>
		
		<!-- 送货方式 -->
		<view class="delivery">
			<view class="mask" @click="hideDeilvery" v-if="showDeliverys"></view>
			<view class="deliveryMain" :animation="animationDelivery">
				<view class="deliveryTitle">
					提货方式
				</view>
				<view class="deliveryType">
					<view class="deliveryItem" @click="delivery">
						<image class="pic" src="../../static/delivery1.png" mode=""></image>
						<text>送货上门</text>
					</view>
					<view class="deliveryItem" @click="selfMention">
						<image class="pic" src="../../static/delivery2.png" mode=""></image>
						<text>门店自提</text>
					</view>
				</view>
				<view class="close" @click="hideDeilvery">
					<image class="pic" src="../../static/icon_clone-line.png" mode=""></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	let app = getApp()
	import uniCountdown from "../../components/linnian-CountDown/uni-countdown.vue"
	import http from "@/utils/http.js"
	export default{
		components: {
			uniCountdown
		},
		data(){
			return {
				isIphoneX: false, // iphoneX手机
				
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0,
				reset: false,
				
				goodsInfo: [],
				
				goodsSpec: [], // 商品规格
				activeSpec: null, // 选中的规格
				
				
				showMore: false, // 展示更多
				animationData: {}, // 动画 翻转
				animationHeight: {}, // 动画 高度
				animationServer: {}, // 动画 服务说明
				animationSpec: {}, // 动画 选择规格
				animationDelivery: {}, // 动画 送货方式
				
				showOperation: false, // 显示展开更多按钮
				reasonHeight: '', // 高
				
				showPriceExpalin: false, // 显示价格说明
				showServerExpalin: false, // 显示服务说明
				showSpecs: false, // 显示选择规格
				showDeliverys: false, // 显示送货方式
				
				showGoTop: false, // 显示返回顶部
				
				buyNum: 1, // 购买数量
				buy: false, // 立即购买  false为 加入购物车
				
				type: 1, // 商品状态  1.默认状态   2.秒杀  3.清仓  4.议价
				id: '', // 商品id
				
				www: http.rootDocument, // 根路径
				
				goodsDetailInfo: {}, // 商品信息
				storeInfo: {}, // 商家信息
				user_id: 0,
				
				isFollow: false, // 是否关注
			}
		},
		onLoad(operation) {
			//我的项目中只赋值一次, 所以直接设为true了
			this.reset = !this.reset;
			//如果还要设置天, 时, 秒, 在上面声明绑定后, 在这里赋值即可
			this.minute = 30;
			
			this.type = operation.type;
			this.id = operation.id;
			
			console.log(operation);
			
			
			this.isIphoneX = app.globalData.isIphoneX;
			
					
		
			// 调整服务说明
			var animateServer = uni.createAnimation({
				duration: 0,
				timingFunction: 'ease',
			})
			this.animateServer = animateServer;
			this.animateServer.bottom(-300).step();
			this.animationServer = this.animateServer.export();
			
			// 规格选择
			var animateSpec = uni.createAnimation({
				duration: 0,
				timingFunction: 'ease',
			})
			this.animateSpec = animateSpec;
			this.animateSpec.bottom(-1000).step();
			this.animationSpec = this.animateSpec.export();
			
			// 送货方式选择
			var animateDelivery = uni.createAnimation({
				duration: 0,
				timingFunction: 'ease',
			})
			this.animateDelivery = animateDelivery;
			this.animateDelivery.bottom(-450).step();
			this.animationDelivery = this.animateDelivery.export();
		},
		onShow() {
			this.getGoodsDetail()
		},
		methods:{
			// 获取商品详情
			getGoodsDetail(){
				let that = this;
				let user_id = uni.getStorageSync('user_id') || 0;
				uni.showLoading()
				http.postJSON('api/goods/getGoodsInfo',{
					goods_id: this.id,
					user_id: user_id
				},function(res){
					console.log(res,'商品详情');
					uni.hideLoading()
					if(res.code != 200){
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						setTimeout(function(){
							uni.navigateBack()
						},1000)
						return
					}
					let utoken = uni.getStorageSync('utoken');
					let goodsId = res.data.id;
					if(utoken){ // 已经登录的情况  添加浏览记录  
						that.addGoodsBrowse(goodsId); 
					}else{ // 未登录的情况下将浏览商品的id存在本地
						let browsreArr = uni.getStorageSync('browsreArr');
						if(!browsreArr){
							browsreArr = [];
						}
						let idx = browsreArr.indexOf(goodsId);
						
						if(idx != -1){
							browsreArr.splice(idx,1);
						}
						browsreArr.unshift(goodsId);
						uni.setStorageSync('browsreArr',browsreArr);
					}
					
					that.goodsDetailInfo = res.data;
					that.goodsSpec = res.data.spec_list;
					that.storeInfo = res.data.store;
					that.goodsInfo = res.data.attr;
					that.type = res.data.goods_type
					setTimeout(function(){
						that.getGoodsInfoHeight();
					},0)
					that.computingTime()
				})
			},
			
			// 添加浏览记录历史
			addGoodsBrowse(id){
				http.postJSON('api/User/addGoodsLook',{
					ids: id
				},function(res){})
			},
			
			// 获取商品详情高度
			getGoodsInfoHeight(){
				// 调整商品详情高度
				const query = uni.createSelectorQuery().in(this);
				query.select('#goodsInfo').boundingClientRect(data => {
				  // console.log("得到布局位置信息" + JSON.stringify(data));
				  // console.log("节点离页面顶部的距离为" + data.top);
				  var animation = uni.createAnimation({
				  	duration: 0,
				  	timingFunction: 'ease',
				  })
				  this.animation = animation
				  if(data.height >= 200){
					  this.showOperation = true;
					  this.reasonHeight = data.height;
					  this.animation.height(200).step();
				  }else{
					  this.showOperation = false;
					  this.animation.height(data.height).step();
				  }
				  this.animationHeight = this.animation.export();
				}).exec();	
			},
			
			// 获取倒计时时分秒
			computingTime() {
				if(!this.goodsDetailInfo.end_time){
					return
				}
			    let startTime = new Date(); // 开始时间
			    let endTime = new Date(this.goodsDetailInfo.end_time); // 结束时间
			    let usedTime = endTime - startTime; // 相差的毫秒数
			    let days = Math.floor(usedTime / (24 * 3600 * 1000)); // 计算出天数
				
			    let leavel = usedTime % (24 * 3600 * 1000); // 计算天数后剩余的时间
			    let hours = Math.floor(leavel / (3600 * 1000)); // 计算剩余的小时数
				
			    let leavel2 = leavel % (3600 * 1000); // 计算剩余小时后剩余的毫秒数
			    let minutes = Math.floor(leavel2 / (60 * 1000)); // 计算剩余的分钟数
				
				let leavel3 = leavel2 % (60 * 1000);
				let seconds = Math.floor(leavel3 / 1000);
				
				// console.log(usedTime,'usedTime',leavel,'leavel',leavel2,'leavel2',leavel3,'leavel3');
				// console.log('-------------');
				// console.log(days + '天' + hours + '时' + minutes + '分' + seconds + '秒');
				
				this.days = days;
				this.hours = hours;
				this.minutes = minutes;
				this.seconds = seconds;
			},
			
			
			
			
			
			timeUp(data){
				console.log(data,'倒计时结束时的回调');
			},
			
			// 跳转商家首页
			jumpShophome(store_id){
				uni.navigateTo({
					url: "../shophome/shophome?store_id=" + store_id
				})
			},
			
			
			// 返回顶部
			goTop(){
				uni.pageScrollTo({
				    scrollTop: 0,
				    duration: 300,
				});
			},
			
			// 展示更多 or 隐藏折叠
			exhibition(){
				this.showMore = !this.showMore
				
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
				if (this.showMore) {
					this.animation.rotate(0).step()
					this.animation2.height(this.reasonHeight).step()
				} else {
					this.animation.rotate(180).step()
					this.animation2.height(200).step()
				}
				
				this.animationData = this.animation.export()
				this.animationHeight = this.animation2.export()
			},
		
			// 显示服务说明
			showServer(){
				this.showServerExpalin = true;
				var animateServer = uni.createAnimation({
					duration: 600,
					timingFunction: 'ease',
				})
				this.animateServer = animateServer;
				this.animateServer.bottom(0).step();
				this.animationServer = this.animateServer.export();
			},
			
			// 隐藏服务说明
			hideServer(){
				this.showServerExpalin = false;
				var animateServer = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				this.animateServer = animateServer;
				this.animateServer.bottom(-300).step();
				this.animationServer = this.animateServer.export();
			},
		
			// 切换选中的规格
			changeSpec(idx){
				this.activeSpec = idx;
			},
			
			// 加入购物车
			goBuy(){
				this.buy = false;
				this.showSpec()
			},
			
			// 立即购买
			buyNow(){
				this.buy = true;
				this.showSpec()
			},
			
			// 购买商品 or 添加购物车
			showSpec(){
				let utoken = uni.getStorageSync('utoken');
				if(!utoken){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},1000)
					return
				};
				if(this.goodsSpec.length <= 0){
					if(this.buy){
						console.log('立即下单');
						this.showDelivery()
					}else{
						console.log('加入购物车');
					}
					return
				}
				
				this.showSpecs = true;
				this.buyNum = 1
				var animateSpec = uni.createAnimation({
					duration: 600,
					timingFunction: 'ease',
				})
				this.animateSpec = animateSpec;
				this.animateSpec.bottom(0).step();
				this.animationSpec = this.animateSpec.export();
			},
			
			// 隐藏规格
			hideSpec(){
				this.showSpecs = false;
				var animateSpec = uni.createAnimation({
					duration: 500,
					timingFunction: 'ease',
				})
				this.animateSpec = animateSpec;
				this.animateSpec.bottom(-1000).step();
				this.animationSpec = this.animateSpec.export();
			},
			
			// 减少数量
			sub(){
				let buyNum = parseInt(this.buyNum)
				if(buyNum <= 1){
					console.log('不能再少了');
					return
				}
				buyNum -= 1
				this.buyNum = buyNum
			},
			
			// 增加数量
			add(){
				let buyNum = parseInt(this.buyNum)
				
				let activeSpec = this.activeSpec || 0;
				let goods_num = this.goodsSpec[activeSpec].goods_num;
				if(buyNum < goods_num){
					buyNum += 1
				}else{
					buyNum = goods_num
				}
				
				this.buyNum = buyNum;
			},
		
			// 数字校验
			verification(e){
				console.log(e.detail.value);
				this.buyNum = e.detail.value.replace(/[^\d]/g,'')
			},
			blurInput(){
				let buyNum = this.buyNum
				buyNum = buyNum.replace(/[^\d]/g,'');
				
				parseInt(buyNum);
				console.log(buyNum);
				
				let activeSpec = this.activeSpec || 0;
				let goods_num = this.goodsSpec[activeSpec].goods_num;
				
				if(buyNum <= 1){
					this.buyNum = 1;
					return
				}else if(buyNum < goods_num){
					buyNum += 1
				}else{
					buyNum = goods_num
				}
				this.buyNum = buyNum
			},
		
			// 加入购物车 or 立即购买
			buyClick(){
				let lgn = this.goodsSpec.length;
				if(lgn > 0){
					console.log(this.activeSpec);
					if(!this.activeSpec){
						if(this.activeSpec != 0){
							uni.showToast({
							title: '请选择规格',
							icon: 'none'
						})
						return
						}
						
					}
				}
				let that = this;
				http.postJSON('api/cart/incCartNum',{
					goods_id: this.goodsDetailInfo.id,
					spec_id: this.goodsSpec[this.activeSpec].id,
					num: this.buyNum
				},function(res){
					console.log(res,'点击加入购物车');
					if(res.code == 200){
						if(that.buy){
							uni.switchTab({
								url: '../car/car'
							})
						}else{
							uni.showToast({
								title: '加入购物车成功',
								icon: 'none',
								duration: 1500
							})
						}
						
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
				
				// if(this.buy){
				// 	console.log('立即下单');
				// 	this.showDelivery()
				// }else{
				// 	console.log('加入购物车');
				// 	http.postJSON('api/cart/incCartNum',{
				// 		goods_id: this.goodsDetailInfo.id,
				// 		spec_id: this.goodsSpec[this.activeSpec].id,
				// 		num: this.buyNum
				// 	},function(res){
				// 		console.log(res,'点击加入购物车');
				// 		if(res.code == 200){
				// 			uni.showToast({
				// 				title: '加入购物车成功',
				// 				icon: 'none',
				// 				duration: 1500
				// 			})
				// 		}else{
				// 			uni.showToast({
				// 				title: res.msg,
				// 				icon: 'none'
				// 			})
				// 		}
				// 	})
				// }
				this.hideSpec()
			},
			
			// 显示送货方式
			showDelivery(){
				this.showDeliverys = true
				var animateDelivery = uni.createAnimation({
					duration: 600,
					timingFunction: 'ease',
				})
				this.animateDelivery = animateDelivery;
				this.animateDelivery.bottom(0).step();
				this.animationDelivery = this.animateDelivery.export();
			},
			
			// 隐藏送货方式
			hideDeilvery(){
				this.showDeliverys = false
				var animateDelivery = uni.createAnimation({
					duration: 500,
					timingFunction: 'ease',
				})
				this.animateDelivery = animateDelivery;
				this.animateDelivery.bottom(-450).step();
				this.animationDelivery = this.animateDelivery.export();
			},
		
			// 送货上门
			delivery(){
				this.hideDeilvery();
				uni.navigateTo({
					url: "../confirmOrder/confirmOrder"
				})
			},
			
			// 自提订单
			selfMention(){
				this.hideDeilvery();
				uni.redirectTo({
					url: "../selfTakeOrder/pickUpCode"
				})
			},
			
			
			
			
			callTel(){
				// 拨打电话
				http.postJSON('api/user/getMobile',{
					id: this.goodsDetailInfo.id,
					type: 1
				},function(res){
					console.log(res,'拨打电话');
					if(res.code == 200){
						uni.makePhoneCall({
						  phoneNumber: res.data,
						  success(res) {
						    console.log(res, '拨打电话');
						  },
						  fail(err) {
						    console.log(err);
						  }
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			follow(){
				let utoken = uni.getStorageSync('utoken');
				if(!utoken){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../login/login'
						})
					},1000)
					return
				};
				console.log('点击收藏');
				// this.isFollow = !this.isFollow;
				let is_like = this.goodsDetailInfo.is_like == 1 ? 0 : 1;
				this.$set(this.goodsDetailInfo, 'is_like', is_like);
				http.postJSON('api/user/likeGoods',{
					goods_id: this.id,
					is_like: is_like
				},function(res){
					console.log(res,'收藏商品');
					uni.showToast({
						title: is_like == 0 ? '取消收藏' : '点击收藏',
						icon: 'none'
					})
				})
			},
			
			// 打开地图导航
			mapNavigation() {
				let latitude = this.goodsDetailInfo.store.lat;
				let longitude = this.goodsDetailInfo.store.lng;
				let name = this.goodsDetailInfo.store.address;
				// 打开地图并导航
				uni.openLocation({
					latitude: latitude-0,
					longitude: longitude-0,
					name,
					success(res) {
						console.log(res,'成功');
					},
					fail: (err) => {
						console.log(err,'失败');
						uni.showModal({
							content: '打开地图失败,请重'
						})
					}
				})
			},
		},
		onPageScroll(res) {
			//获取距离顶部距离
			const scrollTop = res.scrollTop;
			// 获取屏幕宽高
			const { windowWidth, windowHeight,statusBarHeight } = uni.getSystemInfoSync();	
			if(scrollTop >= 300){
				this.showGoTop = true
			}else{
				this.showGoTop = false
			}
		},
	}
</script>

<style lang="less">
	.root{
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	}
	.detailImg{
		width: 100%;
		height: 748rpx;
		
		.swiper-item {
			width: 100%;
			height: 748rpx;
			position: relative;
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
		}
	}
	
	.detailPrcie{
		width: 750rpx;
		// height: 132rpx;
		background: #ff2d2d;
		padding: 20rpx 30rpx;
		position: relative;
		.presentPrice{
			display: flex;
			max-width: 484rpx;
			.price{
				font-size: 28rpx;
				color: #fff;
				text{
					font-size: 42rpx;
				}
			}
			.priceReduction{
				// width: 200rpx;
				padding: 0 10rpx;
				height: 48rpx;
				background: linear-gradient(90deg,#ffd6ae, #fad6b2 100%);
				border-radius: 24rpx;
				font-size: 28rpx;
				color: #FF2D2D;
				line-height: 48rpx;
				text-align: center;
				margin-left: 20rpx;
			}
		}
		.originalPrice{
			color: #fff;
			font-size: 28rpx;
			max-width: 484rpx;
		}
		.timeLimit{
			position: absolute;
			right: 0;
			top: 0;
			width: 216rpx;
			height: 132rpx;
			background: #ffc634;
			.limitBox{
				width: 100%;
				height: 100%;
				padding: 28rpx 0;
				.limitTItle{
					margin-bottom: 12rpx;
					text-align: center;
					image{
						width: 28rpx;
						height: 28rpx;
						margin-right: 12rpx;
					}
					text{
						color: #6A3300;
						font-size: 28rpx;
					}
				}
				.countDown{
					display: flex;
					align-items: center;
					justify-content: center;
					color: #fff;
					font-size: 24rpx;
					text{
						width: 34rpx;
						height: 32rpx;
						background: #ffffff;
						border-radius: 4rpx;
						display: inline-block;
						text-align: center;
						line-height: 32rpx;
						color: #333;
						margin: 0 4rpx;
					}
				}
			}
		}
		.bargainingTxt{
			font-size: 28rpx;
			color: #fff;
		}
		.bargainingBtn{
			width: 152rpx;
			height: 48rpx;
			background: linear-gradient(90deg,#ffd6ae, #fad6b2 100%);
			border-radius: 24rpx;
			color: #FF2D2D;
			font-size: 28rpx;
			text-align: center;
			line-height: 45rpx;
			position: absolute;
			right: 14rpx;
			top: 50%;
			transform: translateY(-50%);
		}
		.clear{
			background-color: #E30707;
			.limitBox{
				.limitTItle{
					text{
						color: #fff;
					}
				}
			}
		}
	}

	.goodsDetail{
		padding: 20rpx 30rpx;
		.detailName{
			align-items: flex-start;
			.goodsName{
				font-size: 28rpx;
				color: #333;
				max-width: 570rpx;
			}
			.shareGoods{
				position: relative;
				display: flex;
				flex-direction: column;
				.shareImg{
					width: 46rpx;
					height: 46rpx;
				}
				.shareTxt{
					display: inline-flex;
				}
				text{
					font-size: 20rpx;
					color: #333;
				}
				button{
					position: absolute;
					left: 0;
					top: 0;
					width: 46rpx !important;
					height: 74rpx !important;
					opacity: 0;
				}
			}
		}
		.ensure{
			font-size: 28rpx;
			margin: 40rpx 0;
			.ensureTitle{
				color: #333;
			}
			.ensureContent{
				width: 570rpx;
				color: #999;
				max-width: 570rpx;
			}
			.ensureMore{
				width: 24rpx;
				height: 24rpx;
			}
		}
		
		.shopAddr{
			align-items: flex-start;
			margin-bottom: 40rpx;
			margin: 20rpx 0 40rpx;
			
			.shopAddressTxt{
				font-size: 28rpx;
				color: #333;
				max-height: 80rpx;
				max-width: 482rpx;
			}
			
			.shopOptions{
				display: flex;
				align-items: center;
				
				.shopIcon{
					display: flex;
					flex-direction: column;
					align-items: center;
					margin-left: 20rpx;
					image{
						width: 40rpx;
						height: 40rpx;
					}
					text{
						color: #333;
						font-size: 26rpx;
						margin-top: 8rpx;
					}
				}
			}
		}
		
		.shop{
			align-items: flex-start;
			padding: 40rpx 0;
			border-top: 4rpx solid #F0F0F0;
			.shopInfo{
				display: flex;
				align-items: center;
				.shopLogo{
					width: 100rpx;
					height: 100rpx;
					margin-right: 20rpx;
					border-radius: 20rpx;
					overflow: hidden;
				}
				.shopContent{
					.shopName{
						font-size: 32rpx;
						color: #333;
						margin-bottom: 20rpx;
					}
					.shopSpec{
						font-size: 24rpx;
						color: #666;
						margin-right: 40rpx;
						&:last-child{
							margin-right: 0;
						}
					}
				}
			}
			.toShop{
				width: 152rpx;
				height: 52rpx;
				line-height: 48rpx;
				text-align: center;
				border: 2rpx solid #333;
				border-radius: 12rpx;
				font-size: 28rpx;
				color: ff2d2d;
			}
		}
	
	}

	.detailInfo{
		.infoTitle{
			font-size: 28rpx;
			color: #333;
			margin-bottom: 12rpx;
		}
		.infoMain{
			width: 690rpx;
			// height: 480rpx;
			border: 1rpx solid #e5e5e5;
			border-radius: 20rpx;
			overflow: hidden;
			position: relative;
			// padding-bottom: 48rpx;
			.infoItem{
				display: flex;
				align-items: center;
				border-bottom: 1rpx solid #EBEBEB;
				font-size: 24rpx;
				.infoTItle-l{
					width: 200rpx;
					background: #f5f5f5;
					padding: 20rpx;
					height: auto;
					color: #666;
				}
				.infoContent-r{
					color: #333;
					padding: 20rpx;
					height: auto;
					background-color: #fff;
					width: 490rpx
				}
			}
			.lastOperation{
				height: 48rpx;
				width: 100%;
				line-height: 48rpx;
				text-align: center;
				position: absolute;
				bottom: 0;
				left: 0;
				background-color: #fff;
				text{
					color: #FF2D2D;
					font-size: 24rpx;
					margin-right: 12rpx;
					vertical-align: middle;
				}
				image{
					width: 24rpx;
					height: 24rpx;
					transform: rotate(180deg);
					vertical-align: middle;
				}
			}
		}
	}

	.goodsDetailImg{
		width: 750rpx;
		margin-top: 20rpx;
	}
	
	.goodsMore{
		color: #333;
		font-size: 28rpx;
		margin: 40rpx 0;
		text-align: center;
	}
	
	.priceExplain{
		padding: 40rpx 30rpx;
		font-size: 28rpx;
		color: #333;
		.explainTitle{
			margin: 20rpx 0;
		}
		.explainLeft{
			line-height: 50rpx;
			text{
				display: inline-block;
				min-width: 84rpx;
			}
		}
	}

	.bottomOperation{
		width: 750rpx;
		height: 98rpx;
		background: #ffffff;
		box-shadow: 0rpx 0rpx 8rpx 2rpx rgba(0, 0, 0, 0.25);
		padding: 20rpx 30rpx;
		position: fixed;
		z-index: 9;
		left: 0;
		bottom: 0;
		display: flex;
		height: calc(98rpx + env(safe-area-inset-bottom));
		justify-content: space-between;
		.baseOperation{
			display: flex;
			align-items: center;
			.basicsItem{
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				margin-right: 60rpx;
				&:last-child{
					margin-right: 0;
				}
				image{
					width: 48rpx;
					height: 48rpx;
				}
				text{
					color: #333;
					font-size: 24rpx;
					margin-top: 10rpx;
				}
			}
		}
		.payOperation{
			display: flex;
			align-items: center;
			border-radius: 4rpx;
			.payBtn{
				width: 172rpx;
				height: 64rpx;
				text-align: center;
				line-height: 64rpx;
				font-size: 28rpx;
			}
			.shoppingCar{
				color: #FF2D2D;
				background-color: #FFC7C7;
			}
			.buyNow{
				color: #fff;
				background-color: #FF2D2D;
			}
		}
	}
	
	.goTop{
		width: 100rpx;
		height: 100rpx;
		position: fixed;
		bottom: 246rpx;
		right: 4%;
		z-index: 10;
	}
	
	.mask{
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.6);
		z-index: 999;
	}
	
	.serverExplain{
		position: fixed;
		left: 0;
		bottom:0;
		width: 100%;
		max-height: 570rpx;
		min-height: 500rpx;
		background: #ffffff;
		border-radius: 10rpx 10rpx 0rpx 0rpx;
		z-index: 9999;
		.title{
			font-size: 32rpx;
			color: #333;
			text-align: center;
			margin: 30rpx 0 20rpx;
		}
		.serverMain{
			padding: 0 30rpx;
			box-sizing: border-box;
			width: 100%;
			height: 480rpx;
			.serverItem{
				margin-bottom: 40rpx;
				.serverTitle{
					font-size: 28rpx;
					color: #333;
				}
				.serverContent{
					color: #999;
					font-size: 24rpx;
				}
			}
		}
		.close{
			position: absolute;
			right: 30rpx;
			top: 20rpx;
			width: 40rpx;
			height: 40rpx;
		}
	}

	.specsExplain{
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		max-height: calc(100% - 100rpx);
		background: #ffffff;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
		z-index: 9999;
		padding: 40rpx 30rpx 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		.specGoodsInfo{
			display: flex;
			align-items: center;
			.specGoodsImg{
				width: 200rpx;
				height: 200rpx;
				border-radius: 8rpx;
				overflow: hidden;
				margin-right: 20rpx;
				flex-shrink: 0;
			}
			.specGoodsContent{
				flex-shrink: 0;
				max-width: 400rpx;
			}
			.specGoodsName{
				color: #333;
				font-size: 32rpx;
			}
			.specGoodsPrice{
				color: #FF2D2D;
				font-size: 28rpx;
				margin: 14rpx 0;
				text{
					font-size: 42rpx;
					margin: 0 4rpx;
				}
			}
			.specGoodsSpecs{
				color: #999;
				font-size: 28rpx;
				height: 76rpx;
			}
		}
		.goodsSpecAll{
			margin-top: 40rpx;
			.specTitle{
				font-size: 28rpx;
				color: #333;
				margin-bottom: 20rpx;
			}
			.selGoodsSpec{
				width: 100%;
				height: auto;
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				.goodsSpecItem{
					background: #e5e5e5;
					border-radius: 6rpx;
					padding: 12rpx;
					font-size: 28rpx;
					color: #666;
					margin-right: 20rpx;
					margin-bottom: 20rpx;
				}
				.activeSpecs{
					color: #fff;
					background-color: #FF2D2D;
				}
			}
		}
		.buyGoodsNum{
			margin: 50rpx 0 40rpx;
			.changeNum{
				display: flex;
				align-items: center;
			}
			.numBtn{
				width: 40rpx;
				height: 40rpx;
				background: #f2f2f2;
				border-radius: 4rpx;
				font-size: 32rpx;
				font-weight: 600;
				line-height: 40rpx;
				text-align: center;
			}
			input{
				height: 40rpx;
				max-width: 84rpx;
				text-align: center;
				font-size: 28rpx;
				color: #333;
			}
		}
		.buyOperation{
			width: 690rpx;
			height: 72rpx;
			background: #ff2d2d;
			border-radius: 10rpx;
			line-height: 72rpx;
			text-align: center;
			font-size: 28rpx;
			color: #fff;
		}
		.close{
			position: absolute;
			right: 30rpx;
			top: 20rpx;
			width: 40rpx;
			height: 40rpx;
		}
	}
	
	.deliveryMain{
		position: fixed;
		left: 0;
		bottom: 0;
		width: 750rpx;
		height: 406rpx;
		background: #ffffff;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
		z-index: 9999;
		padding: 0 30rpx;
		.deliveryTitle{
			font-size: 36rpx;
			color: #333;
			margin: 30rpx 0 40rpx;
			text-align: center;
		}
		.deliveryItem{
			width: 690rpx;
			height: 116rpx;
			background: #ffffff;
			box-shadow: 0rpx 0rpx 12rpx 0rpx rgba(0,0,0,0.12); 
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 28rpx;
			image{
				width: 80rpx;
				height: 80rpx;
				margin-right: 20rpx;
			}
			text{
				color: #333;
				font-size: 36rpx;
			}
			&:last-child{
				margin-bottom: 0;
			}
		}
		.close{
			position: absolute;
			right: 30rpx;
			top: 20rpx;
			width: 40rpx;
			height: 40rpx;
		}
	}
	
</style>
