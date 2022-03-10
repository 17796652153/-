<template>
	<view class="">
		<view class="bgImg">
			<image class="pic" :mode="aspectFill" src="../../static/QRCode-bg.png" mode=""></image>
		</view>
		
		<view class="content">
			<view class="title">
				扫我有惊喜，快来扫一扫！
			</view>
			<view class="scanningImg">
			  <canvas class='canvas' canvas-id='myQrcode' @longtap='saveQrcode'></canvas>
			</view>
			<view class="couponCode" v-if="is_use == 1">
				优惠券码：{{coupon}}
			</view>
			<view class="tips" v-if="is_use == 1">
				*该优惠券只有入驻{{use_limit}}以上才可使用
			</view>
		</view>
		
		<view class="saveImg" @click="saveQrcode">
			保存二维码
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	var QRCode = require('../../utils/weapp-qrcode.js')
	var qrcode;
	export default {
		data(){
			return {
				text: 'https://juejin.cn/',
				image: '',
				
				qrcodePath: '',
				
				is_use: 0, // 是否使用优惠券， 1使用 0不使用
				coupon: '', // 优惠券码
				use_limit: '一年', // 使用限制
			}
		},
		onLoad(options) {
			this.is_use = options.is_use == 0 ? 1 : 0;
			this.getUrl()
		},
		methods:{
			getUrl(){
				let that = this;
				http.postJSON('api/Agent/getAgentUrl',{
					is_use: this.is_use
				},function(res){
					console.log(res,'地址');
					if(res.code == 200){
						that.reateQrcode(res.data.url);
						that.coupon = res.data.coupon;
						http.postJSON('api/store/openStoreMoney',{},function(result){
							result.data.forEach((item,index) => {
								if(item.days == result.data.use_limit){
									that.use_limit = item.name;
								}
							})
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						setTimeout(function(){
							uni.navigateBack()
						},800)
					}
					
				})
			},
			
			
			reateQrcode(url) {
			  console.log(4566);
			  var that = this;
			  uni.showLoading({
			    title: '加载中',
			  })
			  new QRCode('myQrcode', {
			    text: url,
			    width: 200,
			    height: 200,
			    colorDark: "#333333",
			    colorLight: "white",
			    correctLevel: QRCode.CorrectLevel.H,
			    callback: (res) => {
			      uni.hideLoading()
			      console.log(res);
			      // 接下来就可以直接调用微信小程序的api保存到本地或者将这张二维码直接画在海报上面去，看各自需求
			      that.qrcodePath = res.path;
			    }
			  })
			},
			
			//用户二维码保存到本地相册
			saveQrcode: function () {
			  var that = this;
			  
			  uni.getImageInfo({
			    src: that.qrcodePath,
			    success: function (ret) {
			      console.log(ret,'点击保存到相册');
			      var path = ret.path;
			      uni.saveImageToPhotosAlbum({
			        filePath: path,
			        success(result) {
			          if (result.errMsg === 'saveImageToPhotosAlbum:ok') {
			            uni.showToast({
			              title: '保存成功',
			            })
			          }
			        }
			      })
			    }
			  })
			},
		}
	}
</script>

<style lang="less">
	.bgImg{
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: -1;
	}
	
	.content{
		width: 630rpx;
		height: 728rpx;
		// padding-bottom: 24rpx;
		background: #ffffff;
		border-radius: 20rpx;
		margin: 124rpx auto 160rpx;
		text-align: center;
		padding-top: 1rpx;
		.title{
			font-size: 44rpx;
			color: #333;
			margin: 44rpx auto 30rpx;
		}
		.scanningImg{
		  width: 400rpx;
		  height: 400rpx;
		  opacity: 1;
		  background-color: #FF8165;
		  border-radius: 20rpx;
		  margin: 0 auto;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		}
		.couponCode{
			font-size: 44rpx;
			color: #333;
			margin: 40rpx auto 32rpx;
		}
		.tips{
			color: #999;
			font-size: 28rpx;
			margin: 0 auto 20rpx;
		}
	}
	
	.saveImg{
		width: 400rpx;
		height: 100rpx;
		background: linear-gradient(287deg, #ff3e32 0%, #fb822a);
		border-radius: 55rpx;
		text-align: center;
		line-height: 100rpx;
		font-size: 36rpx;
		color: #fff;
		margin: 80rpx auto;
	}
	
	.canvas {
	  width: 200px;
	  height: 200px;
	  /* border: 1px solid black; */
	}
</style>
