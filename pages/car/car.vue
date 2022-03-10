<template>
	<view class="carRoot">
		<!-- 顶部 -->
		<view class="carTop baseflex" v-if="!empty">
			<view class="buyNum">
				购买数量 <text>{{count}}</text>
			</view>
			<view class="topEdit" @click="editCart">
				{{edit ? '取消' : '管理'}}
			</view>
		</view>

		<!-- 购物车主体 -->
		<view class="carMain" v-if="!empty">
			<view class="carShop" v-for="(item,index) in cartList" :key="index">
				<view class="shopName yuanChecked" @click="check('shop',index)">
					<image v-if="item.checked" src="../../static/icon_checked.png" mode=""></image>
					<image v-else src="../../static/icon_unchecked.png" mode=""></image>
					<text>{{item.store_name}}</text>
				</view>
				<view class="shopGoods" v-for="(value,idx) in item.goods" :key="idx">
					<view class="yuanChecked" @click="check('item',index,idx)">
						<image v-if="value.is_select == 1" src="../../static/icon_checked.png" mode=""></image>
						<image v-else src="../../static/icon_unchecked.png" mode=""></image>
					</view>
					<view class="goodsImg">
						<image class="pic" :src="www + value.goods_icon" mode=""></image>
					</view>
					<view class="goodsInfo">
						<view class="goodsName multiHide">
							{{value.goods_name}}
						</view>
						<view class="goodsSpec singleHide" @click="showSpec(index,idx)">
							<!-- <text>颜色:蓝色</text>
							<text>尺寸:1.2m*1m</text> -->
							<text>{{value.goods_spec_title}}</text>
							<image src="../../static/icon_arrow-downGray.png" mode=""></image>
						</view>
						<view class="goodsOperation baseflex">
							<view class="goodsPrice">
								￥<text>{{value.goods_price}}</text>
							</view>
							<view class="goodsNumOperation baseflex">
								<text class="operationBtn sub" @click="subNum(index,idx)">-</text>
								<input type="number" class="goodsNum" :value="value.num"
									@blur="changeNum(index,idx,$event)" />
								<text class="operationBtn add" @click="addNum(index,idx)">+</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部 -->
		<view class="carBottom baseflex" v-if="!empty">
			<view class="btnLeft" @click="check('all')">
				<image v-if="allChecked" src="../../static/icon_checked.png" mode=""></image>
				<image v-else src="../../static/icon_unchecked.png" mode=""></image>
				<text>全选</text>
			</view>
			<view class="btnRight" v-if="!edit">
				<view class="carPrice">
					合计：<text>￥</text><text class="carMoney">{{total}}</text>
				</view>
				<view class="btnPay" @click="settlement">
					结算
				</view>
			</view>
			<view class="btnRight" v-else>
				<view class="goFollow">
					加入收藏
				</view>
				<view class="btnPay" @click="delGoods">
					删除
				</view>
			</view>
		</view>

		<!-- 购物车为空 -->
		<view class="carNull" v-else>
			<image src="../../static/car_null.png" mode=""></image>
			<view>购物车为空</view>
		</view>

		<luPopupWrapper ref="luPopupWrapper" :type="type" :transition="transition" :backgroundColor="backgroundColor"
			:active="active" :height="height" :width="width" :popupId="popupId" :maskShow="maskShow"
			:maskClick="maskClick" :closeCallback="closeCallback">
			<scroll-view scroll-y="true" class="specsExplain" id="specs">
				<view class="specGoodsInfo">
					<view class="specGoodsImg" v-if="cartList[activeShopSpec]">
						<image class="pic" :src="www + cartList[activeShopSpec].goods[activegoodsSpec].goods_icon" mode="aspectFill"></image>
					</view>
					<view class="specGoodsContent">
						<view class="specGoodsName singleHide">
							{{cartList[activeShopSpec].goods[activegoodsSpec].goods_name}}
						</view>
						<view class="specGoodsPrice" v-if="!activeSpec && activeSpec!= 0">
							￥ <text>{{goodsSpec[0].goods_price}}</text> 起
						</view>
						<view class="specGoodsPrice" v-else>
							￥ <text>{{goodsSpec[activeSpec].goods_price}}</text>
						</view>
						<view class="specGoodsSpecs multiHide">
							{{activeSpec == 0 || activeSpec ? goodsSpec[activeSpec].goods_spec_title : '请选择口味'}}
						</view>
					</view>
				</view>
				<view class="goodsSpecAll">
					<view class="specTitle">
						口味
					</view>
					<view class="selGoodsSpec">
						<view 
							:class="(activeSpec == 0 || activeSpec) && activeSpec === index ? 'goodsSpecItem activeSpecs' : 'goodsSpecItem'" 
							v-for="(item,index) in goodsSpec" 
							:key="index"
							@click="changeSpec(index)"
						>{{item.goods_spec_title}}</view>
					</view>
				</view>
				<view class="buyOperation" style="margin-top: 20rpx;" @click="buyClick">
					确定
				</view>
				<view class="close" @click="close">
					<image class="pic" src="../../static/icon_clone-line.png" mode=""></image>
				</view>
			</scroll-view>
		</luPopupWrapper>
	</view>
</template>

<script>
	let app = getApp();
	import uniNumberBox from '@/components/uni-number-box.vue'
	import luPopupWrapper from "../../components/lu-popup-wrapper/lu-popup-wrapper.vue";

	import http from "@/utils/http.js"
	export default {
		components: {
			uniNumberBox,
			luPopupWrapper
		},
		data() {
			return {
				isIphoneX: false, // iphoneX手机
				type: "bottom", // left right top bottom center
				transition: "slider", //none slider fade
				backgroundColor: '#FFF',
				active: false,
				height: "auto",
				width: "100%",
				popupId: 1,
				maskShow: true,
				maskClick: true,

				www: http.rootDocument, // 根路径

				empty: true, // 购物车数据为空

				allChecked: false, // 全选
				total: 0, // 总价格
				count: 0, // 购买数量

				cartList: [], // 购物车列表

				goodsSpec: [], // 商品规格
				activeSpec: null, // 选中的规格
				
				activeShopSpec: '', // 选中的规格所属商家
				activegoodsSpec: '', // 选中的规格所属商品

				buyNum: 1, // 购买数量
				edit: false, // 管理购物车
			}
		},
		onLoad() {
			
			this.isIphoneX = app.globalData.isIphoneX;

		},
		onShow() {
			let utoken = uni.getStorageSync('utoken');
			if(utoken){
				this.getCartList();
			}
		},
		methods: {
			// 获取购物车列表
			getCartList() {
				let that = this;
				uni.showLoading()
				http.postJSON('api/cart/queryCartGoodsList', {}, function(res) {
					console.log(res, '购物车列表');
					uni.hideLoading()
					that.cartList = res.data;
					if (res.data.length > 0) {
						that.empty = false;
						that.isChecked()
						that.calcTotal()
					} else {
						that.empty = true;
					}
					
				})
			},

			// 判断选中状态
			isChecked() {
				this.allChecked = !this.cartList.some(item => { // 返回值取反
					item.checked = !item.goods.some(val => { // 返回值取反
						// 循环商家中的所有商品，如果出现未选中，有则返回true，否则返回false
						return parseInt(val.is_select) === 0
					})
					// 循环所有的商家，查看是否有未选中，有则返回true，否则返回false
					return item.checked == false
				})
			},



			// 减少商品数量
			subNum(index, idx) {
				let currentGoods = this.cartList[index].goods[idx];
				let num = currentGoods.num;
				if (num <= 1) {
					return
				} else {
					num -= 1;
					currentGoods.num = num;
					this.calcTotal()
					this.changeGoodsNum(currentGoods.goods_id, currentGoods.spec_id, currentGoods.num)
				}
			},

			// 增加商品数量
			addNum(index, idx) {
				let currentGoods = this.cartList[index].goods[idx];
				let num = currentGoods.num;
				let stock = 0; // 库存
				currentGoods.spec.forEach(item => {
					if(item.id == currentGoods.spec_id){
						stock = item.goods_num
					}
				})
				
				if (num < stock) {
					num += 1;
					currentGoods.num = num;
				} else {
					currentGoods.num = stock
				}
				this.calcTotal()
				this.changeGoodsNum(currentGoods.goods_id, currentGoods.spec_id, currentGoods.num)
			},

			// 输入商品数量
			changeNum(index, idx, event) {
				var val = event.detail.value;
				let currentGoods = this.cartList[index].goods[idx];
				let stock = 0; // 库存
				currentGoods.spec.forEach(item => {
					if(item.id == currentGoods.spec_id){
						stock = item.goods_num
					}
				})
				
				if(val <= 0){
					val = 1
				}else if (val < stock) {
					val = parseInt(val.replace(/[^\d]/g, ''))
				} else {
					val = stock
				}
				this.cartList[index].goods[idx].num = val;
				this.calcTotal()
				this.changeGoodsNum(currentGoods.goods_id, currentGoods.spec_id, currentGoods.num)
			},

			// 更改购物车商品数量
			changeGoodsNum(goods_id,spec_id,num){
				http.postJSON('api/cart/editCartNum',{
					goods_id: goods_id,
					spec_id: spec_id,
					num: num
				},function(res){
					console.log(res,'更改商品数量');
				})
			},
				

			// 选中商品
			check(type, index, idx) {
				let idsContent = []; // 存放id的容器
				if (type == 'item') { // 点击单个商品的选中状态
					console.log('点击单个商品');
					let is_select = this.cartList[index].goods[idx].is_select;
					is_select == 0 ? (is_select = 1) : (is_select = 0);
					this.cartList[index].goods[idx].is_select = is_select;
					
					let id = this.cartList[index].goods[idx].id;
					idsContent.push(id)
					this.changeCheck(idsContent.join(','),is_select)
				} else if (type == 'shop') {
					console.log('点击商家的全部商品');
					let selectShop = this.cartList[index];
					selectShop.checked = !selectShop.checked;
					
					let is_select = selectShop.checked ? 1 : 0;
					
					selectShop.goods.forEach(item => {
						item.is_select = is_select ? 1 : 0;
						idsContent.push(item.id)
					})
					this.changeCheck(idsContent.join(','),is_select)
				} else {
					console.log('点击全选');
					this.allChecked = !this.allChecked;
					this.cartList.forEach(item => {
						item.checked = this.allChecked;
						item.goods.forEach(val => {
							val.is_select = this.allChecked;
							idsContent.push(val.id)
						})
					})
					let is_select = this.allChecked ? 1 : 0;
					this.changeCheck(idsContent.join(','),is_select)
					this.calcTotal()
					// this.isChecked()
					return
				}

				this.isChecked()
				this.calcTotal()
			},
			
			// 改变购物车的选中状态
			changeCheck(arr,is_select){
				http.postJSON('api/cart/editSelect',{
					ids: arr,
					is_select: is_select
				},function(res){
					// console.log(res,'改变商品选中状态');
				})
			},

			// 计算总价
			calcTotal() {
				let list = this.cartList;
				if (list.length === 0) {
					this.empty = true;
					return;
				}
				let total = 0;
				let count = 0;

				list.forEach(item => {
					item.goods.forEach(val => {
						if (val.is_select === 1) {
							// console.log('我进入了',item.shopname);
							total += val.goods_price * val.num
							count += val.num
						} 
					})
				})

				// this.allChecked = checked;
				this.total = Number(total.toFixed(2));
				this.count = Number(count)
			},

			// 管理购物车
			editCart() {
				this.edit = !this.edit
			},

			// 删除购物车商品
			delGoods() { // 根据索引删除  后续可根据索引查找id
				let list = this.cartList;
				
				let idsContent = []; //存放id的容器

				var i = list.length;
				while (i--) {
					if (list[i].checked === true) {
						
						for (var j = list[i].goods.length - 1; j >= 0; j--) {
							idsContent.push(list[i].goods[j].id);
						}
						list.splice(i, 1);
					} else {
						for (var j = list[i].goods.length - 1; j >= 0; j--) {
							if (list[i].goods[j].is_select === 1) {
								
								idsContent.push(list[i].goods[j].id);
								list[i].goods.splice(j, 1);
							}
						}
					}
				}
				this.del(idsContent.join(','));
				this.calcTotal()
			},
			
			// 删除商品
			del(arr){
				http.postJSON('api/cart/delCartGoods',{
					cartIds: arr
				},function(res){
					console.log(res,'删除购物车商品');
				})
			},




			show: function() {
				uni.hideTabBar({
					animation: false
				})
				this.$refs.luPopupWrapper.show();
			},
			close: function() {
				setTimeout(function() {
					uni.showTabBar({
						animation: false
					})
				}, 200)
				this.$refs.luPopupWrapper.close();
			},
			closeCallback: function() {
				console.log("关闭后回调");
				uni.showTabBar({
					animation: false
				})
			},

			// 立即购买
			nowBuyGoods() {
				this.showGoods = false
				// 显示商品
				var animateGoods = uni.createAnimation({
					duration: 500,
					timingFunction: 'ease',
				})
				this.animateGoods = animateGoods;
				this.animateGoods.bottom(-800).step();
				this.animationGoods = this.animateGoods.export();

				if (this.goodsSpec.length > 0) {
					this.showSpec()
				} else {
					setTimeout(function() {
						uni.showTabBar({
							animation: false
						})
						uni.navigateTo({
							url: "../confirmOrder/confirmOrder"
						})
					}, 200)
				}
			},

			// 切换选中的规格
			changeSpec(idx) {
				this.activeSpec = idx;
			},

			// 购买商品
			showSpec(index,idx) {
				let currentGoods = this.cartList[index].goods[idx];
				
				this.goodsSpec = currentGoods.spec;
				this.activeShopSpec = index;
				this.activegoodsSpec = idx;
				
				currentGoods.spec.forEach((item,index) => {
					if(item.id == currentGoods.spec_id){
						this.activeSpec = index
					}
				})
				
				this.show();

			},

			// 修改规格
			buyClick() {
				let lgn = this.goodsSpec.length;
				if (lgn == 1) {
					console.log(this.activeSpec);
				}
				
				this.close()
				setTimeout(function() {
					uni.showTabBar({
						animation: false
					})
					
				}, 200)
				if (lgn == 1) {
					console.log(this.activeSpec);
					return
				}
				
				let currentGoods = this.cartList[this.activeShopSpec].goods[this.activegoodsSpec];
				let spec_id_new = currentGoods.spec[this.activeSpec].id;
				
				http.postJSON('api/cart/editCardSpec',{
					goods_id: currentGoods.goods_id,
					spec_id: currentGoods.spec_id,
					spec_id_new: spec_id_new
				},function(res){
					console.log(res,'修改商品规格');
					uni.showToast({
						title: "修改规格成功",
						icon: "none"
					})
				})
				this.getCartList()
			},
		
		
			
			
			// 提交订单
			settlement(){
				let idsContent = []; // id容器
				let cartList = this.cartList;
				
				cartList.forEach(item => {
					if(item.checked){
						item.goods.forEach(val => {
							idsContent.push(val.id)
						})
					}else{
						item.goods.forEach(single => {
							if(single.is_select == 1){
								idsContent.push(single.id)
							}
						})
					}
					
				})
				
				console.log(idsContent.join(','));
				uni.navigateTo({
					url: "../confirmOrder/confirmOrder?ids=" + idsContent.join(',')
				})
			},
		},
	}
</script>

<style lang="less">
	page {
		background-color: #f5f5f5;
	}

	.mycontent {
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
		overflow: scroll;
	}

	.carTop {
		background-color: #fff;
		padding: 20rpx 30rpx;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
		width: 100%;
		height: 76rpx;

		.buyNum {
			font-size: 28rpx;
			color: #333;

			text {
				color: #FF0000;
				margin-left: 10rpx;
			}
		}

		.topEdit {
			width: 80rpx;
			height: 36rpx;
			line-height: 32rpx;
			text-align: center;
			border: 2rpx solid #ff2d2d;
			border-radius: 8rpx;
			font-size: 24rpx;
			color: #333;
		}
	}

	.carBottom {
		width: 750rpx;
		height: 104rpx;
		background: #ffffff;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 99;
		padding: 20rpx 30rpx;

		.btnLeft {
			display: flex;
			align-items: center;

			image {
				width: 32rpx;
				height: 32rpx;
				margin-right: 20rpx;
			}

			text {
				color: #999;
				font-size: 28rpx;
			}
		}

		.btnRight {
			display: flex;
			align-items: center;

			.carPrice {
				font-size: 20rpx;
				color: #666;
				margin-right: 20rpx;

				text {
					color: #FF2D2D;
				}

				.carMoney {
					font-size: 32rpx;
				}
			}

			.btnPay {
				width: 136rpx;
				height: 64rpx;
				line-height: 64rpx;
				text-align: center;
				background: #ff4646;
				border-radius: 32rpx;
				color: #fff;
				font-size: 28rpx;
			}

			.goFollow {
				width: 192rpx;
				height: 64rpx;
				border: 2rpx solid #ff2d2d;
				border-radius: 34rpx;
				color: #ff2d2d;
				font-size: 28rpx;
				text-align: center;
				line-height: 64rpx;
				margin-right: 20rpx;
			}
		}
	}

	.yuanChecked {
		display: flex;
		align-items: center;

		image {
			width: 32rpx;
			height: 32rpx;
			margin-right: 20rpx;
		}

		text {
			color: #000;
			font-size: 28rpx;
		}
	}

	.carMain {
		padding: 20rpx 30rpx;
		background-color: #fff;
		padding-top: 76rpx;
		padding-bottom: 104rpx;

		.carShop {
			padding: 20rpx 0;

			.shopName {
				margin-bottom: 22rpx;
			}
		}
	}

	.shopGoods {
		display: flex;
		align-items: center;
		padding: 20rpx 0;

		.goodsImg {
			width: 200rpx;
			height: 200rpx;
			border-radius: 8rpx;
			overflow: hidden;
			margin-right: 20rpx;
		}

		.goodsInfo {
			width: 418rpx;

			.goodsName {
				width: 420rpx;
				height: 70rpx;
				font-size: 28rpx;
				color: #333333;
			}

			.goodsSpec {
				height: 44rpx;
				line-height: 44rpx;
				background: #f5f5f5;
				border-radius: 4rpx;
				color: #999;
				font-size: 28rpx;
				position: relative;
				padding-right: 42rpx;
				padding-left: 12rpx;
				margin-top: 12rpx;

				text {
					margin-right: 20rpx;
				}

				image {
					width: 20rpx;
					height: 20rpx;
					position: absolute;
					right: 18rpx;
					top: 50%;
					transform: translateY(-50%);
				}
			}

			.goodsOperation {
				margin-top: 32rpx;

				.goodsPrice {
					font-size: 20rpx;
					color: #FF2D2D;

					text {
						font-size: 32rpx;
					}
				}

				.goodsNumOperation {
					justify-content: flex-start;
					position: relative;

					text {
						display: inline-block;
						text-align: center;
						height: 40rpx;
						line-height: 40rpx;
						width: 40rpx;
					}

					.operationBtn {
						width: 40rpx;
						background: #f2f2f2;
						border-radius: 4rpx;
						font-size: 32rpx;
						font-weight: 600;
					}

					.goodsNum {
						min-width: 60rpx;
						max-width: 80rpx;
						text-align: center;
						color: #333;
						font-size: 28rpx;
					}
				}
			}
		}
	}

	.carNull {
		margin: 28% auto 0;
		text-align: center;

		image {
			width: 600rpx;
			height: 480rpx;
		}

		text {
			color: #333;
			font-size: 36rpx;
		}
	}

	.specsExplain {
		width: 100%;
		background: #ffffff;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
		padding: 40rpx 30rpx 20rpx;
		box-sizing: border-box;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

		.specGoodsInfo {
			display: flex;
			align-items: center;

			.specGoodsImg {
				width: 200rpx;
				height: 200rpx;
				border-radius: 8rpx;
				overflow: hidden;
				margin-right: 20rpx;
				flex-shrink: 0;
			}

			.specGoodsContent {
				flex-shrink: 0;
				max-width: 400rpx;
			}

			.specGoodsName {
				color: #333;
				font-size: 32rpx;
			}

			.specGoodsPrice {
				color: #FF2D2D;
				font-size: 28rpx;
				margin: 14rpx 0;

				text {
					font-size: 42rpx;
					margin: 0 4rpx;
				}
			}

			.specGoodsSpecs {
				color: #999;
				font-size: 28rpx;
				height: 76rpx;
			}
		}

		.goodsSpecAll {
			margin-top: 40rpx;

			.specTitle {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 20rpx;
			}

			.selGoodsSpec {
				width: 100%;
				height: auto;
				display: flex;
				align-items: center;
				flex-wrap: wrap;

				.goodsSpecItem {
					background: #e5e5e5;
					border-radius: 6rpx;
					padding: 12rpx;
					font-size: 28rpx;
					color: #666;
					margin-right: 20rpx;
					margin-bottom: 20rpx;
				}

				.activeSpecs {
					color: #fff;
					background-color: #FF2D2D;
				}
			}
		}

		.buyGoodsNum {
			margin: 50rpx 0 40rpx;

			.changeNum {
				display: flex;
				align-items: center;
			}

			.numBtn {
				width: 40rpx;
				height: 40rpx;
				background: #f2f2f2;
				border-radius: 4rpx;
				font-size: 32rpx;
				font-weight: 600;
				line-height: 40rpx;
				text-align: center;
			}

			input {
				height: 40rpx;
				max-width: 84rpx;
				text-align: center;
				font-size: 28rpx;
				color: #333;
			}
		}

		.buyOperation {
			width: 690rpx;
			height: 72rpx;
			background: #ff2d2d;
			border-radius: 10rpx;
			line-height: 72rpx;
			text-align: center;
			font-size: 28rpx;
			color: #fff;
		}

		.close {
			position: absolute;
			right: 30rpx;
			top: 20rpx;
			width: 40rpx;
			height: 40rpx;
		}
	}

	.mask {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 999;
		width: 100%;
		height: 100%;
	}
</style>
