<template>
	<view class="page">
		<view class="address">
			<view class="addressbox">
				<view class="flexa">
					<image style="width: 30rpx;" src="../../static/orderDetail2.png" mode="" class="iconimg"></image>
					<text>地址：{{shop.province}}{{shop.city}}{{shop.district}}{{shop.address}}</text>
				</view>
			</view>
			<view class="addressbox">
				<view class="flexa">
					<image style="width: 30rpx;" src="../../static/orderDetail1.png" mode="" class="iconimg"></image>
					<text>{{shop.user_name}}</text>
					<text style="margin-left: 20rpx;">{{shop.user_mobile}}</text>
				</view>
			</view>
		</view>
		<!-- 整体 -->
		<view class="contenter">
			<view class="condetailbox">
				<view class="contitle">{{shop.store_name}}</view>
				<view class="goods" v-for="(val,idx) in shop.goods" :key="idx">
					<view class="goodsImg">
						<image class="pic" :src="www + val.goods_icon" mode=""></image>
					</view>
					<view class="goodsInfo">
						<view class="goodsName multiHide">
							{{val.goods_name}}
						</view>
						<view class="goodsSpecs">
							{{val.goods_spec_title}}
						</view>
					</view>
					<view class="goodsPrice">
						￥<text class="yuan">{{val.goods_price}}</text>
					</view>
				</view>
				<view class="distribution baseflex">
					<view class="disMode">
						配送方式
						<text>{{shop.delivery_type == 1 ? '快递配送' : '到店自取'}}</text>
					</view>
					<view class="disModePrice" v-if="shop.delivery_type == 1">
						￥{{shop.delivery_money}}
					</view>
				</view>
				<view class="distribution">
					<view class="disMode">
						订单备注
						<text class="multiHide">{{shop.remark ? shop.remark : '无'}}</text>
					</view>
				</view>
				<view class="priceDetail">
					<view class="totalPrice">
						总价￥<text class="yuan">{{shop.money}}</text>
					</view>
					<view class="discountPrice" style="margin: 0 10rpx;">
						优惠￥<text class="yuan">{{shop.coupon_money}}</text>
					</view>
					<view class="payPrice">
						需付款￥<text
							class="yuan">{{(((Number(shop.money) * 10) - (Number(shop.coupon_money) * 10)) / 10).toFixed(2)}}</text>
					</view>
				</view>
				<view class="" v-if="type == 'user'">
					<view class="operation" v-if="shop.is_pay == 1">
						<view class="operationBtn redBtn" @click="payOrder(shop.order_no)">
							付款
						</view>
					</view>
					<view class="operation" v-if="shop.is_pay == 2 && shop.status == 1">
						<view class="operationBtn" @click="cancelOrder(shop.order_no)">
							取消订单
						</view>
						<view class="operationBtn" @click="modifyOrderAddr(shop.order_no)">
							修改地址
						</view>
						<view class="operationBtn redBtn" v-if="!shop.urge" @click="urgeDeliver">
							催发货
						</view>
						<view class="operationBtn redBtn" v-else>
							已催
						</view>
					</view>
					<view class="operation" v-if="shop.is_pay == 2 && shop.status == 2">
						<view class="operationBtn" @click="seeDeliveryMap(shop.order_no)">
							查看物流
						</view>
						<view class="operationBtn redBtn" @click="submitOrder(shop.order_no)">
							确认收货
						</view>
					</view>
					<view class="operation" v-if="shop.status == 3">
						<view class="operationBtn" v-if="!shop.refund_status"
							@click="applyRefund(shop.order_no,shop.user_mobile,((Number(shop.money) * 10) - (Number(shop.coupon_money) * 10)) / 10)">
							退货退款
						</view>
						<view class="operationBtn" v-if="shop.refund_status == 1" @click="applyIn">
							申请中
						</view>
						<view class="operationBtn" v-if="shop.refund_status == 2"
							@click="showUploadCode(shop.order_no,shop.refund_delivery_no)">
							{{shop.refund_delivery_no ? '商家待确认' : '上传单号'}}
						</view>
						<view class="operationBtn" v-if="shop.refund_status == 3" @click="jumpReasonReject">
							申请被拒
						</view>
						<view class="operationBtn redBtn" v-if="shop.refund_status == 3"
							@click="clearRefund(shop.order_no)">
							撤销申请
						</view>
						<view class="operationBtn" v-if="shop.refund_status == 4">
							已退款
						</view>
					</view>
					<view class="operation" v-if="shop.status == 4">
						<view class="operationBtn">
							已取消
						</view>
					</view>
				</view>
			
			</view>
		</view>
		<!-- 订单信息 -->
		<view class="contenter" style="margin-top: 20rpx;">
			<view class="orderdetail">
				<view>订单信息</view>
				<view class="orderbox">
					<text class="leftorder">订单号码</text>
					<view class="rightorder">
						<text>{{shop.order_no}}</text>
						<image src="../../static/orderDetail3.png" mode="" @click="copyCode(shop.order_no)"></image>
					</view>
				</view>
				<view class="orderbox">
					<text class="leftorder">支付方式</text>
					<view class="rightorder">
						{{shop.pay_type}}
					</view>
				</view>
				<view class="orderbox" v-if="shop.delivery_name">
					<text class="leftorder">物流公司</text>
					<view class="rightorder">
						{{shop.delivery_name}}
					</view>
				</view>
				<view class="orderbox" v-if="shop.delivery_no">
					<text class="leftorder">快递单号</text>
					<view class="rightorder">
						<text>{{shop.delivery_no}}</text>
						<image src="../../static/orderDetail3.png" mode="" @click="copyCode(shop.delivery_no)"></image>
					</view>
				</view>
				<view class="orderbox" v-if="shop.pay_time">
					<text class="leftorder">下单时间</text>
					<view class="rightorder">
						{{shop.pay_time}}
					</view>
				</view>
				<view class="orderbox" v-if="shop.delivery_time">
					<text class="leftorder">发货时间</text>
					<view class="rightorder">
						{{shop.delivery_time}}
					</view>
				</view>
			</view>
		</view>
	
	
		<!-- 弹窗 取消订单 -->
		<view class="showModel" v-if="showModel">
			<view class="mask"></view>
			<view class="model">
				<view class="title">
					是否取消该订单
				</view>
				<view class="operation">
					<view class="cancel" @click="cancel">
						取消
					</view>
					<view class="confirm" @click="confirm">
						确认
					</view>
				</view>
			</view>
		</view>
		
		<!-- 弹窗 填写单号 -->
		<view class="showModel" v-if="showNumModel">
			<view class="mask"></view>
			<view class="model">
				<view class="title">
					请输入快递单号
				</view>
				<view class="content">
					<input type="text" v-model="uploadCode" />
				</view>
				<view class="operation">
					<view class="cancel" @click="cancel">
						取消
					</view>
					<view class="confirm" @click="confirmNum">
						确认
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
				id: '',
				shop: '',

				www: http.rootDocument,
				showModel: false, // 取消订单
				showNumModel: false, // 填写单号
				uploadCode: '', // 上传的单号
				currentOrderNo: '', // 选中的订单单号
				
				type: 'user', // 进入方式  默认是用户进入  另外为商家进入
			}
		},
		onLoad(options) {
			console.log(options)
			if (options) {
				this.id = options.order_no;
				this.type = options.type || 'user';
				this.getshopdetail()
			} else {
				console.log('空的')
			}
		},
		onShow() {
			// this.getshopdetail();
			let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
			let currentPage = pages[pages.length - 1];
			//prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
			let addressId = currentPage.addressId;
			if(addressId && this.currentOrderNo){
				http.postJSON('api/order/editOrderAddress',{
					addressId: addressId,
					order_no: this.currentOrderNo
				}, function(res){
					console.log(res,'修改地址');
					if(res.code == 200){
						uni.showToast({
							title: '修改成功',
							icon: 'none'
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			}
		},
		methods: {
			getshopdetail() {
				let that = this;
				http.postJSON('api/order/getOrderInfo', {
					order_no: this.id
				}, function(res) {
					console.log(res, '订单详情');
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
					that.shop = res.data;
				})
			},

			// 复制提货码
			copyCode(codeNum) {
				uni.setClipboardData({
					//准备复制的数据
					data: codeNum,
					success: function(res) {
			 		console.log(res, '拷贝');
						uni.showToast({
							title: '复制成功',
			 		});
			 	}
				});
			},
			
			// 取消订单
			cancelOrder(order_no){
				this.showModel = true;
				this.currentOrderNo = order_no;
			},
			
			// 支付订单
			payOrder(order_no){
				let that = this;
				http.postJSON('api/order/orderPay',{
					order_no: order_no
				},function(res){
					console.log(res,'支付订单');
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
										that.shop = [];
										that.getshopdetail()
									},
									fail(err) {
										uni.showToast({
											title: '取消支付',
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
			},
			
			// 修改订单地址
			modifyOrderAddr(order_no){
				this.currentOrderNo = order_no;
				uni.navigateTo({
					url: '../address/userAddress?fromType=selAddr'
				})
			},
			
			// 催发货
			urgeDeliver(){
				uni.showToast({
					title: '已提醒商家发货，请耐心等待',
					icon: 'none'
				})
				this.$set(this.shop, 'urge', true)
			},
			
			// 确认收货
			submitOrder(order_no){
				let that = this;
				http.postJSON('api/order/submitOrder',{order_no: order_no},function(res){
					console.log(res,'确认收货');
					that.shop = [];
					that.getshopdetail()
				})
			},
			
			// 查看订单位置  地图
			seeDeliveryMap(order_no){
				uni.navigateTo({
					url: './deliveryMap?order_no=' + order_no
				})
			},
			
			// 申请中
			applyIn(){
				uni.showToast({
					title: '商家正在处理中，请耐心等待',
					icon: 'none'
				})
			},
			
			// 取消申请退款
			clearRefund(order_no){
				let that = this;
				http.postJSON('api/order/clearRefund',{
					order_no: order_no
				},function(res){
					console.log(res,'取消申请退款');
					if(res.code == 200){
						uni.showToast({
							title: '取消申请退款',
							icon: 'none'
						})
						that.shop = [];
						that.getshopdetail()
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			// 取消
			cancel(){
				this.showModel = false;
				this.showNumModel = false;
			},
			
			// 点击取消订单的确认
			confirm(){
				this.showModel = false;
				console.log('取消订单的确认');
				let that = this;
				
				http.postJSON('api/order/clearOrder',{
					order_no: this.currentOrderNo
				},function(res){
					console.log(res,'取消订单');
					if(res.code == 200){
						uni.showToast({
							title: '取消成功',
							icon: 'none'
						})
						that.shop = [];
						that.getshopdetail()
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			// 点击上传单号
			showUploadCode(order_no,refund_delivery_no){
				if(refund_delivery_no){
					return
				}
				console.log(order_no);
				this.currentOrderNo = order_no
				this.showNumModel = true;
			},
			
			// 点击单号的确认
			confirmNum(){
				this.showNumModel = false;
				http.postJSON('api/order/upDeliveryNo',{
					order_no: this.currentOrderNo,
					refund_delivery_no: this.uploadCode
				},function(res){
					console.log(res,'上传单号');
					if(res.code == 200){
						uni.showToast({
							title: '请耐心等待',
							icon: 'none'
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
					
				})
				this.uploadCode = '';
			},
			
			// 退款申请
			applyRefund(order_no,user_mobile,pay_money){
				uni.navigateTo({
					url: `./refund?order_no=${order_no}&user_mobile=${user_mobile}&pay_money=${pay_money}`
				})
			},
			
			// 查看被拒原因
			jumpReasonReject(){
				uni.navigateTo({
					url: "./reasonReject"
				})
			},
		}
	};
</script>

<style>
	page {
		background-color: #f5f5f5;
	}

	.address {
		box-sizing: border-box;
		width: 690rpx;
		background: #ffffff;
		border-radius: 20rpx;
		margin: 20rpx 0 20rpx 30rpx;
		padding: 20rpx;
		background-color: #FFFFFF;

	}

	.addressbox {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.iconimg {
		width: 24rpx;
		height: 30rpx;
		margin-right: 10rpx;
		flex-shrink: 0;
	}

	.flexa {
		display: flex;
		align-items: center;
		font-size: 32rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: LEFT;
		color: #333333;
	}

	.arrow {
		width: 28rpx;
		height: 28rpx;
	}

	.smalladdres {
		font-size: 24rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: LEFT;
		color: #999999;
		margin-left: 45rpx;
		margin-bottom: 20rpx;
		margin-top: 10rpx;
	}

	.contenter {
		box-sizing: border-box;
		width: 690rpx;
		padding: 20rpx;
		margin-left: 30rpx;
		background: #ffffff;
		border-radius: 20rpx;
		font-size: 28rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: LEFT;
		color: #333333;
	}

	.condetailbox {
		margin-bottom: 20rpx;
	}

	.condetail {
		display: flex;
		justify-content: flex-start;
		font-size: 28rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: LEFT;
		color: #333333;
		padding: 20rpx 0;

	}

	.condetail-img {
		width: 100%;
		height: 100%;
		border-radius: 5rpx;
	}

	.condetail-mon {
		font-size: 36rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: LEFT;
		color: #333333;
		margin-bottom: 20rpx;
	}

	.youhuibox {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
	}

	.youhui {
		display: flex;
		align-items: center;
	}

	.youhuimoney {
		color: #ff4646;
	}

	.allprice {
		text-align: right;
	}

	.car {
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30rpx;
		width: 750rpx;
		height: 96rpx;
		background: #ffffff;
		box-shadow: 0rpx 0rpx 8rpx 0rpx rgba(0, 0, 0, 0.15);
		position: fixed;
		bottom: 66rpx;
		font-size: 24rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		color: #333333;
	}

	.carleft {
		font-size: 36rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: CENTER;
		color: #333333;
	}

	.carright {
		width: 180rpx;
		height: 56rpx;
		line-height: 56rpx;
		background: #ff4646;
		border-radius: 28rpx;
		font-size: 24rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: CENTER;
		color: #ffffff;
	}

	.courier {
		font-size: 28rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		text-align: LEFT;
		color: #333333;
		margin-top: 20rpx;
	}

	.courierimg {
		width: 28rpx;
		height: 28rpx;
		vertical-align: middle;
		margin-left: 10rpx;
	}

	.orderdetail {
		font-size: 28rpx;
		font-family: PingFang SC, PingFang SC-Regular;
		font-weight: 400;
		color: #333333;
	}

	.orderbox {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20rpx;
	}

	.leftorder {
		color: #999999;
	}

	.rightorder image {
		width: 28rpx;
		height: 28rpx;
		vertical-align: middle;
		margin-left: 20rpx;
	}
	
	
	
	.goods{
		display: flex;
		margin-bottom: 20rpx;
		
	}
	.goodsImg{
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
		overflow: hidden;
		margin-right: 20rpx;
		flex-shrink: 0;
	}
	.goodsInfo{
		width: 320rpx;
		flex-shrink: 0;
		margin-right: 12rpx;
		
	}
	.goodsName{
		height: 70rpx;
		margin-bottom: 10rpx;
	}
	.goodsSpecs{
		color: #999;
	}
	.goodsPrice{
		font-size: 20rpx;
	}
	.distribution{
		margin-bottom: 30rpx;
		
	}
	.disMode{
		display: flex;
		max-height: 70rpx;
		
	}
	.disMode text{
		margin-left: 20rpx;
		color: #999999;
		max-width:400rpx;
	}
	.disModePrice{
		color: #999;
	}
	.distribution:last-child{
		margin-bottom: 40rpx;
	}
	.priceDetail{
		width: 100%;
		text-align: right;
		display: flex;
		justify-content: flex-end;
		margin-bottom: 20rpx;
		
	}
	.totalPrice,.discountPrice{
		color: #999;
	}
	.payPrice{
		margin-left: 12rpx;
	}
	.operation{
		width: 100%;
		text-align: right;
		display: flex;
		justify-content: flex-end;
		
	}
	.operationBtn{
		padding: 10rpx 20rpx;
		border: 1rpx solid #cccccc;
		border-radius: 50rpx;
		margin-right: 30rpx;
		
	}
	.operationBtn:last-child{
		margin-right: 0;
	}
	.redBtn{
		color: #FF2D2D;
		border-color: #FF2D2D;
	}
	
	
	
	
	
	
	.mask{
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.60);
		z-index: 99;
	}
	
	.model{
		position: fixed;
		left: 50%;
		top: 40%;
		z-index: 999;
		transform: translateX(-50%) translateY(-40%);
		width: 488rpx;
		background: #ffffff;
		border-radius: 10rpx;
		
		
	}
	.title{
		font-size: 32rpx;
		color: #333;
		padding: 20rpx;
	}
	.content{
		margin-left: 20rpx;
		width: 448rpx;
		height: 56rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		margin-bottom: 35rpx;
		position: relative;
		
		font-size: 24rpx;
		
	}
	.selPicker{
		display: inline-block;
		height: 100%;
		width: 100%;
		padding: 16rpx 20rpx;
		box-sizing: border-box;
	}
	.content image{
		position: absolute;
		top: 16rpx;
		right: 20rpx;
		width: 24rpx;
		height: 24rpx;
	}
	
	.operation{
		height: 80rpx;
		width: 100%;
		border-top: 2rpx solid #EBEBEB;
		display: flex;
		align-items: center;
		justify-content: space-around;
		
	}
	.operation view{
		flex: 1;
		font-size: 32rpx;
		text-align: center;
	}
	.operation .cancel{
		color: #999999
	}
	.operation .confirm{
		color: #FF2D2D;
	}
</style>
