<template>
	<view class="">
		<view class="repairMain">
			<!-- 添加图片 -->
			<view class="repairLastItem" style="border-bottom:2rpx solid #EBEBEB;">
				<view class="repairItemName">添加图片</view>
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
			<!-- 申请人 -->
			<view class="repairItem">
				<view class="repairItemName">申请人</view>
				<view class="repairItemContent">
					<input type="text" v-model="name" placeholder="请输入您的真实姓名" />
				</view>
			</view>
			<!-- 联系电话 -->
			<view class="repairItem">
				<view class="repairItemName">联系电话</view>
				<view class="repairItemContent">
					<input type="number" v-model="phone" placeholder="请输入联系电话" />
				</view>
			</view>
			<!-- 代理选择 -->
			<view class="repairItem">
				<view class="repairItemName">代理选择</view>
				<view class="repairSelList">
					<block v-for="(item,index) in ['个人代理','区域代理']" :key="index">
						<view class="selItem" @click="changeSel(index)">
							<image v-if="activeItem == index" src="../../static/icon_yuan2.png"></image>
							<image v-else src="../../static/icon_yuan1.png"></image>
							<text>{{item}}</text>
						</view>
					</block>
				</view>
			</view>
			<!-- 代理区域 -->
			<view class="repairItem" v-show="activeItem == 1">
				<view class="repairItemName">代理区域</view>
				<view class="repairItemContent" @click="showAddrPopup">
					<view class="selPicker">
						<input type="text" disabled="true" :value="address" placeholder="请选择地址" style="margin:0;" />
						<image src="../../static/icon_arrow-downGray.png" mode=""></image>
					</view>
				</view>
			</view>
		</view>

		<!-- 代理协议 -->
		<view class="agreement">
			<label class="radio">
				<radio value="" :checked="read" @click="changeRead" color="#FF2D2D" />
			</label>
			<view class="agreementTips">
				我已认真阅读并同意<text @click="jumpAgreement">《代理协议》</text>
			</view>
		</view>

		<!-- 提交按钮 -->
		<view class="confirmBtn" @click="submitApply" v-if="!reapply">提交申请</view>
		<view class="confirmBtn" @click="submitApply" v-else>修改申请</view>

		<linkAddress 
			:maskVisual="popupAddr" 
			:defaultProvince="defaultProvince" 
			:defaultCity="defaultCity"
			:returnLevel="'city'" 
			@areaSelectedStr="areaSelected" 
			@cascadeDismiss="cascadeDismiss">
		</linkAddress>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	import linkAddress from "@/components/linkAddress/linkAddress.vue"
	export default {
		components: {
			linkAddress
		},
		data() {
			return {
				name: '', // 申请人姓名
				phone: '', // 申请人联系电话
				activeItem: 0, // 申请人的代理级别

				arrAddr: [], // 地址数组
				arrAddrIds: [], // 地址id数组
				address: '', // 地址
				popupAddr: 'hidden', // 弹出地址选择框

				read: false, // 已阅读协议

				imageList: [],
				www: http.rootDocument, // 根路径
				
				reapply: '', // 是否是修改申请
				id: '', // 申请的id
				
				defaultProvince: '', // 默认省
				defaultCity: '', // 默认市
			}
		},
		onLoad(options) {
			console.log(options,'options');
			if(options.reapply){
				this.reapply = options.reapply;
				this.getAgentInfo()
			}
		},
		methods: {
			// 切换代理
			changeSel(idx) {
				this.activeItem = idx;
			},
			// 选择区域
			selectRegion(e) {
				this.regionIdx = e.detail.value
			},

			// 阅读协议
			changeRead() {
				this.read = !this.read
			},
			
			// 查看协议
			jumpAgreement(){
				uni.navigateTo({
					url: '../agreement/agreement?type=3'
				})
			},

			// 弹出 省市区 选择框
			showAddrPopup() {
				this.popupAddr = 'show'
			},

			// 隐藏弹出框
			cascadeDismiss() {
				this.popupAddr = 'hidden'
			},

			// 选择后的结果
			areaSelected(data, addrIds) {
				console.log(data, addrIds);
				this.arrAddr = data;
				this.arrAddrIds = addrIds;
				this.address = data.join('');
			},
			
			
			
			// 查看提交的申请信息
			getAgentInfo(){
				let that = this;
				http.postJSON('api/Agent/getAgentInfo',{},function(res){
					console.log(res,'申请信息');
					if(res.code == 200){
						that.name = res.data.name;
						if(res.data.province != 0 || res.data.city != 0){
							// that.address = res.data.province + ',' + res.data.city;
							that.defaultProvince = res.data.province;
							that.defaultCity = res.data.city;
							that.arrAddr = that.address.split(',');
						}
						that.id = res.data.id;
						that.phone = res.data.mobile;
						that.activeItem = Number(res.data.agent_type) - 1;
						that.imageList = res.data.agent_url.split(',');
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			

			// 提交申请
			submitApply() {
				let that = this;
				// return
				if (!this.read) {
					uni.showToast({
						title: '请先勾选代理协议',
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
				
				let city = '';
				let province = '';
				if(this.activeItem == 1){
					if (!this.address) {
						uni.showToast({
							title: '请选择代理区域',
							icon: 'none',
						})
						return
					}
					province = this.arrAddrIds[0];
					city = this.arrAddrIds[1];
				}
				
				if(this.reapply){
					// 修改申请
					http.postJSON('api/agent/onceApplyAgent',{
						id: this.id,
						agent_type: Number(this.activeItem) + 1,
						name: this.name,
						mobile: this.phone,
						city: city,
						province: province,
						agent_url: this.imageList.join(',')
					},function(res){
						console.log(res,'修改申请');
						if(res.code == 200){
							uni.showToast({
								title: '申请成功，请耐心等待',
								icon: 'none',
								duration: 2000
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
				http.postJSON('api/agent/applyAgent',{
					agent_type: Number(this.activeItem) + 1,
					name: this.name,
					mobile: this.phone,
					city: city,
					province: province,
					agent_url: this.imageList.join(',')
				},function(res){
					console.log(res,'提交申请');
					if(res.code == 200){
						uni.showToast({
							title: '申请成功，请耐心等待',
							icon: 'none',
							duration: 2000
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


			chooseImage: async function() {
				let that = this;
				if (this.status == 0) {
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
								url: http.rootDocument +
								'api/index/uploadImg', //仅为示例，非真实的接口地址
								filePath: item,
								name: 'file',
								formData: {
									'user': 'test',
									token: 'api',
									utoken: uni.getStorageSync('utoken')
								},
								success: (uploadFileRes) => {
									console.log(uploadFileRes.data, 'najscnasjkcnkjs');
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
				if (this.status == 0) {
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
				if (this.status == 0) {
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
		}
	}
</script>

<style lang="less">
	.repairItem {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		/* height: 110rpx; */
		line-height: 110rpx;
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
	}

	.repairItemContent text {
		line-height: 110rpx;
		color: #333;
	}

	.repairItemContent textarea {
		min-height: 120rpx;
		width: 510rpx;
		line-height: 50rpx;
		padding: 40rpx 0;
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


	.repairLastItem {
		padding: 40rpx 30rpx 0;
		border-bottom: 2rpx solid #EBEBEB;
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



	.selPicker {
		width: 100%;
		position: relative;

		image {
			width: 40rpx;
			height: 40rpx;
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
