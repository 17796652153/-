<template>
	<view class="">
		<!-- 头部 - 工厂图片 -->
		<view class="headerImg">
			<swiper class="swiperView" :circular="true" :autoplay="true" next-margin="90" :interval="3000" :duration="1000">
				<swiper-item v-for="(item,index) in factortDetail.factory_imgs" :key="index">
					<view class="swiper-item">
						<image class="pic" :src="www + item" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="main">
			<!-- 工厂信息 -->
			<view class="factoryInfo factoryBox">
				<view class="factoryName">
					{{factortDetail.factory_name}}
				</view>
				<view class="business">
					主营：{{factortDetail.main_factory}}
				</view>
				<view class="factoryAddr baseflex">
					<view class="factoryAddressTxt multiHide">
						{{factortDetail.address}}
					</view>
					<view class="factoryOptions">
						<view class="factoryIcon" @click="mapNavigation">
							<image src="../../static/icon_location.png" mode=""></image>
							<text>导航</text>
						</view>
						<view class="factoryIcon" @click="callTel">
							<image src="../../static/icon_call.png" mode=""></image>
							<text>电话</text>
						</view>
					</view>
				</view>
				<view class="factoryInfoBtn">
					<view class="operationInfo" @click="jumpshophome(factortDetail.store_id)">进入店铺</view>
					<view class="operationInfo">分享工厂
						<button open-type="share" class="friend">好友</button>
					</view>
					<view class="operationInfo" @click="followFactory">{{factortDetail.is_like == 0 ? '收藏工厂' : '取消收藏'}}</view>
				</view>
			</view>

			<!-- 工厂样品 -->
			<view class="factorySample factoryBox" id="sample">
				<view class="sampleNav">
					<view :class="index == 0 ? 'sampleItem activeSample' : 'sampleItem'"
						v-for="(item,index) in ['样品','档案','企业','推荐']" @click="scrollLoacl(index)" :key="index">
						{{item}}
					</view>
				</view>
				<scroll-view enable-flex="true" scroll-x="true" class="scrollView">
					<view class="sampleImg" v-for="(item,index) in factortDetail.imgs" :key="index">
						<image class="pic" :src="www + item" mode="aspectFill"></image>
					</view>
				</scroll-view>
			</view>

			<!-- 工厂档案 -->
			<view class="factoryArchives factoryBox" id="archives">
				<view class="title">
					工厂档案
				</view>
				<view class="companyInfo">
					<view class="companyItem" v-for="(item,index) in companyInfos" :key="index">
						<view class="companyTitle">
							{{item.title}}
						</view>
						<view class="companyContent">
							{{item.content}}
						</view>
					</view>
				</view>
				<view class="qualifications">
					<view class="qualTitle">
						外贸资质
					</view>
					<view class="qualContent">
						{{item.is_wai == 1 ? '支持外贸' : '不支持外贸'}}
					</view>
				</view>
			</view>

			<!-- 企业介绍 -->
			<view class="factoryIntroduce factoryBox" id="introduce">
				<view class="title">
					企业介绍
				</view>
				<view class="introduceContent">
					{{factortDetail.des}}
				</view>
			</view>

			<!-- 为你推荐 -->
			<view class="factoryRecommend factoryBox" id="recommend" v-if="factoryList.length > 0">
				<view class="title">
					为你推荐相似工厂
				</view>
				<view class="factoryMain">
					<view class="goods" v-for="(item,index) in factoryList" :key="index"
						@click="jumpFactoryDetail(item.id)">
						<view class="shopGoods">
							<view class="goodsImg">
								<image class="pic" :src="www + item.icon" mode=""></image>
							</view>
							<view class="manufactor">
								<view class="manufactorName singleHide">
									{{item.factory_name}}
								</view>
								<view class="range">
									主营：{{item.main_factory}}
								</view>
								<view class="advantage">
									<text v-if="item.min_goods">{{item.min_goods}}</text>
									<text>{{item.is_open == 1 ? '可出样品' : '不可出样品'}}</text>
								</view>
								<view class="goodsAddr multiHide">
									<text class="singleHide">{{item.address}}</text>
									<text class="singleHide">据您{{Number(item.geo).toFixed(2)}}km</text>
									<image src="../../static/icon_location.png" mode=""></image>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data() {
			return {
				companyInfos: [{
					title: '公司面积',
					content: '未公开'
				}, {
					title: '年交易额',
					content: '未公开'
				}, {
					title: '员工总数',
					content: '未公开'
				}, {
					title: '支持打样',
					content: '未公开'
				}, {
					title: '加工设备',
					content: '未公开'
				}, ],
				callNum: '800-820-8820',
				id: '', // 工厂商品id
				www: http.rootDocument, // 根路径
				factortDetail: {}, // 工厂详情

				factoryList: [], // 推荐工厂列表
				page: 1, // 当前页
				last_page: 1, // 最后一页
				total: 0, // 总条数

				currentCity: '', // 城市
				lng: '',
				lat: '',
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.currentCity = uni.getStorageSync('currentCity')
			this.lng = uni.getStorageSync('longitude');
			this.lat = uni.getStorageSync('latitude');
			console.log(options);
			if (this.id) {
				this.getFactoryDetail();
			}
		},
		methods: {
			// 获取工厂详情
			getFactoryDetail() {
				let that = this;
				let user_id = uni.getStorageSync('user_id') || 0;
				
				http.postJSON('api/index/getFactoryInfo', {
					id: this.id,
					user_id: user_id
				}, function(res) {
					console.log(res, '工厂详情');
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
					that.factortDetail = res.data;
					that.companyInfos[0].content = that.factortDetail.acreage; // 工厂面积
					that.companyInfos[1].content = that.factortDetail.business_money; // 年交易额
					that.companyInfos[2].content = that.factortDetail.user_num; // 员工总数
					that.companyInfos[3].content = that.factortDetail.is_open == 1 ? '支持' : '不支持'; // 支持打样
					that.companyInfos[4].content = that.factortDetail.device_num; // 设备详情
					that.getRecommend();
				})
			},

			// 获取相似推荐
			getRecommend() {
				let that = this;

				uni.showLoading()
				http.postJSON('api/index/queryFactoryList', {
					type: parseInt(this.screenIdx) + 1,
					lng: this.lng,
					lat: this.lat,
					city: this.currentCity,
					cate_one: this.factortDetail.cate_one,
					cate_two: this.factortDetail.cate_two,
					page: this.page
				}, function(res) {
					// console.log(res,'工厂列表');
					uni.hideLoading()

					that.factoryList = that.factoryList.concat(res.data.data);
					that.page = res.data.current_page;
					that.total = res.data.total;
					that.last_page = res.data.last_page;
				})
			},

			// 查看为你推荐
			jumpFactoryDetail(id) {
				uni.navigateTo({
					url: "./factoryDetail?id=" + id
				})
			},

			scrollLoacl(idx) {
				let scrollBox = 'sample'; // 默认点击滚动的位置  默认为工厂样品

				switch (idx) {
					case 0:
						scrollBox = 'sample';
						break;
					case 1:
						scrollBox = 'archives';
						break;
					case 2:
						scrollBox = 'introduce';
						break;
					case 3:
						scrollBox = 'recommend';
						break;
					default:
						scrollBox = 'sample';
						break;
				}

				const query = uni.createSelectorQuery().in(this);
				query.select('#' + scrollBox).boundingClientRect(data => {
					console.log("得到布局位置信息" + JSON.stringify(data));
					console.log("节点离页面顶部的距离为" + data.top);

					// 滚动页面到指定位置
					uni.pageScrollTo({
						duration: 500,
						selector: scrollBox,
						scrollTop: data.top
					})
				}).exec();
			},

			// callTel() {
			// 	uni.makePhoneCall({
			// 		phoneNumber: this.callNum,
			// 		success(res) {
			// 			console.log(res, '拨打电话');
			// 		},
			// 		fail(err) {
			// 			console.log(err);
			// 		}
			// 	})
			// },
			callTel(){
				// 拨打电话
				http.postJSON('api/user/getMobile',{
					id: this.factortDetail.id,
					type: 2
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

			// 收藏工厂
			followFactory() {
				let utoken = uni.getStorageSync('utoken');
				if(!utoken){
					uni.showToast({
						title: '请先登录',
						icon: 'none',
					})
					setTimeout(function(){
						uni.navigateTo({
							url: '../../pages/login/login'
						})
					},1000)
					return
				};
				let is_like = this.factortDetail.is_like == 1 ? 0 : 1;
				this.$set(this.factortDetail, 'is_like', is_like);
				http.postJSON('api/user/likeFactory',{
					id: this.id,
					is_like: is_like
				},function(res){
					console.log(res,'收藏工厂');
					uni.showToast({
						title: is_like == 0 ? '取消收藏' : '点击收藏',
						icon: 'none'
					})
				})
			},

			// 进入店铺
			jumpshophome(store_id) {
				uni.navigateTo({
					url: '../shophome/shophome?store_id=' + store_id
				})
			},


			// 打开地图导航
			mapNavigation() {
				let latitude = this.factortDetail.lat;
				let longitude = this.factortDetail.lng;
				let name = this.factortDetail.address;
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
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				this.getRecommend();
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
			this.factoryList = [];
			this.getFactoryDetail();
			this.getRecommend();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page {
		background-color: #f5f5f5;
	}

	.headerImg {
		padding: 20rpx 0 0 30rpx;

		.swiperView {
			width: 100%;

			swiper-item {
				width: 520rpx;
				height: 300rpx;

				.swiper-item {
					width: 520rpx;
					height: 300rpx;
					image{
						border-radius: 20rpx;
						overflow: hidden;
						display: block;
					}
				}
			}
		}
	}

	.main {
		padding: 20rpx 30rpx;

		.factoryBox {
			width: 690rpx;
			background: #ffffff;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
		}
	}

	.factoryInfo {
		padding: 20rpx;

		.factoryName {
			font-size: 36rpx;
			color: #333;
		}

		.business {
			font-size: 28rpx;
			color: #333;
			margin: 20rpx 0 40rpx;
		}
		
		.factoryAddr{
			align-items: flex-start;
			
			.factoryAddressTxt{
				font-size: 28rpx;
				color: #333;
				max-height: 80rpx;
				max-width: 482rpx;
			}
			
			.factoryOptions{
				display: flex;
				align-items: center;
				
				.factoryIcon{
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

		.factoryInfoBtn {
			display: flex;
			align-items: center;
			margin-top: 44rpx;

			.operationInfo {
				width: 190rpx;
				height: 64rpx;
				background: linear-gradient(71deg, #ff8d4d 0%, #ee2b00 100%);
				border-radius: 10rpx;
				text-align: center;
				line-height: 64rpx;
				font-size: 32rpx;
				color: #fff;
				margin-right: 40rpx;
				position: relative;

				&:last-child {
					margin-right: 0;
				}

				button {
					position: absolute;
					left: 0;
					top: 0;
					height: 64rpx;
					width: 190rpx;
					opacity: 0;
				}
			}
		}
	}

	.factorySample {
		padding-bottom: 20rpx;

		.sampleNav {
			display: flex;
			align-items: center;

			.sampleItem {
				flex: 1;
				font-size: 28rpx;
				color: #333;
				text-align: center;
				padding: 20rpx 0 12rpx;
				position: relative;
			}

			.activeSample {
				&::after {
					content: "";
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 32rpx;
					height: 4rpx;
					background: #ff2d2d;
					border-radius: 2rpx;
				}
			}
		}

		.scrollView {
			display: flex;
			margin-top: 28rpx;
			height: 240rpx;

			.sampleImg {
				width: 240rpx;
				height: 240rpx;
				border-radius: 20rpx;
				overflow: hidden;
				flex-shrink: 0;
				margin-right: 20rpx;

				&:last-child {
					margin-right: 0;
				}
			}
		}
	}

	.factoryArchives {
		padding: 16rpx 20rpx 20rpx;

		.title {
			font-size: 36rpx;
			color: #333;
			margin-bottom: 36rpx;
		}

		.companyInfo {
			display: flex;
			align-items: center;
			flex-wrap: wrap;

			.companyItem {
				width: 33%;
				margin-bottom: 40rpx;

				.companyTitle {
					font-size: 24rpx;
					color: #999;
					margin-bottom: 12rpx;
				}

				.companyContent {
					color: 28px;
					font-size: #333;
				}
			}
		}

		.qualifications {
			display: flex;
			align-items: center;

			view {
				flex: 1;
				font-size: 24rpx;
			}

			.qualTitle {
				color: #999;
			}

			.qualContent {
				color: #333;
			}
		}
	}

	.factoryIntroduce {
		padding: 16rpx 54rpx 20rpx 20rpx;

		.title {
			font-size: 36rpx;
			color: #333;
			margin-bottom: 36rpx;
		}

		.introduceContent {
			font-size: 28rpx;
			color: #333;
			line-height: 50rpx;
		}
	}

	.factoryRecommend {
		.title {
			padding-top: 16rpx;
			padding-left: 20rpx;
			padding-bottom: 36rpx;
			font-size: 36rpx;
			color: #333;
		}
	}

	.goods {
		padding: 0 30rpx 0;
		border-bottom: 4rpx solid #EBEBEB;
	}

	.shopGoods {
		display: flex;
		align-items: center;
		padding: 20rpx 0;

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
			width: 460rpx;

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

				.singleHide {
					max-width: 180rpx;
				}

				image {
					width: 28rpx;
					height: 28rpx;
					vertical-align: middle;
				}
			}
		}
	}
</style>
