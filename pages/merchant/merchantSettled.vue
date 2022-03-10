<template>
	<view class="">
		<view class="repairMain">
			<!-- 上传图片 -->
			<view class="repairLastItem">
				<view class="repairItemName">上传图片</view>
				<view class="repairSelImg">
					<view class="selImgItem addImg" @tap="chooseImage" v-if="imageList.length < 9">
						<image class="add" src="../../static/addImg.png"></image>
					</view>

					<block v-for="(image,index) in imageList" :key="index">
						<view class="selImgItem delImg">
							<image class="bgImg" :src="www + image" :data-src="image" @tap="previewImage"
								mode="aspectFill">
							</image>
							<image mode="aspectFit" @click="delImg" :data-idx="index" class="del"
								src="../../static/delImg.png"></image>
						</view>
					</block>
				</view>
				<view class="remarks">
					*备注：上传营业执照或相关证件
				</view>
			</view>
			<!-- 选择类型 -->
			<view class="repairItem">
				<view class="repairItemName">入驻类型</view>
				<view class="repairItemContent">
					<view>商家入驻</view>
				</view>
			</view>
			<!-- 申请人 -->
			<view class="repairItem">
				<view class="repairItemName">申请人</view>
				<view class="repairItemContent">
					<input type="text" :disabled="status == 0" v-model="name" placeholder="请输入您的真实姓名" />
				</view>
			</view>
			<!-- 联系电话 -->
			<view class="repairItem">
				<view class="repairItemName">联系电话</view>
				<view class="repairItemContent">
					<input type="number" :disabled="status == 0" v-model="phone" placeholder="请输入联系电话" />
				</view>
			</view>
			<!-- 优惠券码 -->
			<view class="repairItem">
				<view class="repairItemName">优惠券码</view>
				<view class="repairItemContent">
					<input type="text" :disabled="status == 0" v-model="couponCode" placeholder="请输入优惠券码" />
				</view>
			</view>
			<!-- 入驻类目 -->
			<view class="repairItem">
				<view class="repairItemName">入驻类目</view>
				<view class="repairItemContent">
					<picker class="selPicker" mode="selector" :range="regionArr" :range-key="'title'"
						@change="selectRegion($event)">
						<view>{{regionIdx != null ? regionArr[regionIdx].title : '请选择入驻类目'}}</view>
						<image src="../../static/icon_arrow-downGray.png" mode=""></image>
					</picker>
				</view>
			</view>
			<!-- 定位地址 -->
			<view class="repairItem">
				<view class="repairItemName">定位地址</view>
				<view class="repairItemContent" @click="selAddr">
					<text>{{address || '请选择定位地址'}}</text>
					<image src="../../static/icon_arrow-rightGray.png" mode=""></image>
				</view>
			</view>
			<!-- 入驻年限 -->
			<view class="repairItem" v-if="status == null">
				<view class="repairItemName">入驻年限</view>
				<view class="repairItemContent">
					<picker class="selPicker" mode="selector" :range="categoryArr" :range-key="'name'"
						@change="selectCategory($event)">
						<view>{{categoryIdx != '' ? categoryArr[categoryIdx].name : '请选择入驻年限'}}
							{{categoryIdx != '' ? (categoryArr[categoryIdx].money + '元') : ''}}
						</view>
						<image src="../../static/icon_arrow-downGray.png" mode=""></image>
					</picker>
				</view>
			</view>
			<!-- 拒绝原因 -->
			<view class="repairItem" v-if="status == 2">
				<view class="repairItemName">拒绝原因</view>
				<view class="repairItemContent">
					<text>{{remark}}</text>
				</view>
			</view>
		</view>

		<!-- 规则协议 -->
		<view class="agreement">
			<label class="radio">
				<radio value="" :checked="read" @click="changeRead" color="#FF2D2D" />
			</label>
			<view class="agreementTips">
				我已认真阅读并同意<text @click="jumpAgreement">《入驻协议》</text>
			</view>
		</view>

		<!-- 提交按钮 -->
		<view class="btmBox">
			<view class="confirmBtn" @click="submitApple" v-if="status == null">提交申请</view>
			<view class="confirmBtn" v-if="status == 0">正在审核中</view>
			<view class="confirmBtn" v-if="status == 1">已入驻</view>
			<view class="confirmBtn" @click="submitApple" v-if="status == 2">修改申请</view>
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	// 引入SDK核心类
	var QQMapWX = require("@/utils/qqmap-wx-jssdk.min.js");
	var qqmapsdk; // app.js
	var app = getApp()
	// 实例化API核心类
	qqmapsdk = new QQMapWX({
	  key: app.globalData.qqmapsdkKey
	});
	export default {
		data() {
			return {
				name: '', // 申请人
				phone: '', // 联系电话
				address: '', // 定位地址
				lng: '', // 维度
				lat: '', // 经度
				couponCode: '', // 优惠券码
				type: '', // 进入类型

				categoryArr: [], // 选择类型
				categoryIdx: '', // 选中的类型
				regionArr: [], // 选择入驻类目
				regionIdx: null, // 选中的入驻类目
				status: null, // 申请状态
				id: '', // 修改id
				
				remark: '', // 拒绝原因

				read: false, // 已阅读协议

				imageList: [], // 图片文件
				www: http.rootDocument, // 根路径
			}
		},
		onLoad(options) {
			console.log(options);
			if(options.coupon_no){
				this.couponCode = options.coupon_no;
				this.type = options.settled;
			}
			
			this.getCategoryList()
			this.getOpenState()
		},
		methods: {
			// 获取类目
			getCategoryList() {
				let that = this;
				// 获取入驻类目
				http.postJSON('api/index/getCategoryList', {}, function(res) {
					// console.log(res,'获取类目');
					if (res.code == 200) {
						that.regionArr = res.data
					}
				})

				// 获取入驻年限
				http.postJSON('api/store/openStoreMoney', {}, function(res) {
					// console.log(res,'获取入驻年限');
					if (res.code == 200) {
						that.categoryArr = res.data
					}
				})
			},

			// 查询开通状态
			getOpenState() {
				let that = this;

				http.postJSON('api/store/getStoreAuditInfo', {}, function(res) {
					console.log(res, '商家申请进度');
					if (res.code == 200) {
						let data = res.data;
						if(data.id){
							that.name = data.store_user_name;
							that.status = data.status;
							that.lng = data.lng;
							that.lat = data.lat;
							that.id = data.id;
							that.address = data.address;
							that.phone = data.store_mobile;
							that.read = true;
							that.currentTempData = uni.getStorageSync('currentTempDate')
							if(data.store_imgs){
								that.imageList = data.store_imgs.split(',');
							}
							if(data.status == 2){
								that.remark = data.remark
							}
							that.regionArr.forEach((item, index) => {
								if (item.id == data.store_cate) {
									that.regionIdx = index
									console.log(that.regionIdx,'regionIdx');
								}
							})
							
						}
						
					}
				})
			},

			// 提交申请
			submitApple() {
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
				
				let that = this;
				// return
				if (!this.read) {
					uni.showToast({
						title: '请先勾选入驻协议',
						icon: 'none',
					})
					return
				}

				if (this.imageList.length < 1) {
					uni.showToast({
						title: '请上传营业执照或相关证件',
						icon: 'none',
					})
					return
				}

				if (!this.name) {
					uni.showToast({
						title: '请填写经营人名称',
						icon: 'none',
					})
					return
				}

				let reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
				if (!this.phone) {
					uni.showToast({
						title: '请填写联系电话',
						icon: 'none',
					})
					return
				} else if (!reg_tel.test(this.phone)) {
					uni.showToast({
						title: '请填写正确的手机号',
						icon: 'none'
					})
					return
				}

				if (!this.address) {
					uni.showToast({
						title: '请选择定位地址',
						icon: 'none',
					})
					return
				}

				if (this.regionIdx == null) {
					uni.showToast({
						title: '请选择入驻类目',
						icon: 'none',
					})
					return
				}

				if (!this.status) {
					if (!this.categoryIdx) {
						uni.showToast({
							title: '请选择入驻年限',
							icon: 'none',
						})
						return
					}

					http.postJSON('api/store/addStoreAudit', {
						username: this.name,
						store_mobile: this.phone,
						lat: this.lat,
						lng: this.lng,
						address: this.address,
						category: this.regionArr[this.regionIdx].id,
						days: this.categoryArr[this.categoryIdx].days,
						store_imgs: this.imageList.join(','),
						province: this.currentTempData.province,
						city: this.currentTempData.city,
						district: this.currentTempData.district,
						adcode: this.currentTempData.adcode
					}, function(res) {
						console.log(res, '提交申请');
						uni.showLoading({}) //拉起支付加载提示
						if (res.code == 200) {
							uni.getProvider({ //获取支付类型
								service: 'payment',
								success(reson) {
									uni.hideLoading()
									uni.requestPayment({ //下面参数为必传
										provider: reson.provider[0], //支付类型
										timeStamp: res.data.timestamp,
										nonceStr: res.data.nonceStr,
										package: res.data.package,
										signType: res.data.signType,
										paySign: res.data.paySign,
										success(res) {
											uni.showToast({
												title: '支付成功',
												icon: 'none',
												duration: 2000
											})
											if(that.type){
												setTimeout(() => { //支付成功跳转
													uni.navigateTo({
														url: '../index/index'
													})
												}, 1200)
												return
											}
											setTimeout(() => { //支付成功跳转
												uni.navigateBack()
											}, 1200)
										},
										fail(err) {
											uni.showToast({
												title: '支付失败',
												icon: 'none',
												duration: 2000
											})
										}
									})
								}
							})
						} else {
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					})
					return
				}
				
				
				http.postJSON('api/store/editStoreAudit', {
					id: this.id,
					username: this.name,
					store_mobile: this.phone,
					lat: this.lat,
					lng: this.lng,
					address: this.address,
					category: this.regionArr[this.regionIdx].id,
					store_imgs: this.imageList.join(','),
					province: this.currentTempData.province,
					city: this.currentTempData.city,
					district: this.currentTempData.district,
					adcode: this.currentTempData.adcode
				}, function(res) {
					console.log(res, '提交申请');
					if (res.code == 200) {
						uni.showToast({
							title: res.msg,
							icon: 'none',
							duration: 2000
						})
						if(that.type){
							setTimeout(() => { //支付成功跳转
								uni.navigateTo({
									url: '../index/index'
								})
							}, 1200)
							return
						}
						setTimeout(function(){
							uni.navigateBack()
						},2000)
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})


			},


			// 选择入驻类目
			selectRegion(e) {
				if(this.status == 0){
					uni.showToast({
						title: '审核中不能修改',
						icon: 'none'
					})
					return
				}
				this.regionIdx = e.detail.value
			},

			// 选择类型
			selectCategory(e) {
				this.categoryIdx = e.detail.value
			},

			// 阅读协议
			changeRead() {
				this.read = !this.read
			},
			
			// 查看协议
			jumpAgreement(){
				uni.navigateTo({
					url: '../agreement/agreement?type=4'
				})
			},

			chooseImage: async function() {
				let that = this;
				if(this.status == 0){
					uni.showToast({
						title: '审核中不能修改',
						icon: 'none'
					})
					return
				}

				if (this.imageList.length === 9) {
					let isContinue = await this.isFullImg();
					console.log("是否继续?", isContinue);
					if (!isContinue) {
						return;
					}
				}
				uni.chooseImage({
					sourceType: ['album', 'camera'], // 相册还是拍照
					sizeType: ['compressed'], // 原图还是压缩  压缩
					count: this.imageList.length + 9 > 9 ? 9 - this.imageList.length : 9,
					success: (res) => {
						// this.imageList = this.imageList.concat(res.tempFilePaths);
						console.log(res, 'resresres');

						const tempFilePaths = res.tempFilePaths;

						tempFilePaths.forEach(item => {
							uni.uploadFile({
								url: http.rootDocument + 'api/index/uploadImg', //仅为示例，非真实的接口地址
								filePath: item,
								name: 'file',
								formData: {
									'user': 'test',
									token: 'api',
									utoken: uni.getStorageSync('utoken')
								},
								success: (uploadFileRes) => {
									console.log(uploadFileRes.data,'najscnasjkcnkjs');
									let data = JSON.parse(uploadFileRes.data);
									that.imageList = that.imageList.concat(data.data)
									console.log(that.imageList, 'that.imageList');
								},
								fail: (err) => {
									console.log(err, 'errerrerr')
								}
							});
						})


					},
					fail: (err) => {
						// #ifdef MP
						uni.getSetting({
							success: (res) => {
								let authStatus = false;
								authStatus = res.authSetting['scope.album'] && res
									.authSetting[
										'scope.camera'];
								if (!authStatus) {
									uni.showModal({
										title: '授权失败',
										content: '需要从您的相机或相册获取图片，请在设置界面打开相关权限',
										success: (res) => {
											if (res.confirm) {
												uni.openSetting()
											}
										}
									})
								}
							}
						})
						// #endif
					}
				})
			},
			// 清空图片
			isFullImg: function() {
				if(this.status == 0){
					uni.showToast({
						title: '审核中不能修改',
						icon: 'none'
					})
					return
				}
				return new Promise((res) => {
					uni.showModal({
						content: "已经有9张图片了,是否清空现有图片？",
						success: (e) => {
							if (e.confirm) {
								this.imageList = [];
								res(true);
							} else {
								res(false)
							}
						},
						fail: () => {
							res(false)
						}
					})
				})
			},
			// 查看大图
			previewImage: function(e) {
				var current = e.target.dataset.src
				let images = this.imageList.map(item => {
					return this.www + item
				})
				uni.previewImage({
					current: this.www + current,
					urls: images
				})
			},
			// 删除图片
			delImg(e) {
				if(this.status == 0){
					uni.showToast({
						title: '审核中不能修改',
						icon: 'none'
					})
					return
				}
				var idx = e.target.dataset.idx;
				this.imageList.splice(idx, 1);
				this.imageList = this.imageList
			},

			// 选择地址
			selAddr() {
				if(this.status == 0){
					uni.showToast({
						title: '审核中不能修改',
						icon: 'none'
					})
					return
				}
				this.goMap()
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
									success: function(res) {
										console.log(res,'当前位置,根据经纬度');
										let tempData = res.result.ad_info;
										that.currentTempData = tempData

										// 存储到本地
										uni.setStorageSync('currentTempDate', tempData)
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
		}
	}
</script>

<style lang="less">
	.repairItem {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 0 30rpx;
		/* height: 110rpx; */
		line-height: 110rpx;
	}

	.repairContent {
		border-bottom: 2rpx solid #EBEBEB;

		.repairItemContent {
			border: none;
		}
	}

	.repairItemName {
		color: #333;
		font-size: 32rpx;
	}

	.repairItemContent {
		border-bottom: 2rpx solid #EBEBEB;
		width: 510rpx;
		display: flex;
		align-items: center;
	}

	.repairItemContent input {
		height: 110rpx;
		width: 510rpx;
		position: relative;
		z-index: 0;
	}

	.repairItemContent text {
		display: inline-block;
		line-height: 50rpx;
		padding: 20rpx 0;
		color: #333;
		width: 510rpx;
	}

	.repairItemContent textarea {
		min-height: 120rpx;
		width: 510rpx;
		line-height: 50rpx;
		padding: 40rpx 0;
		position: relative;
		z-index: 0;
	}

	.repairItemContent image {
		width: 32rpx;
		height: 32rpx;
	}




	.repairSelImg {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 40rpx;
	}

	.remarks {
		font-size: 32rpx;
		color: #FF2D2D;
		margin-bottom: 60rpx;
	}

	.selImgItem {
		width: 210rpx;
		height: 160rpx;
		background-color: #EBEBEB;
		position: relative;
		margin-right: 30rpx;
		margin-bottom: 40rpx;
		border-radius: 15rpx;
		overflow: hidden;
	}

	.selImgItem:nth-child(3n) {
		margin-right: 0;
	}

	.selImgItem .add {
		width: 46rpx;
		height: 46rpx;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translateX(-50%) translateY(-50%);
	}

	.selImgItem .bgImg {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: 1;
	}

	.selImgItem .del {
		width: 40rpx;
		height: 40rpx;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 9;
	}



	.repairSelList {
		border-bottom: 2rpx solid #EBEBEB;
		width: 510rpx;
		display: flex;
		align-items: center;
	}

	.selItem {
		margin-right: 40rpx;
	}

	.selItem image {
		width: 32rpx;
		height: 32rpx;
		margin-right: 10rpx;
		vertical-align: middle;
	}

	.selItem text {
		color: #333;
		font-size: 32rpx;
	}

	.repairMain {
		padding-bottom: 280rpx;
	}

	.repairLastItem {
		padding: 40rpx 30rpx 0;
		border-bottom: 2rpx solid #EBEBEB;
	}




	.btmBox {
		position: fixed;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		width: 100%;
		height: 140rpx;
		background-color: #fff;
	}

	.confirmBtn {
		width: 650rpx;
		height: 88rpx;
		opacity: 1;
		background: #FF2D2D;
		border-radius: 54rpx;
		font-size: 36rpx;
		color: #fff;
		text-align: center;
		line-height: 88rpx;
		margin: 0 auto;
	}



	.selPicker {
		width: 100%;
		position: relative;

		image {
			width: 32rpx;
			height: 32rpx;
			position: absolute;
			right: 0;
			top: 50%;
			transform: translateY(-50%);
		}
	}


	.agreement {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: 130rpx;
		height: 120rpx;
		background-color: #fff;
		color: #999;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;

		label {
			transform: scale(0.8);
			vertical-align: middle;
		}

		.agreementTips {
			margin-left: 12rpx;

			text {
				color: #FF2D2D;
			}
		}
	}
</style>
