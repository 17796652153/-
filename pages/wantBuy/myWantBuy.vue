<template>
	<view class="">
		<!-- tabs -->
		<view class="headNavigation">
			<view :class="activeNav == 0 ? 'navItem activeNav' : 'navItem'" @click="changeNav(0)">我的发布</view>
			<view :class="activeNav == 1 ? 'navItem activeNav' : 'navItem'" @click="changeNav(1)">我的收藏</view>
		</view>
		
		<!-- 我的发布 / 我的收藏 -->
		<view class="wantBuyMain" v-if="activeNav == 0">
			<block v-if="repairList.length > 0">
				<view class="wantBuy" v-for="(item,index) in repairList" :key="index" @click="seeRepairDetail(item.id)">
					<view class="wantBuyContent baseflex">
						<swiper class="wantBuyImg" :circular="true" :indicator-dots="item.imageList.length > 1">
							<swiper-item v-for="(val,idx) in item.imageList" :key="idx">
								<view class="swiper-item">
									<image class="pic" :src="www + val" mode="aspectFill"></image>
								</view>
							</swiper-item>
						</swiper>
						<view class="wantBuyInfo">
							<view class="wantBuyUser">
								<view class="userImg">
									<image class="pic" :src="item.head_img" mode=""></image>
								</view>
								<view class="userName singleHide">
									{{item.nick_name}}
								</view>
							</view>
							<view class="describe multiHide">
								{{item.content}}
							</view>
							<view class="userAddress">
								<view class="addrImg">
									<image class="pic" src="../../static/icon_location.png" mode=""></image>
								</view>
								<view class="address multiHide">
									{{item.address}}
								</view>
							</view>
		
						</view>
					</view>
					<view class="wantBuyOperation">
						<view class="del" @click.stop="delRepair(item.id,index)">
							删除
						</view>
						<view class="edit" @click.stop="editRepair(item.id)">
							修改
						</view>
					</view>
				</view>
			</block>
			<!-- 未发布 -->
			<view class="repairNull" v-else>
				<image src="../../static/repairNull.png" mode=""></image>
				<view class="nullTips">
					您还未发布求购信息
				</view>
			</view>
		</view>
		
		<view class="wantBuyMain" v-if="activeNav == 1">
			<block v-if="collectionList.length > 0">
				<view class="wantBuy" v-for="(item,index) in collectionList">
					<view class="wantBuyContent baseflex" @click="seeRepairDetail(item.data.id)">
						<swiper class="wantBuyImg" :circular="true" :indicator-dots="item.data.collectImageList.length > 1">
							<swiper-item v-for="(val,idx) in item.data.collectImageList" :key="idx">
								<view class="swiper-item">
									<image class="pic" :src="www + val" mode="aspectFill"></image>
								</view>
							</swiper-item>
						</swiper>
						<view class="wantBuyInfo">
							<view class="baseflex">
								<view class="wantBuyUser">
									<view class="userImg">
										<image class="pic" :src="item.data.head_img" mode=""></image>
									</view>
									<view class="userName singleHide">
										{{item.data.nick_name}}
									</view>
								</view>
								<view class="call">
									<image class="pic" src="../../static/icon_call.png" mode=""></image>
								</view>
							</view>
							<view class="describe multiHide">
								{{item.data.content}}
							</view>
							<view class="userAddress">
								<view class="addrImg">
									<image class="pic" src="../../static/icon_location.png" mode=""></image>
								</view>
								<view class="address multiHide">
									{{item.data.address}}
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
		
			<!-- 未收藏 -->
			<view class="repairNull" v-else>
				<image src="../../static/followNull.png" mode=""></image>
				<view class="nullTips">
					暂无收藏信息
				</view>
			</view>
		</view>
		
		<!-- 弹窗  删除 -->
		<showModel
			:showModel="showCouponModel"
			:title="'是否删除该信息'" 
			@cancel="cancel" 
			@confirm="confirmDel"
		></showModel>
		
		<!-- 发布 -->
		<view class="repairFixed" v-if="activeNav == 0" @click="repair">
			<image class="pic" src="../../static/release.png" mode=""></image>
		</view>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	import showModel from "../../components/showModel/showModel.vue"
	export default {
		data(){
			return {
				activeNav: 0, // 选中的头部导航
				www: http.rootDocument,
				
				repairList: [],
				page: 1,
				last_page: 1,
				repairTotal: 0,
				showCouponModel: false,
				
				collectionList: [],
				collTotal: 0,
				
				currentId: '', // 选中的id；
				currentIndex: '', // 选中的索引
				
				hidePage: false, // 离开页面
			}
		},
		onShow() {
			if(this.activeNav == 0){
				this.getMyRepair()
			}else{
				this.getMyCollection()
			}
		},
		methods:{
			// 获取我发布的
			getMyRepair() {
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				http.postJSON('api/message/queryUserMessage', {
					type: 2,
					page: this.page
				}, function(res) {
					// console.log(res,'我发布的信息');
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.repairList = that.repairList.concat(res.data.data);
					that.repairTotal = res.data.total;
			
					that.repairList.forEach(item => {
						item.imageList = item.message_img.split(',');
					})
				})
			},
			
			// 获取我收藏的
			getMyCollection(){
				let that = this;
				if(this.hidePage){
					this.hidePage = false;
					return
				}
				http.postJSON('api/user/getUserLike',{
					type: 5,
					page: this.page
				},function(res){
					console.log(res,'获取我收藏的列表');
					
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.collTotal = res.data.total;
					that.collectionList = that.collectionList.concat(res.data.data);
					
					that.collectionList.forEach(item => {
						item.data.collectImageList = item.data.message_img.split(',');
					})
				})
			},
			
			delRepair(id, index) {
				this.currentId = id;
				this.currentIndex = index;
				this.showCouponModel = true;
			},
			
			cancel(){
				this.showCouponModel = false;
			},
			
			confirmDel(){
				this.showCouponModel = false;
				let that = this;
				http.postJSON('api/message/delMessage', {
					id: this.currentId
				}, function(res) {
					console.log(res, '删除求购');
					if (res.code == 200) {
						uni.showToast({
							title: '删除成功',
							icon: 'none'
						})
						that.repairList.splice(that.currentIndex, 1);
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			
			editRepair(id){
				uni.navigateTo({
					url: './repairWantBuy?id=' + id
				})
				this.page= 1;
				this.repairList = [];
			},
			
			
			seeRepairDetail(id){
				console.log('离开页面');
				this.hidePage = true;
				uni.navigateTo({
					url: './wantBuyDetail?id=' + id
				})
			},
			
			// 切换头部导航
			changeNav(idx) {
				this.activeNav = idx
				this.page = 1;
				if(this.activeNav == 0){
					this.repairList = [];
					this.getMyRepair();
				}else{
					this.collectionList = [];
					this.getMyCollection();
				}
			},
			
			// 发布
			repair(){
				uni.navigateTo({
					url: "./repairWantBuy"
				})
				this.page= 1;
				this.repairList = [];
			},
		},
		onReachBottom() {
			console.log('触底了');
			if (this.page < this.last_page) {
				this.page++;
				if(this.activeNav == 0){
					this.getMyRepair()
				}else{
					this.getMyCollection()
				}
			} else {
				uni.showToast({
					title: '没有更多了',
					icon: 'none'
				})
			}
		},
		onPullDownRefresh() {
			console.log('下拉刷新了');
			this.page = 1;
			if(this.activeNav == 0){
				this.repairList = [];
				this.getMyRepair();
			}else{
				this.collectionList = [];
				this.getMyCollection();
			}
			uni.stopPullDownRefresh();
		},
	}
</script>

<style lang="less">
	page{
		background-color: #f5f5f5;
	}
	
	.headNavigation {
		width: 750rpx;
		height: 92rpx;
		opacity: 1;
		background: #FFEBEB;
		display: flex;
	}
	
	.navItem {
		width: 50%;
		text-align: center;
		line-height: 92rpx;
		color: #999;
		font-size: 32rpx;
		position: relative;
	}
	
	.activeNav {
		color: #FF2D2D;
	}
	
	.activeNav::after {
		content: "";
		width: 32rpx;
		height: 8rpx;
		opacity: 1;
		background: #FF2D2D;
		border-radius: 12rpx;
		position: absolute;
		left: 50%;
		bottom: 8rpx;
		transform: translateX(-50%);
	}
	
	.wantBuyMain{
		padding: 20rpx 30rpx 200rpx;
		.wantBuy{
			width: 690rpx;
			background: #ffffff;
			border-radius: 20rpx;
			box-shadow: 0rpx 0rpx 12rpx 0rpx rgba(0,0,0,0.10); 
			padding: 20rpx;
			margin-bottom: 20rpx;
			.wantBuyImg{
				width: 300rpx;
				height: 300rpx;
				flex-shrink: 0;
				border-radius: 20rpx;
				overflow: hidden;
				margin-right: 20rpx;
				swiper-item{
					width: 100%;
					height: 100%;
					.swiper-item{
						width: 100%;
						height: 100%;
					}
				}
			}
			.wantBuyInfo{
				flex-shrink: 0;
				.wantBuyUser{
					display: flex;
					align-items: center;
					margin: 20rpx 0;
					.userImg{
						width: 68rpx;
						height: 68rpx;
						overflow: hidden;
						border-radius: 50%;
						margin-right: 20rpx;
					}
					.userName{
						font-size: 36rpx;
						color: #333;
						max-width: 180rpx;
					}
					
				}
				.call{
					width: 32rpx;
					height: 32rpx;
				}
				.describe{
					font-size: 28rpx;
					color: #333;
					margin-bottom: 30rpx;
					width: 336rpx;
					height: 76rpx;
				}
				.userAddress{
					display: flex;
					.addrImg{
						width: 28rpx;
						height: 28rpx;
						margin-right: 20rpx;
					}
					.address{
						font-size: 28rpx;
						color: #333;
						width: 280rpx;
						height: 80rpx;
					}
				}
			}
			.wantBuyOperation{
				display: flex;
				align-items: center;
				justify-content: flex-end;
				font-size: 24rpx;
				margin-top: 20rpx;
				.del{
					color: #999;
					margin-right: 10rpx;
				}
				.edit{
					color: #FF2D2D;
				}
			}
		}
	}
	
	.repairFixed{
		width: 100rpx;
		height: 100rpx;
		position: fixed;
		right: 30rpx;
		bottom: 80rpx;
	}
	
	.repairNull{
		margin: 80rpx auto;
		text-align: center;
		image{
			width: 600rpx;
			height: 600rpx;
		}
		.nullTips{
			font-size: 36rpx;
			color: #999;
			text-align: center;
		}
	}
</style>
