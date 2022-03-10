<template>
	<view class="">
		<view class="refundBox">
			<view class="refundType flexBox">
				<view class="title">
					视频标题
				</view>
				<view class="content">
					<input type="text" placeholder="请输入视频标题" v-model="vedioTitle" />
				</view>
			</view>
			<view class="refundType flexBox">
				<view class="title">
					正文描述
				</view>
				<view class="content">
					<input type="text" placeholder="请输入正文描述" v-model="vedioContent" />
				</view>
			</view>
			<view class="refundType flexBox" v-if="false">
				<view class="title">
					当前位置
				</view>
				<view class="content" @click="selAddr">
					{{address || '请选择位置'}}
				</view>
			</view>
		</view>

		<view class="refundBox">
			<!-- 上传视频 -->
			<view class="repairLastItem" style="border-bottom:2rpx solid #EBEBEB;">
				<view class="repairItemName">上传视频</view>
				<view class="repairSelImg">
					<view v-if="!src" class="selImgItem addImg" @tap="chooseVideo">
						<image class="add" src="../../../static/upload.png"></image>
					</view>
					<view v-else class="selImgItem delImg">
						<video :src="src" class="bgImg video"></video>
						<image @click="del" mode="aspectFit" class="del" src="../../../static/delImg.png"></image>
					</view>
				</view>
				<view class="progress" v-if="progress > 0">
					<progress :percent="progress" show-info border-radius="20" />
				</view>
			</view>
		</view>

		<!-- 选择商品 -->
		<view class="refundBox">
			<view class="refundType flexBox" style="justify-content: space-between;padding-right: 30rpx;"
				@click="jumpSelectVideo(selGoods.id)">
				<view class="title">
					选择商品
				</view>
				<image class="arrowRight" src="../../../static/icon_arrow-rightGray.png" mode=""></image>
			</view>
		</view>

		<!-- 已选择商品 -->
		<view class="refundBox" v-if="selGoods.id">
			<view class="refundType alreadySel flexBox">
				<view class="title">
					<image :src="www + selGoods.goods_icon" mode=""></image>
				</view>
				<view class="content baseflex" @click="jumpSelectVideo(selGoods.id)">
					<text class="singleHide">{{selGoods.goods_name}}</text>
					<image class="arrowRight" src="../../../static/icon_arrow-rightGray.png" mode=""></image>
				</view>
			</view>
		</view>

		<!-- 提交按钮 -->
		<view class="confirmBtn" @click="jumpRepair">提交审核</view>
	</view>
</template>

<script>
	import VODUpload from '@/utils/aliyun-upload-sdk-1.0.1.min.js'
	import http from "@/utils/http.js"
	export default {
		data() {
			return {
				vedioTitle: '', // 视频标题
				vedioContent: '', // 视频正文
				address: '', // 地址

				src: '', // 视频地址
				sourceTypeIndex: 2,
				www: http.rootDocument,
				selGoods: {
					id: null
				}, // 选中的商品
				progress: 0, // 进度
				maxTime: 120, // 视频最长时长
				minTime: 0, // 视频最小时长

				uploader: '',

				uploadAuth: '', // 上传视频凭证
				uploadAddress: '', // 上传视频地址
				videoId: '', // 上传视频id
			}
		},
		onUnload() {
			this.src = '',
			this.sourceTypeIndex = 2,
			this.sourceType = ['拍摄', '相册', '拍摄或相册'];
		},
		onShow() {
			uni.$on("selGoods", res => {
				console.log(res, '返回的数据');
				this.selGoods = res.data
				// 清除监听
				uni.$off('selGoods');
			})
		},
		onReady: function() {
			this.getVideoLimit();
			var that = this;

			var uploader = new VODUpload({
				timeout: 60000,
				region: "cn-shanghai",
				// 添加文件成功
				addFileSuccess: function(uploadInfo) {
					console.log("addFileSuccess" + JSON.stringify(uploadInfo))
				},
				// 开始上传
				onUploadstarted: function(uploadInfo) {
					console.log('文件开始上传...');
					console.log("onUploadStarted:" + JSON.stringify(uploadInfo))
					console.log(uploadInfo, 'uploadInfo', that.vedioTitle);

					http.postJSON('api/video/createVideoUrl', {
						title: that.vedioTitle,
						url: uploadInfo.url
					}, function(res) {
						if (res.code === 200) {
							var akInfo = res.data;
							that.videoId = akInfo.VideoId;
							uploader.setUploadAuthAndAddress(uploadInfo, akInfo.UploadAuth, akInfo
								.UploadAddress, akInfo.VideoId);
						} else {
							console.log(res)
							uploader.stopUpload();
						}
					})

				},
				// 文件上传成功
				onUploadSucceed: function(uploadInfo) {
					console.log(JSON.stringify(uploadInfo))
					console.log('文件上传成功!')
				},
				// 文件上传失败
				onUploadFailed: function(uploadInfo, code, message) {
					console.log("onUploadFailed: file:" + uploadInfo + ",code:" + code +
						", message:" + message)
					console.log('文件上传失败!')
					uploader.stopUpload();
				},
				// 取消文件上传
				onUploadCanceled: function(uploadInfo, code, message) {
					console.log(JSON.stringify(uploadInfo) + code + message)
					console.log('文件已暂停上传!')
					uploader.stopUpload();

				},
				// 文件上传进度，单位：字节, 可以在这个函数中拿到上传进度并显示在页面上
				onUploadProgress: function(uploadInfo, totalSize, progress) {
					that.progress = progress;


					console.log(JSON.stringify(uploadInfo) + "|" + totalSize + "|" + progress)
					// console.log("onUploadProgress:file:" + uploadInfo.file.name + ", fileSize:" + totalSize + ", percent:" + Math.ceil(progress * 100) + "%")
					var progressPercent = Math.ceil(progress * 100)
					console.log('文件上传中...' + progressPercent);
				},
				// 上传凭证超时
				onUploadTokenExpired: function(uploadInfo) {
					console.log('上传超时');
					// // 如果是上传方式二即根据 STSToken 实现时，从新获取STS临时账号用于恢复上传
					// // 上传文件过大时可能在上传过程中 sts token 就会失效, 所以需要在 token 过期的回调中调用 resumeUploadWithSTSToken 方法
					// // 这里是测试接口, 所以我直接获取了 STSToken
					// $('#status').text('文件上传超时!')
					//
					// var stsUrl = 'http://demo-vod.cn-shanghai.aliyuncs.com/voddemo/CreateSecurityToken?BusinessType=vodai&TerminalType=pc&DeviceModel=iPhone9,2&UUID=67999yyuuuy&AppVersion=1.0.0'
					// $.get(stsUrl, function (data) {
					//     var info = data.SecurityTokenInfo
					//     var accessKeyId = info.AccessKeyId
					//     var accessKeySecret = info.AccessKeySecret
					//     var secretToken = info.SecurityToken
					//     var expiration = info.Expiration
					//     uploader.resumeUploadWithSTSToken(accessKeyId, accessKeySecret, secretToken, expiration)
					// }, 'json')
				},
				// 全部文件上传结束
				onUploadEnd: function(uploadInfo) {
					wx.showToast({
						title: '上传成功',
						icon: 'success',
						duration: 2000
					})
					console.log("文件上传完毕 onUploadEnd: uploaded all the files")
				}
			});
			this.uploader = uploader


		},
		methods: {
			// 选择地址
			selAddr() {
				this.goMap()
			},
			
			// 获取视频限制
			getVideoLimit(){
				let that = this;
				http.postJSON('api/Video/getVideoTime',{},function(res){
					if(res.code == 200){
						that.maxTime = res.data.video_max_time;
						that.minTime = res.data.video_min_time;
					}
				})
			},

			jumpRepair() {
				if (!this.vedioTitle) {
					uni.showToast({
						title: '请先填写标题',
						icon: 'none'
					})
					return
				}
				
				if (!this.vedioContent) {
					uni.showToast({
						title: '请先填写正文',
						icon: 'none'
					})
					return
				}
				
				if (!this.src) {
					uni.showToast({
						title: '请先上传视频',
						icon: 'none'
					})
					return
				}
				
				if (!this.selGoods.id) {
					uni.showToast({
						title: '请先选择商品',
						icon: 'none'
					})
					return
				}
				
				console.log('上传成功');
				http.postJSON('api/Video/addVideo',{
					goods_id: this.selGoods.id,
					title: this.vedioTitle,
					description: this.vedioContent,
					video_id: this.videoId
				},function(res){
					if(res.code == 200){
						uni.showToast({
							title: '上传成功，等待审核中',
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

			chooseVideo: function() {
				if (!this.vedioTitle) {
					uni.showToast({
						title: '请先填写标题',
						icon: 'none'
					})
					return
				}
				
				uni.chooseVideo({
					count: 1,
					sourceType: ['camera', 'album'],
					success: (res) => {
						console.log(res, 'res');
						if(res.duration < this.minTime){
							uni.showToast({
								title: '视频时长不得小于' + this.minTime +'s',
								icon: 'none'
							})
							return
						}else if(res.duration > this.maxTime){
							uni.showToast({
								title: '视频时长不得大于' + this.maxTime + 's',
								icon: 'none'
							})
							return
						}
						
						
						this.src = res.tempFilePath;
						var file = {
							url: res.tempFilePath,
							coverUrl: res.thumbTempFilePath
						};
						
						var userData = '{"Vod":{}}';
						//获取到用户选择的文件后，添加到上传列表中。
						this.uploader.addFile(file, null, null, null, userData);
						this.uploader.startUpload()

					},
					fail: (err) => {
						// #ifdef MP
						uni.getSetting({
							success: (res) => {
								let authStatus = false;
								authStatus = res.authSetting['scope.album'] && res.authSetting[
									'scope.camera'];
								if (!authStatus) {
									uni.showModal({
										title: '授权失败',
										content: '需要从您的相机或相册获取视频，请在设置界面打开相关权限',
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

			del() {
				this.src = '';
				this.videoId = '';
				this.progress = 0;
			},

			goMap() {
				let that = this;
				uni.authorize({
					scope: 'scope.userLocation',
					success(res) {
						uni.chooseLocation({
							success: function(res) {
								console.log('位置名称：' + res.name);
								console.log('详细地址：' + res.address);
								console.log('纬度：' + res.latitude);
								console.log('经度：' + res.longitude);
								that.address = res.address
							}
						});
					},
					fail(err) {

					}
				})
			},

			// 选择商品
			jumpSelectVideo(id) {
				uni.navigateTo({
					url: "./selectVideoGoods?id=" + id
				})
			},
		},
	}
</script>

<style lang="less">
	page {
		background-color: #F5F5F5;
	}

	.refundBox {
		background-color: #fff;
		width: 100%;
		margin-bottom: 20rpx;

		.refundType {
			width: 750rpx;
			height: 68rpx;
			line-height: 68rpx;
			background: #ffffff;
			padding-left: 30rpx;
			font-size: 28rpx;

			.title {
				color: #666;
				margin-right: 40rpx;

				image {
					width: 80rpx;
					height: 80rpx;
					border-radius: 8rpx;
				}
			}

			.content {
				color: #333;
			}

			.arrowRight {
				width: 28rpx;
				height: 28rpx;
			}
		}

		.alreadySel {
			height: 120rpx;

			.title {
				height: 80rpx;
			}

			.content {
				width: 100%;
				padding-right: 30rpx;

				text {
					max-width: 500rpx
				}
			}
		}

		.flexBox {
			display: flex;
			align-items: center;
		}

		.refundPrice {
			padding: 20rpx 30rpx;

			.content {
				font-size: 42rpx;
				margin-top: 20rpx;

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
			}
		}

		.refundReason {
			padding: 20rpx 30rpx;

			.content {
				textarea {
					min-height: 160rpx;
					margin-top: 20rpx;
				}
			}

		}
	}

	.repairLastItem {
		padding: 40rpx 30rpx 0;
		border-bottom: 2rpx solid #EBEBEB;
	}

	.repairItemName {
		color: #333;
		font-size: 32rpx;
	}

	.repairSelImg {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 40rpx;
	}
	
	.progress{
		width: 400rpx;
		margin: 20rpx 0;
	}

	.selImgItem {
		width: 350rpx;
		height: 210rpx;
		background-color: #EBEBEB;
		position: relative;
		margin-right: 40rpx;
		margin-bottom: 10rpx;
		border-radius: 15rpx;
		overflow: hidden;
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
</style>
