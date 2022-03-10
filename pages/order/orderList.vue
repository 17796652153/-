<template>
	<view class="">
		<view class="headerTabs">
			<view :class="activeTabs == 0 ? 'tabs activeTab' : 'tabs' " @click="changeOrder(0)">全部</view>
			<view :class="activeTabs == 1 ? 'tabs activeTab' : 'tabs' " @click="changeOrder(1)">待付款</view>
			<view :class="activeTabs == 2 ? 'tabs activeTab' : 'tabs' " @click="changeOrder(2)">待发货</view>
			<view :class="activeTabs == 3 ? 'tabs activeTab' : 'tabs' " @click="changeOrder(3)">待收货</view>
			<view :class="activeTabs == 4 ? 'tabs activeTab' : 'tabs' " @click="changeOrder(4)">售后</view>
		</view>
		
		<view class="orderList" v-if="orderList.length > 0">
			<view class="orderGoods" v-for="(item,index) in orderList" :key="index" @click="jumpOrderDetail(item.order_no)">
				<view class="shopName singleHide">
					{{item.store_name}}
				</view>
				<view class="goods" v-for="(val,idx) in item.goods" :key="idx">
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
						<!-- ￥<text class="yuan">18</text><text class="jiao">.80</text> -->
						￥<text class="yuan">{{val.goods_price}}</text>
					</view>
				</view>
				<view class="distribution baseflex">
					<view class="disMode">
						配送方式
						<text>{{item.delivery_type == 1 ? '快递配送' : '到店自取'}}</text>
					</view>
					<view class="disModePrice" v-if="item.delivery_type == 1">
						￥{{item.delivery_money}}
					</view>
				</view>
				<view class="distribution">
					<view class="disMode">
						订单备注
						<text class="multiHide">{{item.remark ? item.remark : '无'}}</text>
					</view>
				</view>
				<view class="priceDetail">
					<view class="totalPrice">
						总价￥<text class="yuan">{{item.money}}</text>
					</view>
					<view class="discountPrice" style="margin: 0 10rpx;">
						优惠￥<text class="yuan">{{item.coupon_money}}</text>
					</view>
					<view class="payPrice">
						 需付款￥<text class="yuan">{{(((Number(item.money) * 10) - (Number(item.coupon_money) * 10)) / 10).toFixed(2)}}</text>
					</view>
				</view>
				<view class="operation" v-if="item.is_pay == 1">
					<view class="operationBtn redBtn" @click.stop="payOrder(item.order_no)">
						付款
					</view>
				</view>
				<view class="operation" v-if="item.is_pay == 2 && item.status == 1">
					<view class="operationBtn" @click.stop="cancelOrder(item.order_no)">
						取消订单
					</view>
					<view class="operationBtn" @click.stop="modifyOrderAddr(item.order_no)">
						修改地址
					</view>
					<view class="operationBtn redBtn" v-if="!item.urge" @click.stop="urgeDeliver(index)">
						催发货
					</view>
					<view class="operationBtn redBtn" v-else>
						已催
					</view>
				</view>
				<view class="operation" v-if="item.is_pay == 2 && item.status == 2">
					<view class="operationBtn" @click.stop="seeDeliveryMap(item.order_no)">
						查看物流
					</view>
					<view class="operationBtn redBtn" @click.stop="submitOrder(item.order_no)">
						确认收货
					</view>
				</view>
				<view class="operation" v-if="item.status == 3">
					<!-- <view class="operationBtn" v-if="!item.refund_status" @click="applyRefund(item.order_no,item.user_mobile,((Number(item.money) * 10) - (Number(item.coupon_money) * 10)) / 10)">
						退货退款
					</view> -->
					<view class="operationBtn" v-if="!item.refund_status" @click.stop="applyRefund(item.order_no,item.user_mobile,item.money,item.coupon_money)">
						退货退款
					</view>
					<view class="operationBtn" v-if="item.refund_status == 1" @click.stop="applyIn">
						申请中
					</view>
					<view class="operationBtn" v-if="item.refund_status == 2" @click.stop="showUploadCode(item.order_no,item.refund_delivery_no)">
						{{item.refund_delivery_no ? '商家待确认' : '上传单号'}}
					</view>
					<view class="operationBtn" v-if="item.refund_status == 3" @click.stop="jumpReasonReject(item.refund_store_remark)">
						申请被拒
					</view>
					<view class="operationBtn redBtn" v-if="item.refund_status == 3" @click.stop="clearRefund(item.order_no)">
						撤销申请
					</view>
					<view class="operationBtn" v-if="item.refund_status == 4">
						已退款
					</view>
				</view>
				<view class="operation" v-if="item.status == 4">
					<view class="operationBtn">
						已取消
					</view>
				</view>
			</view>
		</view>
		<view class="goodsNull" v-else>
			暂无订单
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
		data(){
			return {
				activeTabs: 0, // 选中的tab
				showModel: false, // 取消订单
				showNumModel: false, // 填写单号
				uploadCode: '', // 上传的单号
				
				www: http.rootDocument, // 根路径
				currentOrderNo: '', // 选中的订单单号
				firstEnter: true, // 第一次进入
				
				orderList: [], // 订单列表
				page: 1, // 当前页码
				last_page: 1, // 最后一页
				total: 0, // 总条数
				
				hidePage: false, // 离开页面
			}
		},
		onLoad(options) {
			console.log(options);
			this.activeTabs = options.idx;
			
		},
		onShow() {
			this.getOrderList();
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
		methods:{
			// 获取订单列表
			getOrderList(){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				uni.showLoading();
				http.postJSON('api/order/queryOrderList',{
					status: parseInt(this.activeTabs) + 1,
					page: this.page
				},function(res){
					console.log(res,'订单列表');
					uni.hideLoading();
					if(res.code != 200){
						return
					}
					if(!that.firstEnter){
						that.orderList.forEach(item => {
							if(item.urge == false){
								
							}
						})
					}
					that.orderList = that.orderList.concat(res.data.data);
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.total = res.data.total;
					that.firstEnter = false;
					if(that.firstEnter){
						that.orderList.forEach(item => {
							item.urge = false;
						})
					}
				})
			},
			
			
			// 切换订单列表
			changeOrder(idx){
				this.activeTabs = idx;
				this.page = 1;
				this.orderList = [];
				this.getOrderList();
			},
			
			
			// 跳转订单详情
			jumpOrderDetail(order_no){
				uni.navigateTo({
					url: './goods-detail?order_no=' + order_no
				})
				this.page = 1;
				this.orderList = [];
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
										that.page = 1;
										that.orderList = [];
										that.getOrderList()
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
				console.log('离开页面');
				this.hidePage = true
			},
			
			// 催发货
			urgeDeliver(index){
				uni.showToast({
					title: '已提醒商家发货，请耐心等待',
					icon: 'none'
				})
				this.$set(this.orderList[index], 'urge', true)
			},
			
			// 确认收货
			submitOrder(order_no){
				let that = this;
				http.postJSON('api/order/submitOrder',{order_no: order_no},function(res){
					console.log(res,'确认收货');
					that.page = 1;
					that.orderList = [];
					that.getOrderList()
				})
			},
			
			// 查看订单位置  地图
			seeDeliveryMap(order_no){
				uni.navigateTo({
					url: './deliveryMap?order_no=' + order_no
				})
				console.log('离开页面');
				this.hidePage = true
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
						that.page = 1;						that.orderList = [];
						that.getOrderList()
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
						that.page = 1;
						that.orderList = [];
						that.getOrderList()
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
			applyRefund(order_no,user_mobile,total_money,coupon_money){
				let pay_money = (((Number(total_money) * 10) - (Number(coupon_money) * 10)) / 10).toFixed(2)
				uni.navigateTo({
					url: `./refund?order_no=${order_no}&user_mobile=${user_mobile}&pay_money=${pay_money}`
				})
				this.page = 1;
				this.orderList = [];
			},
			
			// 查看被拒原因
			jumpReasonReject(refund_store_remark){
				uni.navigateTo({
					url: "./reasonReject?remark=" + refund_store_remark
				})
				console.log('离开页面');
				this.hidePage = true
			},
		},
		onReachBottom(){
			console.log('触底了');
			if(this.page < this.last_page){
				this.page ++;
				this.getOrderList()
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
			this.orderList = [];
			this.getOrderList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	.headerTabs{
		width: 100%;
		height: 80rpx;
		display: flex;
		align-items: center;
		.tabs{
			width: 150rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			font-size: 28rpx;
			color: #333;
		}
		.activeTab{
			font-size: 36rpx;
			color: #FF2D2D;
		}
	}
	
	.orderList{
		padding: 0 30rpx 30rpx;
		.orderGoods{
			margin-bottom: 20rpx;
			width: 690rpx;
			background: #ffffff;
			border-radius: 20rpx;
			padding: 20rpx;
			font-size: 28rpx;
			color: #333;
			.shopName{
				padding: 22rpx 20rpx;
				max-width: 400rpx;
			}
			.goods{
				display: flex;
				margin-bottom: 20rpx;
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
					.goodsName{
						height: 70rpx;
						margin-bottom: 10rpx;
					}
					.goodsSpecs{
						color: #999;
					}
				}
				.goodsPrice{
					font-size: 20rpx;
				}
			}
			.distribution{
				margin-bottom: 30rpx;
				.disMode{
					display: flex;
					max-height: 70rpx;
					text{
						margin-left: 20rpx;
						color: #999999;
						max-width:400rpx;
					}
				}
				.disModePrice{
					color: #999;
				}
				&:last-child{
					margin-bottom: 40rpx;
				}
			}
			.priceDetail{
				width: 100%;
				text-align: right;
				display: flex;
				justify-content: flex-end;
				margin-bottom: 20rpx;
				.totalPrice,.discountPrice{
					color: #999;
				}
				.payPrice{
					margin-left: 12rpx;
				}
			}
			.operation{
				width: 100%;
				text-align: right;
				display: flex;
				justify-content: flex-end;
				.operationBtn{
					padding: 10rpx 20rpx;
					border: 1rpx solid #cccccc;
					border-radius: 50rpx;
					margin-right: 30rpx;
					&:last-child{
						margin-right: 0;
					}
				}
				.redBtn{
					color: #FF2D2D;
					border-color: #FF2D2D;
				}
			}
		}
	}
	.yuan{
		font-size: 32rpx;
	}
	.jiao{
		font-size: 24rpx;
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
			.selPicker{
				display: inline-block;
				height: 100%;
				width: 100%;
				padding: 16rpx 20rpx;
				box-sizing: border-box;
			}
			image{
				position: absolute;
				top: 16rpx;
				right: 20rpx;
				width: 24rpx;
				height: 24rpx;
			}
		}
		.operation{
			height: 80rpx;
			width: 100%;
			border-top: 2rpx solid #EBEBEB;
			display: flex;
			align-items: center;
			justify-content: space-around;
			view{
				flex: 1;
				font-size: 32rpx;
				text-align: center;
			}
			.cancel{
				color: #999999
			}
			.confirm{
				color: #FF2D2D;
			}
		}
	}
</style>
