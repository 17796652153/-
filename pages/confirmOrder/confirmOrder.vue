<template>
	<view class="">
		<view class="confrimMain">
			<!-- 地址 -->
			<view class="address" @click="selAddress">
				<view class="addressIcon">
					<image class="pic" src="../../static/icon_address2.png" mode=""></image>
				</view>
				<view class="addressContent" v-if="defaultAddress.id">
					<view class="userInfo">
						<view class="userName">
							{{defaultAddress.name}}
						</view>
						<view class="userPhone">
							{{defaultAddress.mobile}}
						</view>
					</view>
					<view class="userAddr multiHide">
						{{defaultAddress.province}}{{defaultAddress.city}}{{defaultAddress.district}} {{defaultAddress.address}}
					</view>
				</view>
				<view class="addressContent" v-else>
					请选择收货地址
				</view>
				<view class="selAddr">
					<image class="pic" src="../../static/icon_arrow-rightGray.png" mode=""></image>
				</view>
			</view>
		
			<!-- 商品订单 -->
			<view class="goodsOrder" v-for="(item,index) in orderList" :key="index">
				<view class="goodsOrderMain">
					<block v-for="(val,idx) in item.goods" :key="idx">
						<view class="goods">
							<view class="goodsImg">
								<image class="pic" :src="www + val.goods_icon" mode="aspectFill"></image>
							</view>
							<view class="goodsContent">
								<view class="goodsContentTitle">
									<view class="goodsName multiHide">
										{{val.goods_name}}
									</view>
									<view class="goodsPrice">
										￥{{val.goods_price}}
									</view>
								</view>
								<view class="goodsSpec">
									<!-- <text>颜色:蓝色 </text> <text> 尺寸:1.2m*1m</text> -->
									<text>{{val.goods_spec_title}}</text>
								</view>
							</view>
						</view>
						<view class="goodsOrderItem baseflex">
							<view class="goodsOrderInfoTitle">
								购买数量
							</view>
							<view class="goodsOrderInfoContent">
								{{val.num}}
							</view>
						</view>
						<picker mode="selector" :disabled="val.coupon.length < 1" :range="val.coupon" range-key="coupon_name" @change="changeCoupon($event,index,idx)">
							<view class="goodsOrderItem baseflex">
								<view class="goodsOrderInfoTitle">
									<image class="couponImg" src="../../static/icon_coupon.png" mode=""></image> 红包/优惠券 <image class="moreImg" src="../../static/icon_arrow-rightGray.png" mode=""></image>
								</view>
								<view class="goodsOrderInfoContent coupon" v-if="val.coupon.length >= 1">
									{{val.activeCoupon != null ? (val.coupon[val.activeCoupon].coupon_name) : '选择优惠券'}}
								</view>
								<view class="goodsOrderInfoContent coupon" v-else>
									暂无优惠券
								</view>
							</view>
						</picker>
					</block>
					<view class="goodsOrderInfo">
						<view class="goodsOrderItem baseflex" @click="showDelivery(index)">
							<view class="goodsOrderInfoTitle">
								配送方式 <text>{{item.delivery[item.selfDelivery].name}}</text> <image class="downArrow" src="../../static/icon_arrow-downGray.png" mode=""></image>
							</view>
							<view class="goodsOrderInfoContent sistribution" v-if="parseInt(item.selfDelivery) == 0">
								{{item.delivery_type === 1 ? ('￥' + item.count_delivery) : '免运费'}}
							</view>
						</view>
						<view class="goodsOrderItem baseflex">
							<view class="goodsOrderInfoTitle">
								订单备注 
								<view class="textareaBox">
									<textarea auto-height v-model="item.remark" placeholder="选填" />
								</view>
							</view>
						</view>
						
					</view>
				</view>
				<view class="goodsOrderSubtotal">
					<block v-if="parseInt(item.discountPrice) > 0">已优惠<text style="margin-right: 10rpx;">￥{{item.discountPrice}}</text></block>
					  小计：<text class="priceSubtotal">￥{{item.goods_money.toFixed(2)}}</text>
				</view>
			</view>
		</view>
		
		<!-- 底部结算 -->
		<!-- <view class="bottomOperation" :style="isIphoneX ? 'height: 166rpx;' : 'height: 98rpx;'"> -->
		<view class="bottomOperation">
			<view class="payMoney">
				共{{totalNum}}件  合计：<text>￥</text><text class="price">{{totalPrice}}</text>
			</view>
			<view class="payBtn" @click="submitOrder">
				提交订单
			</view>
		</view>
		
		<!-- 送货方式 -->
		<view class="delivery">
			<view class="mask" @click="hideDeilvery" v-if="showDeliverys"></view>
			<view class="deliveryMain" :animation="animationDelivery">
				<view class="deliveryTitle">
					提货方式
				</view>
				<view class="deliveryType">
					<view class="deliveryItem" v-for="(item,index) in orderList[currentShop].delivery" @click="selDelivery(index)">
						<image v-if="item.type == 0" class="pic" src="../../static/delivery1.png" mode=""></image>
						<image v-else-if="item.type == 1" class="pic" src="../../static/delivery2.png" mode=""></image>
						<text>{{item.name}}</text>
					</view>
				</view>
				<view class="close" @click="hideDeilvery">
					<image class="pic" src="../../static/icon_clone-line.png" mode=""></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	let app = getApp();
	import http from "@/utils/http.js"
	
	var tpOrder
	export default{
		data(){
			return {
				isIphoneX: false, // iphoneX手机
				
				defaultAddress: {}, // 默认地址
				showDeliverys: false, // 显示送货方式
				animationDelivery: {}, // 动画 送货方式
				
				ids: '', // 订单id
				www: http.rootDocument, // 根路径
				
				orderList: [], // 确认订单商品列表
				
				totalNum: '', // 总件数
				totalPrice: '', // 总金额
				
				currentShop: '', // 选中的商品
				
				firstEnter: true,
			}
		},
		onLoad(operation) {
			this.isIphoneX = app.globalData.isIphoneX;
			
			console.log(operation);
			this.ids = operation.ids;
			
			this.getSubmitOrder();
			this.getDefaultAddr();
			
			// 送货方式选择
			var animateDelivery = uni.createAnimation({
				duration: 0,
				timingFunction: 'ease',
			})
			this.animateDelivery = animateDelivery;
			this.animateDelivery.bottom(-450).step();
			this.animationDelivery = this.animateDelivery.export();
		},
		onShow() {
			let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
			let currentPage = pages[pages.length - 1];
			//prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
			let addressId = currentPage.addressId;
			if(addressId){
				this.getAddrInfo(addressId)
			}
		},
		methods:{
			// 获取提交的订单信息
			getSubmitOrder(){
				let that = this;
				http.postJSON('api/cart/queryCartOrderList',{
					ids: this.ids
				},function(res){
					// console.log(res,'提交订单生成的信息');
					that.orderList = res.data;
					
					that.orderList.forEach(item => {
						if(item.delivery.length == 1){
							if(item.delivery[0] == 1){
								that.$set( item, 'delivery', [{name: '快递配送', type: 0}] )
							}else{
								that.$set( item, 'delivery', [{name: '到店自提', type: 1}] )
							}
						}else{
							that.$set( item, 'delivery', [{name: '快递配送', type: 0},{name: '到店自提', type: 1}] )
						}
						that.$set( item, 'selfDelivery', 0 )
						that.$set( item, 'remark', '' )
						
						item.goods.forEach(value => {
							that.$set( value, 'activeCoupon', null )
						})
					})
					tpOrder = that.orderList;
					that.calcDiscount();
					that.calcTOtalPrice()
				})
			},
			
			// 计算优惠价格
			calcDiscount(){
				this.orderList = tpOrder;
				tpOrder = JSON.parse(JSON.stringify(tpOrder));
				let orderList = this.orderList;
				orderList.forEach(item => {
					let discountPrice = 0; // 优惠金额
					item.goods.forEach(val => {
						if(val.activeCoupon){
							let coupon_money = val.coupon[val.activeCoupon].coupon_money;
							
							discountPrice += coupon_money;
							console.log(discountPrice,'优惠券的优惠金额');
						}
					})
					
					item.goods_money -= discountPrice;
					this.$set(item, 'goods_money', item.goods_money);
					this.$set(item, 'discountPrice', discountPrice);
				})
			},
			
			// 计算商品数量和价格
			calcTOtalPrice(){
				let orderList = this.orderList;
				
				let totalPrice = 0; // 总金额
				let totalNum = 0; // 商品数量
				orderList.forEach(item =>{
					let singlePrice = 0; // 单个商家的总金额
					if(item.selfDelivery == 0){ // 配送方式为快递时计算配送费
						singlePrice += Number(item.count_delivery);
						// console.log(singlePrice,'singlePricesinglePrice');
					}
					item.goods.forEach(val => {
						totalNum += val.num
						return
						if(val.activeCoupon){
							let coupon_money = val.coupon[val.activeCoupon].coupon_money;
							singlePrice -= Number(coupon_money);
							// console.log(singlePrice,'singlePricesinglePricesinglePricesinglePricesinglePricesinglePrice');
						}
					})
					singlePrice += Number(item.goods_money);
					
					totalPrice += Number(singlePrice);
					// console.log('总金额' + singlePrice, '单个商品价格' + item.goods_money);
				})
				
				// console.log(totalPrice,'总金额',totalNum,'商品数量',);
				this.totalNum = totalNum;
				this.totalPrice = totalPrice.toFixed(2);
				
			},
			
			
			
			// 获取默认地址
			getDefaultAddr(){
				let that= this;
				http.postJSON('api/address/getDefault',{},function(res){
					// console.log(res,'查询默认地址');
					that.defaultAddress = res.data;
				})
			},
			
			// 获取选中的地址信息
			getAddrInfo(addressId){
				let that = this;
				http.postJSON('api/address/getInfo',{id: addressId},function(res){
					// console.log(res,'查询选中的地址');
					that.defaultAddress = res.data;
				})
			},
			
			// 选择地址
			selAddress(){
				uni.navigateTo({
					url: "../address/userAddress?fromType=selAddr"
				})
			},
			
			// 选择优惠券
			changeCoupon(e,index,idx){
				// console.log(e);
				this.$set( this.orderList[index].goods[idx], 'activeCoupon', e.detail.value );
				this.$set( tpOrder[index].goods[idx], 'activeCoupon', e.detail.value );
				this.calcDiscount();
				this.calcTOtalPrice()
			},
			
			// 显示送货方式
			showDelivery(index){
				this.showDeliverys = true;
				this.currentShop = index;
				var animateDelivery = uni.createAnimation({
					duration: 600,
					timingFunction: 'ease',
				})
				this.animateDelivery = animateDelivery;
				this.animateDelivery.bottom(0).step();
				this.animationDelivery = this.animateDelivery.export();
			},
			
			// 隐藏送货方式
			hideDeilvery(){
				this.showDeliverys = false
				var animateDelivery = uni.createAnimation({
					duration: 500,
					timingFunction: 'ease',
				})
				this.animateDelivery = animateDelivery;
				this.animateDelivery.bottom(-450).step();
				this.animationDelivery = this.animateDelivery.export();
			},
		
			// 选择送货方式
			selDelivery(type){
				let index = this.currentShop;
				console.log(index);
				this.$set(this.orderList[index], 'selfDelivery', type)
				this.$set(tpOrder[index], 'selfDelivery', type)
				this.calcTOtalPrice()
				this.hideDeilvery()
			},
		
		
		
			// 提交订单
			submitOrder(){
				console.log('提交订单');
				
				let order = [];
				let addressId = this.defaultAddress.id;
				let orderList = this.orderList;
				if(!addressId){
					uni.showToast({
						title: '请选择地址',
						icon: 'none'
					})
					return
				}
				
				orderList.forEach(item => {
					let orderItem = {
						store_id: item.store_id,
						delivery: parseInt(item.selfDelivery) + 1,
						remark: item.remark,
						goods: []
					};
					
					item.goods.forEach(val => {
						let goodsItem = {}
						if(val.activeCoupon){
							goodsItem = {
								id: val.id,
								card_id: val.coupon[val.activeCoupon].card_id
							}
						}else{
							goodsItem = {
								id: val.id,
								card_id: 0
							}
						}
						
						orderItem.goods.push(goodsItem)
					})
					
					order.push(orderItem)
				})
				
				console.log(order,'提交的订单信息');
				// return
				http.postJSON('api/cart/submitOrder',{
					order:JSON.stringify(order),
					addressId: addressId
				},function(res){
					console.log(res,'提交订单');
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
										setTimeout(() => { //支付成功跳转
											uni.redirectTo({
												url: './orderOk'
											})
										}, 1200)
									},
									fail(err) {
										uni.showToast({
											title: '取消支付',
											icon: 'none',
											duration: 2000
										})
										setTimeout(() => { //支付成功跳转
											uni.navigateBack()
										}, 2000)
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
		
		},
	}
</script>

<style lang="less">
	page{
		background-color: #F5F5F5;
	}
	
	.confrimMain{
		padding: 40rpx 30rpx 160rpx;
		.address{
			width: 690rpx;
			background: #ffffff;
			border-radius: 16rpx;
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			padding: 30rpx 20rpx;
			.addressIcon{
				width: 68rpx;
				height: 68rpx;
				margin-right: 20rpx;
				flex-shrink: 0;
			}
			.addressContent{
				color: #333;
				font-size: 28rpx;
				margin-right: 90rpx;
				width: 450rpx;
				.userInfo{
					display: flex;
					align-items: flex-end;
					.userName{
						font-size: 36rpx;
						color: #333;
					}
					.userPhone{
						color: #999;
						font-size: 32rpx;
						margin-left: 12rpx;
					}
				}
				.userAddr{
					font-size: 28rpx;
					color: #333;
					height: 70rpx;
					width: 450rpx;
				}
			}
			.selAddr{
				width: 38rpx;
				height: 38rpx;
				flex-shrink: 0;
			}
		}
	}
	
	.goodsOrder{
		width: 690rpx;
		// height: 534rpx;
		background: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 40rpx;
		.goodsOrderMain{
			padding: 20rpx;
			
			.goods{
				display: flex;
				margin-bottom: 46rpx;
				.goodsImg{
					width: 160rpx;
					height: 160rpx;
					border-radius: 20rpx;
					overflow: hidden;
					margin-right: 20rpx;
				}
				.goodsContent{
					.goodsContentTitle{
						display: flex;
						justify-content: space-between;
						.goodsName{
							color: #333;
							font-size: 28rpx;
							height: 70rpx;
							width: 350rpx;
						}
						.goodsPrice{
							color: #666;
							font-size: 28rpx;
						}
					}
					.goodsSpec{
						background: #f5f5f5;
						border-radius: 4rpx;
						padding: 8rpx 12rpx;
						margin-top: 20rpx;
						text{
							color: #999;
							font-size: 28rpx;
							margin-right: 20rpx;
							&:last-child{
								margin-right: 0;
							}
						}
					}
				}
			}
			.goodsOrderItem{
				font-size: 28rpx;
				margin-bottom: 36rpx;
				.goodsOrderInfoTitle{
					color: #333;
					text{
						color: #999;
						margin-left: 20rpx;
						vertical-align: middle;
					}
					image{
						vertical-align: middle;
					}
					.downArrow{
						width: 28rpx;
						height: 28rpx;
						margin-left: 10rpx;
					}
					.couponImg{
						width: 26rpx;
						height: 26rpx;
						margin-right: 16rpx;
					}
					.moreImg{
						width: 36rpx;
						height: 36rpx;
						margin-left: 16rpx;
					}
					.textareaBox{
						width: 650rpx;
						box-sizing: border-box;
						min-height: 120rpx;
						background: #f5f5f5;
						border-radius: 20rpx;
						padding: 20rpx;
						margin-top: 20rpx;
					}
					textarea{
						width: 100%;
						box-sizing: border-box;
						min-height: 80rpx;
						background: #f5f5f5;
					}
				}
				.goodsOrderInfoContent{
					color: #333;
				}
				.sistribution{
					color: #999;
				}
				.coupon{
					color: #FF4646;
				}
			}
		}
		.goodsOrderSubtotal{
			padding: 20rpx;
			text-align: right;
			color: #333;
			font-size: 28rpx;
			border-top: 2rpx solid #E5E5E5;
			text{
				color: #FF2D2D;
			}
			.priceSubtotal{
				margin-left: 10rpx;
			}
		}
	}
	
	.bottomOperation{
		width: 750rpx;
		height: 98rpx;
		background: #ffffff;
		box-shadow: 0rpx 0rpx 8rpx 2rpx rgba(0, 0, 0, 0.25);
		padding: 20rpx 30rpx;
		position: fixed;
		left: 0;
		bottom: 0;
		display: flex;
		height: calc(98rpx + env(safe-area-inset-bottom));
		justify-content: space-between;
		.payMoney{
			font-size: 24rpx;
			color: #666;
			margin-top: 12rpx;
			text{
				color: #FF2D2D;
				margin-left: 10rpx;
			}
			.price{
				font-size: 32rpx;
				margin-left: 0;
			}
		}
		.payBtn{
			width: 180rpx;
			height: 64rpx;
			background: #ff4646;
			border-radius: 32rpx;
			font-size: 28rpx;
			color: #fff;
			text-align: center;
			line-height: 64rpx;
			margin-left: 40rpx;
		}
	}
	
	.mask{
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.6);
		z-index: 999;
	}
	
	.deliveryMain{
		position: fixed;
		left: 0;
		bottom: 0;
		width: 750rpx;
		height: 406rpx;
		background: #ffffff;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
		z-index: 9999;
		padding: 0 30rpx;
		.deliveryTitle{
			font-size: 36rpx;
			color: #333;
			margin: 30rpx 0 40rpx;
			text-align: center;
		}
		.deliveryItem{
			width: 690rpx;
			height: 116rpx;
			background: #ffffff;
			box-shadow: 0rpx 0rpx 12rpx 0rpx rgba(0,0,0,0.12); 
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 28rpx;
			image{
				width: 80rpx;
				height: 80rpx;
				margin-right: 20rpx;
			}
			text{
				color: #333;
				font-size: 36rpx;
			}
			&:last-child{
				margin-bottom: 0;
			}
		}
		.close{
			position: absolute;
			right: 30rpx;
			top: 20rpx;
			width: 40rpx;
			height: 40rpx;
		}
	}
</style>
