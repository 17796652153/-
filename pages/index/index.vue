<template>
	<view :class="showAllNav ? 'root' : ''">
		<!-- 头部 -->
		<headerSearch 
			:showAddr="true"
			:showOperation="userInfo.is_store != 1"
			:address="currentCity || '选择城市'"
			:searchTxt="'请输入内容搜索'"
			:operationTxt="'商家入驻'"
			:operationMore="true"
			@jumpSearch="jumpSearch"
			@jumpSettled="jumpSettled"
			@jumpSelCity="jumpSelCity"
		></headerSearch>
		<!-- header导航 -->
		<view class="headerNav">
			<scroll-view class="scrollView" scroll-x="true" enable-flex="true">
				<view :class="headNav == 0 ? 'activeHeadItem headerNavItem' : 'headerNavItem'" @click="changeHeadNav(0)"><text>热门</text></view>
				<view :class="headNav == index + 1 ? 'activeHeadItem headerNavItem' : 'headerNavItem'" v-for="(item, index) in headerNav"
				 :key="index" @click="changeHeadNav(index + 1)">
					<text>{{item.title}}</text>
				</view>
			</scroll-view>
			<view class="headerNavImg" @click="clickMoreNav">
				<image :animation="animationData" src="../../static/icon_arrow-down.png" mode=""></image>
			</view>
		</view>
		<!-- 所有的headerNav导航 -->
		<view class="allNav" v-if="showAllNav">
			<scroll-view scroll-y="true">
				<view class="allNavList">
					<view class="allNavItem baseflex" v-for="(item,index) in headerNav" :key="index" @click="changeHeadNav(index + 1)">
						<image :src="www + item.img" mode=""></image>
						<text>{{item.title}}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		<swiper :indicator-dots="false" :autoplay="false" class="swiperView" @change="changeSwiper" :current="headNav">
			<swiper-item v-for="(value,idx) in headerNav.length + 1" :key="idx">
				<scroll-view scroll-y="true" class="scroll" @scrolltolower="scrolltolower">
					<!-- banner轮播 -->
					<swiper class="bannerSwiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="800" v-show="headNav == 0">
						<swiper-item v-for="(item,index) in bannerList" :key="index">
							<view class="swiper-item">
								<image class="pic" :src="www + item.banner_img" :alt="item.banner_title" mode="aspectFill"></image>
							</view>
						</swiper-item>
					</swiper>
					<!-- nav导航 -->
					<view class="nav">
						<view class="navItem" @click="jumpNavigation(index,item.id)" v-for="(item,index) in navLIst" :key="index">
							<image v-if="headNav == 0" :src="item.img" mode=""></image>
							<image v-else :src="www + item.img" mode=""></image>
							<text>{{item.title}}</text>
						</view>
						<button open-type="contact" v-if="headNav == 0">联系客服</button>
					</view>
					<!-- 首页商品列表 -->
					<view class="homeGoods">
						<!-- 筛选条件 -->
						<view class="screen">
							<view class="screenItem" @click="selectScreen(0)"><text :class="0 == screenIdx ? 'activeScreen' : ''">附近商家</text></view>
							<view class="screenItem" @click="selectScreen(1)">
								<text :class="1 == screenIdx ? 'activeScreen' : ''">{{selectCity || '所在地区'}}</text>
								<image v-if="1 != screenIdx" src="../../static/icon_arrow_downGray.png" mode="aspectFill"></image>
								<image v-else src="../../static/icon_arrow_redUp.png" mode="aspectFill"></image>
								
								<view :class="showAddrMore ? 'hideScreenBox addrBox showAddrScreen' : 'hideScreenBox addrBox'">
									<scroll-view scroll-y="true" class="provinceScroll cityAggregate">
										<block v-if="province.length > 0">
											<view 
												:class="0 == provinceIdx ? 'activeProvince' : ''"
												@click.stop="provinceSelectAll">
												所有地区
											</view>
											<view 
												:class="Number(index) + 1 == provinceIdx ? 'activeProvince' : ''" 
												v-for="(item,index) in province" 
												:key="index" 
												@click.stop="provinceTapped(index)">
												{{item}}
											</view>
										</block>
									</scroll-view>
									<scroll-view scroll-y="true" class="cityScroll cityAggregate">
										<block v-if="city.length > 0">
											<view class="" @click.stop="citySelectAll">
												所有地区
											</view>
											<view class="" v-for="(item,index) in city" :key="index" @click.stop="cityTapped(index)">
												{{item}}
											</view>
										</block>
									</scroll-view>
								</view>
							</view>
							<view class="screenItem" @click="selectScreen(2)">
								<text :class="2 == screenIdx ? 'activeScreen' : ''">{{screenSortIdx ? soltArr[screenSortIdx] : '综合排序'}}</text>
								<image v-if="2 != screenIdx" src="../../static/icon_arrow_downGray.png" mode="aspectFill"></image>
								<image v-else src="../../static/icon_arrow_redUp.png" mode="aspectFill"></image>
								
								<view :class="showSoltMore ? 'hideScreenBox slotBox showSoltScreen' : 'hideScreenBox slotBox'">
									<view 
										:class="index == screenSortIdx ? 'hideScreenContent activeHideContent' : 'hideScreenContent'" 
										v-for="(item,index) in soltArr" 
										:key="index"
										@click.native.stop="sortScreen(index)">
										{{item}}
									</view>
								</view>
							</view>
						</view>
						<!-- <screenCondotions></screenCondotions> -->
						<!-- 商品列表 -->
						<view class="goodsList" v-if="goodsList.length > 0">
							<view class="goodsItem" v-for="(item,index) in goodsList" :key="index" @click="jumpGoodsDetail(item.id,item.goods_type)">
								<view class="shopName">
									{{item.store.store_name}}
								</view>
								<view class="goodsMain">
									<view class="goodsImg">
										<image class="pic" :src="www + item.goods_icon" mode=""></image>
										<text>{{item.store.district}}</text>
									</view>
									<view class="goodsRight">
										<view class="goodsRightTop">
											<view class="goodsTitle">
												<view class="content"><text class="seckillBtn" v-if="item.goods_type == 2">秒杀</text> {{item.goods_name}}</view>
											</view>
											<view class="praise">
												<image src="../../static/icon_praise.png" mode=""></image>
												<text>{{item.look_num}}</text>
											</view>
										</view>
										<view class="ensure">
											<!-- 正品保证·退货运费险·假一赔十 -->
											{{item.goods_des_title}}
										</view>
										<view class="goodsNum baseflex" :class="item.goods_type == 4 ? 'bargaining' : ''">
											<view class="originalPrice" v-if="item.goods_type != 4">
												原价:￥<text>{{item.goods_money}}</text>
											</view>
											<view class="goodsLimit" v-if="item.max_num != 0">
												每人限购{{item.max_num}}份
											</view>
											<!-- <view class="goodsLimit">
												每人限购{{item.max_num}}份
											</view> -->
										</view>
										<view class="goodsPrice baseflex">
											<view class="price" v-if="item.goods_type != 4">
												零售价: <text>￥{{item.goods_price}}</text>
											</view>
											<view class="price" v-else>
												<text>可议价</text>
											</view>
											<view class="addCar">
												加入购物车
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
						<view class="goodsNull" v-else>
							暂无商品
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import headerSearch from "../../components/headerSearch/headerSearch.vue"
	import screenCondotions from "../../components/screenConditions/screenConditions"
	import http from "@/utils/http.js"
	
	// 引入SDK核心类
	var QQMapWX = require("@/utils/qqmap-wx-jssdk.min.js");
	var qqmapsdk; // app.js
	var app = getApp()
	// 实例化API核心类
	qqmapsdk = new QQMapWX({
	  key: app.globalData.qqmapsdkKey
	});
	export default {
		components:{
			headerSearch,
			screenCondotions
		},
		data() {
			return {
				showSoltMore: false, // 筛选条件
				showAddrMore: false, // 筛选条件
				
				currentCity: '', // 选择城市
				www: http.rootDocument, // 根路径
				
				bannerList: [], // banner图
				headerNav: [], // header导航
				navLIst: [{
						img: '../../static/home_nav1.png',
						title: '限时抢'
					}, {
						img: '../../static/home_nav2.png',
						title: '清仓'
					}, {
						img: '../../static/home_nav3.png',
						title: '信息服务'
					}, {
						img: '../../static/home_nav4.png',
						title: '产地工厂'
					}, {
						img: '../../static/home_nav6.png',
						title: '求购信息'
					}, {
						img: '../../static/home_nav7.png',
						title: '关于我们'
					}, {
						img: '../../static/home_nav8.png',
						title: '联系客服'
					}, ], // nav列表
				headNav: 0, // 选中的headnav导航
				screenIdx: 0, // 选中的筛选索引
				showAllNav: false, // 显示所有的
				animationData: {}, // 动画 翻转
				
				latitude: '', // 维度
				longitude: '', // 经度
				page: 1, // 页码
				last_page: 1, // 最后一页
				total: 0, // 总条数
				goodsList: [], // 商品列表
				
				userInfo: {}, // 用户信息
				
				hidePage: false, // 离开页面
				
				province: [], // 省份名称列表
				provinceObjects: [], // 省份列表
				city: [],
				cityObjects: [], // 城市列表
				provinceIdx: null, // 选中的省份
				selectProvince: '', // 选择的省份
				selectCity: '', // 选择的城市
				
				screenSortIdx: null, // 选中的筛选
				soltArr: ['销量', '价格从高到低' ,'价格从低到高'], // 
			}
		},
		onLoad() {
			this.getBanner();
			this.getNavCategory();
			let longitude = uni.getStorageSync('longitude');
			if(!longitude){
				this.addEventAuth()
			}
		},
		onShow() {
			this.onshowFunction();
		},
		methods: {
			onshowFunction(){
				this.currentCity = uni.getStorageSync('currentCity');
				this.longitude = uni.getStorageSync('longitude');
				this.latitude = uni.getStorageSync('latitude');
				
				let currentCityObj = uni.getStorageSync('currentCityObj');
				console.log(currentCityObj,'currentCityObj');
				if(currentCityObj.name){
					console.log('进来了');
					this.currentCity = currentCityObj.name;
					this.longitude = currentCityObj.lng;
					this.latitude = currentCityObj.lat;
					this.getHomeGoods(1)
				}else{
					console.log('没进来');
					this.getHomeGoods(1);
				}
				
				let utoken = uni.getStorageSync('utoken');
				if(utoken){
					this.getUserInfo();
				}
			},
			
			// 监听用户是否确认了授权登录
			addEventAuth(){
				let that = this;
				setTimeout(function(){
					/** 获取权限
					 * res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
					    res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
					    res.authSetting['scope.userLocation'] == true    表示 地理位置授权*/
					uni.getSetting({
					    success: (res) => {
							console.log(res,JSON.stringify(res,'getSetting'))
							if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
								uni.showModal({
									title: '请求授权当前位置',
									content: '需要获取您的地理位置，请确认授权',
									success: function (res) {
										if (res.cancel) {
											uni.showToast({title: '拒绝授权',icon: 'none'})
										} else if (res.confirm) {
											uni.openSetting({
												success: function (dataAu) {
												console.log(dataAu,'openSetting')
												if (dataAu.authSetting["scope.userLocation"] == true) {
													uni.showToast({title: '授权成功',icon: 'none'})
													that.onshowFunction()
													//再次授权，调用wx.getLocation的API
													// vm.getLocation();
												} else {
													uni.showToast({title: '授权失败',icon: 'none',})
												}
											}
										})
									}
								}
					        })
					        } else if (res.authSetting['scope.userLocation'] == undefined) {
								//调用wx.getLocation的API
								console.log('首次授权');
								that.addEventAuth()
					        }else {
								//调用wx.getLocation的API
								console.log('调用wx.getLocation的API')
								that.onshowFunction()
					        }
						},
						complete() {
							console.log('getSetting')
						}
					})
				},2000)
			},
			
			
			
			// 滑动页面切换分类
			changeSwiper(e){
				console.log(e,'滑动页面');
				let currentIdx = e.detail.current;
				this.headNav = currentIdx;
				
				uni.showLoading({
					title: '加载中'
				})
				if(currentIdx == 0){
					this.selectHeadNav(0,0);
				}else{
					this.headerNav.forEach((item,index) => {
						if(index + 1 == currentIdx){
							this.selectHeadNav(currentIdx, item.id);
						}
					})
					
				}
			},
			
			changeHeadNav(idx){
				this.headNav = idx;
			},
			
			
			// 查询轮播
			getBanner(){
				let that = this;
				http.postJSON('api/index/getBanner',{},function(res){
					// console.log(res);
					that.bannerList = res.data
				})
			},
			
			// 获取nav类目
			getNavCategory(){
				let that = this;
				http.postJSON('api/index/getCategoryPid',{
					pid: 0
				},function(res){
					// console.log(res,'导航类目');
					that.headerNav = res.data
				})
			},
			
			// 获取首页商品
			getHomeGoods(type, cate_one = 0, ){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				let data = {};
				let sort = 0;
				if(this.screenSortIdx != null){
					sort = Number(this.screenSortIdx) + 1;
				}
				let province = this.selectProvince || 0;
				let city = this.selectCity || 0;
				
				if(type == 1){
					data = {
						type: type,
						lng: this.longitude,
						lat: this.latitude,
						page: this.page,
						cate_one: cate_one,
						sort: sort
					}
				}else if(type == 2){
					data = {
						type: type,
						province: province,
						city: city,
						page: this.page,
						cate_one: cate_one,
						sort: sort
					}
				}else if(type == 3){
					data = {
						type: type,
						page: this.page,
						cate_one: cate_one,
						province: province,
						city: city,
						sort: sort
					}
				}
				uni.showLoading()
				http.postJSON('api/index/queryGoodsList',data,function(res){
					console.log(res,'首页商品列表');
					uni.hideLoading()
					if(res.code == 200){
						that.goodsList = that.goodsList.concat(res.data.data);
						that.total = res.data.total;
						that.last_page = res.data.last_page;
						that.page = res.data.current_page;
					}
				})
			},
			
			// 获取用户信息
			getUserInfo(){
				let that = this;
				http.postJSON('api/User/getUserInfo',{},function(res){
					console.log(res,'用户信息');
					that.userInfo = res.data
				})
			},
			
			// 点击切换筛选条件
			selectScreen(idx) {
				
				if(idx == 1){
					this.screenIdx = idx;
					this.showAddrMore = !this.showAddrMore;
					this.showSoltMore = false;
					if(this.showAddrMore && this.provinceObjects.length <= 0){
						let that = this;
						this.getArea(100000, function(area) {
							var array = [];
							for (var i = 0; i < area.length; i++) {
								array[i] = area[i].name;
							}
							that.province = array;
							that.provinceObjects = area;
						});
					}
				}else if(idx == 2){
					this.showSoltMore = !this.showSoltMore;
					console.log('showSoltMore', this.showSoltMore)
					this.showAddrMore = false;
				}else{
					this.screenIdx = idx;
					this.goodsList = [];
					this.page = 1;
					this.getHomeGoods(1);
				}
			},
			
			// 获取省份列表
			getArea: function(pid, cb) {
				var that = this;
				http.postJSON('api/Index/queryAddress',{
					pid: pid
				}, function(res) {
					cb(res.data);
				})
			},
			
			// 省选择 -- 所有地区
			provinceSelectAll(){
				this.provinceIdx = 0;
				this.selectCity = 0;
				this.selectProvince = 0;
				this.showAddrMore = false;
				
				this.goodsList = [];
				this.page = 1;
				this.getHomeGoods(2);
			},
			
			// 省选择
			provinceTapped(index){
				this.provinceIdx = Number(index) + 1;
				this.selectProvince = this.province[index];
				var that = this;
				// provinceObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
				// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
				this.getArea(this.provinceObjects[index].id, function(area) {
					var array = [];
					for (var i = 0; i < area.length; i++) {
						array[i] = area[i].name;
					}
					// city就是wxml中渲染要用到的城市数据，cityObjects是LeanCloud对象，用于县级标识取值
					that.city = array;
					that.cityObjects = area;
				});
			},
			
			// 市选择 -- 所有城市
			citySelectAll(){
				this.selectCity = 0;
				this.showAddrMore = false;
				
				this.goodsList = [];
				this.page = 1;
				this.getHomeGoods(2);
			},
			
			// 市选择
			cityTapped(index){
				console.log(this.cityObjects[index].name,' 点击选择的城市');
				this.selectCity = this.city[index];
				this.showAddrMore = false;
				
				this.goodsList = [];
				this.page = 1;
				this.getHomeGoods(2);
			},

			// 排序选择
			sortScreen(index, event){
				console.log('index',index);
				this.screenSortIdx = index;
				this.showSoltMore = false;
				this.goodsList = [];
				this.page = 1;
				this.getHomeGoods(Number(this.screenIdx) + 1);
			},

			// 点击切换headNav导航
			selectHeadNav(idx,id) {
				this.headNav = idx;
				if(id){
					let that = this;
					http.postJSON('api/index/getCategoryPid',{
						pid: id
					},function(res){
						console.log(res,'nav类目');
						that.navLIst = res.data;
					})
				}else{
					let data = [{
						img: '../../static/home_nav1.png',
						title: '限时抢'
					}, {
						img: '../../static/home_nav2.png',
						title: '清仓'
					}, {
						img: '../../static/home_nav3.png',
						title: '信息服务'
					}, {
						img: '../../static/home_nav4.png',
						title: '产地工厂'
					}, {
						img: '../../static/home_nav6.png',
						title: '求购信息'
					}, {
						img: '../../static/home_nav7.png',
						title: '关于我们'
					}, {
						img: '../../static/home_nav8.png',
						title: '联系客服'
					}, ];
					
					this.navLIst = data;
				}
				
				this.goodsList = [];
				this.page = 1;
				this.getHomeGoods(this.screenIdx + 1,id);
				
				this.showAllNav = false
				var animation = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				this.animation = animation
				this.animationData = this.animation.rotate(0).step().export()
			},

			// 点击所有的导航
			clickMoreNav() {
				this.showAllNav = !this.showAllNav;

				var animation = uni.createAnimation({
					duration: 400,
					timingFunction: 'ease',
				})
				this.animation = animation
				if (this.showAllNav) {
					this.animation.rotate(180).step()
				} else {
					this.animation.rotate(0).step()
				}

				this.animationData = this.animation.export()
			},

			// 跳转nav导航
			jumpNavigation(idx,id) {
				if(this.headNav == 0){
					console.log('点击跳转基本页面');
					switch (idx) {
						case 0:
							console.log('点击 限时抢');
							uni.navigateTo({
								url: "../seckill/seckill"
							})
							break;
						case 1:
							console.log('点击 清仓');
							uni.navigateTo({
								url: "../clearance/clearance"
							})
							break;
						case 2:
							console.log('点击 信息服务');
							uni.navigateTo({
								url: "../infoServer/infoServerHall"
							})
							break;
						case 3:
							console.log('点击 产地工厂');
							uni.navigateTo({
								url: "../factory/factory"
							})
							break;
						case 4:
							console.log('点击 求购信息');
							uni.navigateTo({
								url: "../wantBuy/wantBuyHall"
							})
							break;
						case 5:
							console.log('点击 关于我们');
							uni.navigateTo({
								url: '../agreement/agreement?type=7'
							})
							break;
						case 6:
							console.log('点击 联系客服');
							break;
						default:
							console.log('走向 默认');
							break;
					}
				}else{
					console.log(id);
					uni.navigateTo({
						url: '../search/searchGoods?cate_two=' + id
					})
				}
			},
		
			// 跳转商家入驻
			jumpSettled(){
				uni.navigateTo({
					url: "../merchant/merchantSettled"
				})
			},
			
			// 跳转搜索
			jumpSearch(){
				uni.navigateTo({
					url: "../search/search"
				})
			},
			
			// 跳转城市搜索
			jumpSelCity(){
				this.goMap()
				return
				uni.navigateTo({
					url: "./selCity"
				})
			},
			
			goMap() {
				let that = this;
				uni.authorize({
					scope: 'scope.userLocation',
					success(res) {
						uni.chooseLocation({
							success: function(res) {
								console.log(res, '地址');
								console.log('位置名称：' + res.name);
								console.log('详细地址：' + res.address);
								console.log('纬度：' + res.latitude);
								console.log('经度：' + res.longitude);
								that.address = res.address
								that.lng = res.longitude;
								that.lat = res.latitude;
			
								// 调用接口
								qqmapsdk.reverseGeocoder({
									location: {
										latitude: res.latitude,
										longitude: res.longitude
									},
									success: function(req) {
										console.log(req,'当前位置,根据经纬度');
										let tempData = req.result.address_component;
										that.currentTempData = tempData;
										
										let currentCityObj = {
											name: tempData.city,
											lng: res.longitude,
											lat: res.latitude
										}
			
										// 存储到本地
										uni.setStorageSync('currentTempDate', tempData);
										uni.setStorageSync('currentCity', tempData.city);
										uni.setStorageSync('currentCityObj',currentCityObj);
										uni.setStorageSync('currentTempData',req.result.ad_info);
										uni.setStorageSync('tempAd_info',tempAd_info);
										
										that.currentCity = currentCityObj.name;
										that.longitude = currentCityObj.lng;
										that.latitude = currentCityObj.lat;
										that.page = 1;
										that.goodsList = [];
										that.getHomeGoods(1)
									},
									fail: function(error) {
										console.log("err")
										console.error(error);
									}
								})
							}
						});
					},
					fail(err) {
			
					}
				})
			},
			
			// 跳转商品详情
			jumpGoodsDetail(id,type){
				uni.navigateTo({
					url: "../goods/details?id=" + id + '&type=' + type
				})
			},
			
			// 页面滚动到底部时触发
			scrolltolower(){
				console.log('滚动到了底部');
				if(this.page < this.last_page){
					this.page ++;
					this.getHomeGoods(this.screenIdx + 1)
				}else{
					uni.showToast({
						title: '没有更多了',
						icon: 'none'
					})
				}
			},
		},
		onHide() {
			if(this.goodsList.length > 0){
				console.log('离开页面');
				this.hidePage = true;
			}
		},
		onReachBottom(){
			console.log('触底了');
			return
			if(this.page < this.last_page){
				this.page ++;
				this.getHomeGoods(this.screenIdx + 1)
			}else{
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
		onPullDownRefresh(){
			console.log('下拉刷新了');
			this.page = 1;
			this.goodsList = [];
			this.longitude = uni.getStorageSync('longitude');
			this.latitude = uni.getStorageSync('latitude');
			this.getHomeGoods(this.screenIdx + 1);
			uni.stopPullDownRefresh();
		},
		onShareAppMessage() {
		    return {
		      title: '转发好友这个视频',
		      // promise 
		    }
		},
		onShareTimeline(){},
	}
</script>

<style>
	page {
		background: #FFFFFF;
	}
</style>
<style lang="less">
	.root {
		position: fixed;
		top: 0;
		height: 100%;
		overflow: hidden;
	}

	.headerNav {
		width: 750rpx;
		height: 72rpx;
		position: relative;
		overflow: hidden;

		.scrollView {
			width: 750rpx;
			height: 72rpx;
			display: flex;
			padding-right: 72rpx;
			white-space: nowrap;

			view {
				flex-shrink: 0;
			}

			.headerNavItem {
				padding: 20rpx;
				min-width: 56rpx;
				font-size: 28rpx;
				color: #333;
				display: inline-block;
			}

			.headerNavItem:last-child {
				padding-right: 72rpx;
			}

			.activeHeadItem {
				color: #FF2D2D;

				text {
					position: relative;

					&::after {
						content: "";
						position: absolute;
						width: 44rpx;
						height: 4rpx;
						background: #ff2d2d;
						border-radius: 2rpx;
						display: inline-block;
						left: 50%;
						bottom: -8rpx;
						transform: translateX(-50%);
					}
				}

			}

		}

		.headerNavImg {
			width: 60rpx;
			height: 72rpx;
			background: #ffffff;
			box-shadow: 2rpx 0rpx 12rpx 4rpx rgba(0, 0, 0, 0.41);
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			right: 0;
			top: 0;

			image {
				width: 28rpx;
				height: 28rpx;
			}
		}
	}

	.allNav {
		width: 100%;
		height: calc(100% - 176rpx);
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 99;
		background-color: #fff;

		scroll-view {
			width: 100%;
			height: 100%;
			padding: 20rpx 0;

			.allNavList {
				display: flex;
				align-items: center;
				flex-wrap: wrap;

				.allNavItem {
					flex-direction: column;
					justify-content: center;
					width: 20%;
					height: 132rpx;

					image {
						width: 72rpx;
						height: 72rpx;
						border-radius: 50%;
						margin-bottom: 12rpx;
					}

					text {
						color: #333;
						font-size: 24rpx;
					}
				}
			}
		}
	}

	.swiperView{
		height: calc(100vh - 176rpx);
	}
	.scroll{
	    height: 100%;
	}

	.bannerSwiper {
		height: 352rpx;

		.swiper-item {
			width: 100%;
			height: 352rpx;
		}
	}

	.nav {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin: 20rpx 0;
		position: relative;
		button{
			position: absolute;
			right: 186rpx;
			bottom: 0;
			width: 188rpx;
			height: 164rpx;
			opacity: 0;
		}

		.navItem {
			width: 25%;
			height: 164rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			image {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
			}

			text {
				font-size: 28rpx;
				color: #333;
				margin-top: 16rpx;
			}
		}
	}

	.screen {
		display: flex;
		align-items: center;

		.screenItem {
			flex: 1;
			height: 68rpx;
			text-align: center;
			line-height: 68rpx;
			font-size: 28rpx;
			color: #999;
			position: relative;
			margin-bottom: 20rpx;

			.activeScreen {
				color: #FF2D2D;

				// &::after {
				// 	content: "";
				// 	position: absolute;
				// 	bottom: 4rpx;
				// 	left: 50%;
				// 	transform: translateX(-50%);
				// 	width: 100rpx;
				// 	height: 4rpx;
				// 	background: #ff2d2d;
				// 	border-radius: 2rpx;
				// }
			}
			
			image{
				width: 28rpx;
				height: 28rpx;
				margin-left: 20rpx;
				vertical-align: middle;
			}
		}
	}
	
	.hideScreenBox{
		position: absolute;
		top: 68rpx;
		z-index: 99;
		overflow: hidden;
		transition: all 0.3s;
		
		.hideScreenContent{
			width: 750rpx;
			height: 84rpx;
			background: #f5f5f5;
			color: #333;
			font-size: 28rpx;
			text-align: center;
			line-height: 84rpx;
		}
		
		.activeHideContent{
			background-color: #fff;
		}
	}
	
	.slotBox{
		height: 0;
		left: -500rpx;
	}
	
	.showSoltScreen{
		height: 252rpx;
	}
	
	.addrBox{
		height: 0;
		width: 750rpx;
		left: -250rpx;
		display: flex;
	}
	
	.cityAggregate{
		height: 588rpx;
		overflow: hidden;
		
		view{
			// height: 84rpx;
			padding: 28rpx 0;
			line-height: 40rpx;
		}
	}
	
	.provinceScroll{
		flex: 2;
		background-color: #F5F5F5;
		
		.activeProvince{
			background-color: #fff;
		}
	}
	
	.cityScroll{
		flex: 8;
		background-color: #fff;
		view{
			text-align: left;
			padding-left: 30rpx;
		}
	}
	
	.showAddrScreen{
		height: 588rpx;
	}

	.goodsList {
		padding: 0 30rpx;

		.goodsItem {
			border-top: 4rpx solid #EBEBEB;
			padding-bottom: 40rpx;

			.shopName {
				font-size: 36rpx;
				color: #333;
				margin: 20rpx 0;
			}

			.goodsMain {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.goodsImg {
					width: 240rpx;
					height: 240rpx;
					border-radius: 20rpx;
					overflow: hidden;
					position: relative;
					margin-right: 20rpx;

					text {
						position: absolute;
						left: 0;
						bottom: 0;
						width: 124rpx;
						height: 32rpx;
						background: #ff2d2d;
						border-radius: 0rpx 20rpx 0rpx 0rpx;
						color: #fff;
						font-size: 24rpx;
						text-align: center;
						line-height: 32rpx;
					}
				}

				.goodsRight {
					width: 430rpx;

					.goodsRightTop {
						display: flex;
						justify-content: space-between;

						.goodsTitle {
							width: 328rpx;

							.content {
								height: 76rpx;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2;
								overflow: hidden;
								text-overflow: ellipsis;
								font-size: 28rpx;
								color: #333;

								.seckillBtn {
									display: inline-block;
									width: 56rpx;
									height: 28rpx;
									background: #ff2d2d;
									border-radius: 8rpx;
									text-align: center;
									line-height: 28rpx;
									color: #fff;
									font-size: 20rpx;
									margin-right: 10rpx;
								}
							}
						}

						.praise {
							display: flex;
							align-items: center;
							flex-direction: column;

							image {
								width: 36rpx;
								height: 36rpx;
							}

							text {
								font-size: 20rpx;
								color: #FF2D2D;
							}
						}
					}

					.ensure {
						font-size: 24rpx;
						color: #04B901;
						margin: 14rpx 0 34rpx;
					}

					.goodsNum {
						margin-bottom: 12rpx;

						.originalPrice,
						.goodsLimit {
							color: #666;
							font-size: 20rpx;
						}
					}
					
					.bargaining{
						justify-content: flex-end;
					}

					.goodsPrice {
						.price {
							font-size: 22rpx;
							color: #333;

							text {
								font-size: 34rpx;
								color: #FF2D2D;
							}
						}

						.addCar {
							width: 192rpx;
							height: 40rpx;
							line-height: 40rpx;
							text-align: center;
							background: #2d8dff;
							border-radius: 20rpx;
							color: #fff;
							font-size: 24rpx;
						}
					}
				}
			}
		}
	}
	
	.goodsNull{
		color: #999;
		text-align: center;
		margin: 20rpx auto;
	}
</style>
