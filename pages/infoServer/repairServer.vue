<template>
	<view class="">
		<view class="repairMain">
			<!-- 上传图片 -->
			<view class="repairLastItem" style="border-bottom:2rpx solid #EBEBEB;">
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
			</view>
			<!-- 选择类型 -->
			<view class="repairItem">
				<view class="repairItemName">选择类型</view>
				<view class="repairItemContent">
					<picker class="selPicker" mode="selector" :range="regionArr" range-key="title" @change="selectRegion($event)">
						<view>{{regionIdx != '' ? regionArr[regionIdx].title : '请选择分类'}}</view>
						<image src="../../static/icon_arrow-downGray.png" mode=""></image>
					</picker>
				</view>
			</view>
			<!-- 联系电话 -->
			<view class="repairItem">
				<view class="repairItemName">联系电话</view>
				<view class="repairItemContent">
					<input type="number" v-model="phone" placeholder="请输入联系电话" />
				</view>
			</view>
			<!-- 定位地址 -->
			<view class="repairItem">
				<view class="repairItemName">定位地址</view>
				<view class="repairItemContent" @click="selAddr">
					<!-- <input type="number" v-model="address" placeholder="请输入定位地址" /> -->
					<text>{{address || '请选择定位地址'}}</text>
				</view>
			</view>
			<!-- 发布内容 -->
			<view class="repairItem repairContent">
				<view class="repairItemName">发布内容</view>
				<view class="repairItemContent">
					<textarea auto-height maxlength="-1" v-model="repairContent" placeholder="请输入发布内容" />
					</view>
			</view>
		</view>

		<!-- 规则协议 -->
		<view class="agreement">
			<label class="radio">
				<radio value="" :checked="read" @click="changeRead" color="#FF2D2D" />
			</label>
			<view class="agreementTips">
				我已认真阅读并同意<text @click="jumpAgreement">《规则协议》</text>
			</view>
		</view>

		<!-- 提交按钮 -->
		<view class="confirmBox">
			<view class="confirmBtn" @click="submitRepair">提交申请</view>
		</view>
	</view>
</template>

<script>
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
		data() {
			return {
				phone: '', // 联系电话
				address: '', // 定位地址
				repairContent: '', // 发布内容
				
				regionArr: [], // 选择类型
				regionIdx: '', // 选中的类型
				
				read: false, // 已阅读协议
				www: http.rootDocument,
				city: '',
				province: '',
				lng: '',
				lat: '',
				
				imageList: [],
				id: '',
			}
		},
		onLoad(options) {
			this.getNavigateType();
			
			this.id = options.id;
			if(this.id){
				this.getRepairInfo()
			}
		},
		methods: {
			// 获取类目
			getNavigateType(){
				let that = this;
				http.postJSON('api/message/queryCategoryList',{
					type: 1
				},function(res){
					console.log(res,'获取类目');
					that.regionArr = res.data;
				})
			},
			
			// 获取发布的内容
			getRepairInfo(){
				let that = this;
				http.postJSON('api/message/getServerInfo',{
					id: this.id
				},function(res){
					console.log(res,'内容详情');
					that.lng = res.data.lng;
					that.lat = res.data.lat;
					that.address = res.data.address;
					that.imageList = res.data.message_img.split(',');
					that.phone = res.data.mobile;
					that.repairContent = res.data.content;
					that.city = res.data.city;
					that.province = res.data.province;
					that.read = true;
					that.regionArr.forEach((item,index) => {
						if(item.id == res.data.cate_id){
							that.regionIdx = index
						}
					})
				})
			},
			
			// 选择类型
			selectRegion(e){
				this.regionIdx = e.detail.value
			},
			
			// 阅读协议
			changeRead(){
				this.read = !this.read
			},
			
			// 查看协议
			jumpAgreement(){
				uni.navigateTo({
					url: '../agreement/agreement?type=1'
				})
			},
			
			// 选择地址
			selAddr(){
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
										let tempData = res.result.address_component;
										that.city = tempData.city;
										that.province = tempData.province;
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
			
			chooseImage: async function() {
				let that = this;
				if (this.imageList.length === 9) {
					let isContinue = await this.isFullImg();
					console.log("是否继续?", isContinue);
					if (!isContinue) {
						return;
					}
				}
				uni.chooseImage({
					sourceType: ['album','camera'], // 相册还是拍照
					sizeType: ['compressed'], // 原图还是压缩  压缩
					count: this.imageList.length + 9 > 9 ? 9 - this.imageList.length : 9,
					success: (res) => {
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
									console.log(uploadFileRes.data,'na	jscnasjkcnkjs');
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
								authStatus = res.authSetting['scope.album'] && res.authSetting['scope.camera'];
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
			delImg(e){
				var idx = e.target.dataset.idx;
				this.imageList.splice(idx,1);
				this.imageList = this.imageList
			},
		
		
			// 提交申请
			submitRepair(){
				if (!this.read) {
					uni.showToast({
						title: '请先阅读并同意规则协议',
						icon: 'none',
					})
					return
				}
				
				if (this.imageList.length < 1) {
					uni.showToast({
						title: '请上传图片',
						icon: 'none',
					})
					return
				}
				
				if (!this.regionIdx) {
					uni.showToast({
						title: '请选择发布类目',
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
				
				if (!this.repairContent) {
					uni.showToast({
						title: '请填写要发布的内容',
						icon: 'none',
					})
					return
				}
			
				
				if(this.id){
					console.log('修改申请');
					http.postJSON('api/message/editMessageInfo',{
						id: this.id,
						message_img: this.imageList.join(','),
						cate_id: this.regionArr[this.regionIdx].id,
						mobile: this.phone,
						lat: this.lat,
						lng: this.lng,
						address: this.address,
						city: this.city,
						province: this.province,
						content: this.repairContent
					},function(res){
						console.log(res,'提交申请');
						if(res.code == 200){
							uni.showToast({
								title: '修改成功',
								icon: 'none',
								duration:2000
							})
							setTimeout(function(){
								uni.navigateBack()
							},2000)
						}else{
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					})
					return
				}
				
				console.log('提交申请');
				http.postJSON('api/message/addMessageInfo',{
					type: 1,
					message_img: this.imageList.join(','),
					cate_id: this.regionArr[this.regionIdx].id,
					mobile: this.phone,
					lat: this.lat,
					lng: this.lng,
					address: this.address,
					city: this.city,
					province: this.province,
					content: this.repairContent
				},function(res){
					console.log(res,'提交申请');
					if(res.code == 200){
						uni.showToast({
							title: '发布成功',
							icon: 'none',
							duration:2000
						})
						setTimeout(function(){
							uni.navigateBack()
						},2000)
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
				
			},
			
		}
	}
</script>

<style lang="less">
	.repairMain{
		margin-bottom: 260rpx;
	}
	.repairItem {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 0 30rpx;
		/* height: 110rpx; */
		line-height: 110rpx;
	}

	.repairContent{
		border-bottom: 2rpx solid #EBEBEB;
		.repairItemContent{
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




	.repairSelImg {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 40rpx;
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
	.selImgItem:nth-child(3n){
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


	.repairLastItem {
		padding: 40rpx 30rpx 0;
		border-bottom: 2rpx solid #EBEBEB;
	}






	.confirmBox{
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		padding-bottom: 40rpx;
		background-color: #fff;
	}
	
	.confirmBtn {
		// position: fixed;
		// left: 50%;
		// transform: translateX(-50%);
		// bottom: 40rpx;
		margin: 0 auto;
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
	
	
	
	.selPicker{
		width: 100%;
		position: relative;
		image{
			width: 40rpx;
			height: 40rpx;
			position: absolute;
			right: 0;
			top: 50%;
			transform: translateY(-50%);
		}
	}
	
	
	.agreement{
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
		label{
			transform: scale(0.8);
			vertical-align: middle;
		}
		.agreementTips{
			margin-left: 12rpx;
			text{
				color: #FF2D2D;
			}
		}
	}
</style>
