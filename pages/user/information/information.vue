<template>
	<view class="">
		<view class="userInfo">
			<!-- 头像 -->
			<view class="infoItem userHeadPhoto">
				<view class="infoText">头像</view>
				<view class="headPhoto" @click="chooseImage">
					<image mode="aspectFill" class="pic" :src="head_img"></image>
				</view>
			</view>
			<!-- 昵称 -->
			<view class="infoItem userName">
				<view class="infoText">昵称</view>
				<view class="infoContent nameContent">
					<input class="nickname" type="text" v-model="nick_name" placeholder="请输入昵称" />
				</view>
			</view>
			<!-- 性别 -->
			<view class="infoItem userSex">
				<view class="infoText">性别</view>
				<view class="infoContent nameContent">
					<radio-group>
						<label class="weui-cell weui-check__label" style="margin-right: 20rpx;;" v-for="item in [{id:1,content:'男'},{id:2,content:'女'}]"
						 :key="item.id">
							<radio @click="changeSex(item.id)" color="#ff461e" :value="item.id" :checked="sex == item.id" />{{item.content}}
						</label>
					</radio-group>
				</view>
			</view>
			<!-- 手机号 -->
			<view class="infoItem userName">
				<view class="infoText">手机号</view>
				<view class="infoContent nameContent">
					<input class="nickname" type="text" v-model="phone" placeholder="请输入手机号" />
				</view>
			</view>
			<!-- 所在地区 -->
			<view class="infoItem userAge" v-if="false">
				<view class="infoText">所在地区</view>
				<view class="infoContent nameContent">
					<input type="text" placeholder-class="placeholder" placeholder="请选择省市区" v-model="areaSelectedStr" disabled="true"
					 />
				</view>
			</view>
			<!-- 收货地址 -->
			<view class="infoItem userName">
				<view class="infoText">收货地址</view>
				<view class="infoContent addrContent" @click="jumpAddress">
					<image src="../../../static/icon_arrow-rightGray.png" mode=""></image>
				</view>
			</view>
		</view>


		<!-- 底部按钮 -->
		<view class="footerBtn">
			<view class="btnContent">
				<view class="submitBtn" @click="cancel">取消</view>
				<view class="submitBtn" @click="confirmModify">确定</view>
			</view>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data() {
			return {
				location: '', // 所在地区
				sex: 1, // 性别
				phone: '', // 手机号
				nick_name: '', // 昵称
				head_img: '', // 头像
				
				userInfo: '', // 用户信息
			}
		},
		onLoad() {
			let information = uni.getStorageSync('information');
			if(!information){
				this.getUserInfo();
			}
			
			this.userInfo = information;
			console.log(information);
			this.head_img = information.head_img
			this.phone = information.mobile;
			this.sex = information.sex;
			this.nick_name = information.nick_name;
		},
		methods: {
			// 获取用户信息
			getUserInfo(){
				let that = this;
				http.postJSON('api/User/getUserInfo',{
				},function(res){
					console.log(res,'用户信息');
					if(res.code == 200){
						that.userInfo = res.data;
					}else if(res.code == 2){
						console.log('登录过期');
						// that.login()
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
					
				})
			},
			
			// 修改头像
			chooseImage: async function() {
				let that = this;
				uni.chooseImage({
					sourceType: ['album', 'camera'], // 相册还是拍照
					sizeType: ['compressed'], // 原图还是压缩  压缩
					count: 1,
					success: (res) => {
						console.log(res, 'resresres');
						const tempFilePaths = res.tempFilePaths;
						uni.uploadFile({
							url: http.rootDocument + 'api/index/uploadImg', //仅为示例，非真实的接口地址
							filePath: tempFilePaths[0],
							name: 'file',
							formData: {
								'user': 'test',
								token: 'api',
								utoken: uni.getStorageSync('utoken')
							},
							success: (uploadFileRes) => {
								// console.log(uploadFileRes.data,'najscnasjkcnkjs');
								let data = JSON.parse(uploadFileRes.data);
								console.log(data);
								
								that.head_img = http.rootDocument + data.data;
								console.log(that.head_img);
							},
							fail: (err) => {
								console.log(err, 'errerrerr')
							}
						});
			
			
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
			
			// 改变性别
			changeSex(id){
				console.log(id);
				this.sex = id;
			},
			
			// 取消修改
			cancel(){
				uni.navigateBack()
			},
			
			// 确认修改
			confirmModify(){
				if(!this.head_img){
					uni.showToast({
						title: '头像不能为空',
						icon: 'none'
					})
					return
				}
				
				if(!this.nick_name){
					uni.showToast({
						title: '昵称不能为空',
						icon: 'none'
					})
					return
				}
				
				let reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
				if(this.phone){
					if (!reg_tel.test(this.phone)) {
						uni.showToast({
							title: '请填写正确的手机号',
							icon: 'none'
						})
						return
					}
				}
				
				http.postJSON('api/User/editUserInfo',{
					head_img: this.head_img,
					nick_name: this.nick_name,
					sex: this.sex,
					mobile: this.phone
				},function(res){
					if(res.code == 200){
						uni.showToast({
							title: '修改成功',
							icon: 'none',
							duration: 2000,
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
			
			
			// 跳转收货地址
			jumpAddress(){
				uni.navigateTo({
					url: "../../address/userAddress"
				})
			},
		},
	}
</script>

<style>
	.infoItem {
		width: 750rpx;
		/* height: 112rpx; */
		opacity: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		line-height: 112rpx;
	}

	.infoText {
		color: #333;
		font-size: 32rpx;
	}

	.headPhoto {
		width: 72rpx;
		height: 72rpx;
		opacity: 1;
		border-radius: 50%;
		overflow: hidden;
	}

	.infoContent {
		width: 510rpx;
		border-bottom: 2rpx solid #ebebeb;
		height: 110rpx;
		line-height: 110rpx;
	}

	.addrContent {
		border-bottom: 0;
	}

	.addrContent image {
		width: 24rpx;
		height: 24rpx;
		float: right;
		margin-top: 42rpx;
	}

	.phoneContent textarea {
		padding: 34rpx 0;
	}

	.nameContent input {
		height: 110rpx;
		line-height: 110rpx;
	}

	.nickname {
		height: 110rpx;
		line-height: 110rpx;
	}

	.phoneContent {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 510rpx;
		border-bottom: 2rpx solid #ebebeb;
		min-height: 110rpx;
		line-height: 50rpx;
		/* height: 110rpx;
	  line-height: 110rpx; */
	}

	.changeBtn {
		width: 172rpx !important;
		height: 48rpx;
		opacity: 1;
		background: #34ce96;
		border-radius: 28rpx;
		color: #fff;
		font-size: 24rpx;
		font-weight: 400;
		text-align: center;
		line-height: 48rpx;
		margin: 0 !important;
		padding: 0;
	}





	.footerBtn {
		position: fixed;
		left: 0;
		bottom: 40rpx;
		padding: 0 30rpx;

	}

	.btnContent {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 76rpx;
	}

	.submitBtn {
		width: 330rpx;
		height: 76rpx;
		background: #FF2D2D;
		border-radius: 55rpx;
		text-align: center;
		line-height: 76rpx;
		font-size: 36rpx;
		color: #fff;
		margin-right: 30rpx;
	}

	.submitBtn:last-child {
		margin: 0;
	}

	/*弹窗主体*/
	.modal-content {
		position: fixed;
		bottom: -285px;
		left: 0;
		width: 100%;
		height: 285px;
		/*box-shadow: 10rpx 0 30rpx rgba(0,0,0,.9);*/
		margin-top: 5px;
		background: #fff;
		z-index: 999;
	}

	/*遮罩层*/
	.modal-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #000;
		opacity: .8;
		z-index: 99;
	}

	/*弹窗头部*/
	.modal-header {
		margin: 2px 0;
		font-size: 16px;
		color: #666;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		line-height: 30px;
	}

	/*所在地区字样*/
	.modal-title {
		text-align: center;
		width: 100%;
	}

	/*关闭按钮*/
	.modal-close {
		width: 20px;
	}

	.modal-body {
		font-size: 14px;
	}

	/*每级地区标题*/
	.viewpager-title {
		padding: 0 10px;
		/*color: #f03118;*/
		line-height: 30px;
	}

	/*分隔线*/
	.viewpager-divider {
		width: 100%;
		height: 1px;
		background: #ccc;
	}

	/*左右滑动控件*/
	.swiper-area {
		height: 220px;
	}

	/*地址列表ListView容器*/
	.viewpager-listview {
		padding-top: 5px;
		height: 100%;
	}

	/*每行地址item项*/
	.viewpager-listview view {
		line-height: 30px;
		padding: 0 10px;
	}

	/*高亮当前所选地区*/
	.area-selected {
		color: red;
	}

	/*初始隐藏*/
	.hidden {
		display: none;
	}

	/*运行时显示*/
	.show {
		display: block;
	}
</style>
