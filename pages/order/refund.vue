<template>
	<view class="">
		<view class="formBox">
			<view class="refundBox">
				<view class="refundType flexBox">
					<view class="title">
						申请类型
					</view>
					<view class="content">
						<!-- 我要退货退款 -->
						<picker class="selPicker" mode="selector" :range="typeArr" @change="selectType($event)">
							<view>{{typeArr[typeIdx] || '点击选择申请类型'}}</view>
						</picker>
						<image src="../../static/icon_arrow-downGray.png" mode=""></image>
					</view>
				</view>
				<view class="refundType flexBox">
					<view class="title">
						申请原因
					</view>
					<view class="content">
						<picker class="selPicker" mode="selector" :range="reasonArr" @change="selectReason($event)">
							<view>{{reasonIdx != '' ? reasonArr[reasonIdx] : '点击选择申请原因'}}</view>
						</picker>
						<image src="../../static/icon_arrow-downGray.png" mode=""></image>
					</view>
				</view>
			</view>
			
			<view class="refundBox">
				<view class="refundPrice">
					<view class="title">
						申请金额
					</view>
					<view class="content">
						￥{{pay_money}}
					</view>
				</view>
			</view>
			
			<view class="refundBox">
				<view class="refundReason">
					<view class="title">
						申请说明
					</view>
					<view class="content">
						<textarea v-model="explain" placeholder="请您详细填写申请说明" />
					</view>
					<view class="refundImgs">
						<view class="applyImg uploadImg" @tap="chooseImage" v-if="imageList.length < 9">
							<image class="upload" src="../../static/upload.png"></image>
						</view>
						
						<block v-for="(image,index) in imageList" :key="index">
							<view class="applyImg">
								<image class="bgImg" :src="www + image" :data-src="image" @tap="previewImage"
									mode="aspectFill">
								</image>
								<image mode="aspectFit" @click="delImg" :data-idx="index" class="delImg"
									src="../../static/delImg.png"></image>
							</view>
						</block>
					</view>
				</view>
			</view>
			
			<view class="refundBox">
				<view class="refundType flexBox">
					<view class="title">
						联系电话
					</view>
					<view class="content">
						<input type="number" placeholder="请输入手机号" v-model="user_mobile" />
					</view>
				</view>
			</view>
		</view>
	
		<view class="refundBtn" @click="submitRefund">
			提交申请
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	export default {
		data(){
			return {
				reasonArr: ['多拍了、错拍、不想要','协商一致退款','缺货','发货慢','其他'],
				typeArr: ['我要退款', '我要退货退款'],
				typeIdx: 0,
				reasonIdx: '',
				explain: '', // 退款说明
				
				user_mobile: '', // 用户手机号
				pay_money: '', // 退款金额
				order_no: '', // 订单号
				
				imageList: [], // 图片文件
				www: http.rootDocument, // 根路径
			}
		},
		onLoad(options) {
			console.log(options);
			this.order_no = options.order_no;
			this.pay_money = options.pay_money;
			this.user_mobile = options.user_mobile;
		},
		methods:{
			// 选择退款原因
			selectReason(e){
				this.reasonIdx = e.detail.value
			},
			
			// 选择退款类型
			selectType(e){
				this.typeIdx = e.detail.value
			},
			
			
			// 提交申请
			submitRefund(){
				let reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
				if (!this.user_mobile) {
					uni.showToast({
						title: '请填写联系电话',
						icon: 'none',
					})
					return
				} else if (!reg_tel.test(this.user_mobile)) {
					uni.showToast({
						title: '请填写正确的手机号',
						icon: 'none'
					})
					return
				}
				
				let refund_remark = '';
				if(this.reasonIdx){
					refund_remark = '申请原因：' + this.reasonArr[this.reasonIdx] + ';申请说明：' + this.explain
				}else{
					refund_remark = '申请说明：' + this.explain
				}
				
				http.postJSON('api/order/refundOrder',{
					order_no: this.order_no,
					refund_type: parseInt(this.typeIdx) + 1,
					refund_money: this.pay_money,
					refund_remark: refund_remark,
					refund_imgs: this.imageList.join(','),
					refund_mobile: this.user_mobile
				},function(res){
					console.log(res,'提交退款申请');
					if(res.code == 200){
						uni.showToast({
							title: '申请成功，请耐心等待',
							icon: 'none',
							duration:2000
						})
						setTimeout(function(){
							uni.navigateBack()
						},2000)
						return
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
				var idx = e.target.dataset.idx;
				this.imageList.splice(idx, 1);
				this.imageList = this.imageList
			},
		}
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.formBox{
		padding-bottom: 160rpx;
	}
	
	.refundBox{
		background-color: #fff;
		width: 100%;
		margin-bottom: 20rpx;
		.refundType{
			width: 750rpx;
			height: 68rpx;
			line-height: 68rpx;
			background: #ffffff;
			padding-left: 30rpx;
			font-size: 28rpx;
			.title{
				color: #666;
				margin-right: 40rpx;
			}
			.content{
				color: #333;
				width: calc(100% - 160rpx);
				position: relative;
				image{
					width: 24rpx;
					height: 24rpx;
					position: absolute;
					top: 22rpx;
					right: 30rpx;
				}
			}
		}
		.flexBox{
			display: flex;
			align-items: center;
		}
		.refundPrice{
			padding: 20rpx 30rpx;
			.content{
				font-size: 42rpx;
				margin-top: 20rpx;
			}
		}
		.refundReason{
			padding: 20rpx 30rpx;
			.content{
				textarea{
					min-height: 160rpx;
					margin-top: 20rpx;
				}
			}
			.refundImgs{
				margin-top: 20rpx;
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				.uploadImg{
					border: 2rpx dashed #999999;
				}
				.applyImg{
					margin-right: 30rpx;
					width: 210rpx;
					height: 160rpx;
					border-radius: 10rpx;
					overflow: hidden;
					position: relative;
					flex-shrink: 0;
					margin-bottom: 30rpx;
					&:nth-child(3n){
						margin-right: 0;
					}
					.upload{
						position: absolute;
						left: 50%;
						top: 50%;
						transform: translateX(-50%) translateY(-50%);
						width: 60rpx;
						height: 60rpx;
					}
					.bgImg{
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						height: 100%;
					}
					.delImg{
						position: absolute;
						right: 0;
						top: 0;
						width: 40rpx;
						height: 40rpx;
						z-index: 1;
					}
				}
			}
		}
	}
	
	.refundBtn{
		width: 650rpx;
		height: 88rpx;
		background: #ff2d2d;
		border-radius: 54rpx;
		line-height: 88rpx;
		text-align: center;
		position: fixed;
		bottom: 40rpx;
		left: 50%;
		transform: translateX(-50%);
		color: #fff;
		font-size: 36rpx;
	}
</style>
