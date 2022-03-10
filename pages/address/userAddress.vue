<template>
	<view class="">
		<scroll-view scroll-y="true" style="position:absolute;top:0;left:0;height:100%;">
		  <block v-if="addressList.length==0 || addressList==undefined || addressList=='undefined'">
		    <view style="margin-top:80rpx;text-align:center;color:#999;font-size:36rpx;">暂无数据</view>
		  </block>
		  <view class="address-container" v-else>
		    <view class="address-item box" v-for="(item, index) in addressList" :key="index" @click="checkedAddr(item.id)">
		      <view class="item-address-dedail">{{item.name}} {{item.mobile}}</view>
		      <view class="item-person">{{item.province}} {{item.city}} {{item.district}} {{item.address}}</view>
		      <view class="item-operation">
		        <view class="operation-choose" @click.stop="setDefault(item.id, index)">
		          <view class="operation-image">
		            <image class="pic" v-if="item.is_default == 1" src="../../static/icon_sel.png"></image>
		            <image class="pic" v-else src="../../static/icon_unSel.png"></image>
		          </view>
		          <view class="choose-txt">默认地址</view>
		        </view>
		        <view class="item-operation-right">
		          <view class="operation-edit" @click.stop="editAddr(item.id)">
		            <view class="edit-txt">编辑</view>
		          </view>
		          <view class="operation-delete" @click.stop="delAddr(item.id,index)">
		            <view class="delete-txt">删除</view>
		          </view>
		        </view>
		      </view>
		    </view>
		  </view>
		</scroll-view>
		
		
		<!-- 添加按钮 -->
		<view class="btn" @click="jumpAddAddress">添加收货地址</view>
		
		<!-- end添加按钮 -->
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return{
				addressList: [], // 地址列表
				fromType: '', // 从哪跳过来的
				
				page: 1, // 当前页
				last_page: 1, // 最后一页
				total: 0, // 总条数
			}
		},
		onLoad(option) {
			this.fromType = option.fromType;
		},
		onShow() {
			this.getUserAddressList()
		},
		methods:{
			// 获取地址列表
			getUserAddressList(){
				let that = this;
				http.postJSON('api/address/queryList',{
					page: this.page
				},function(res){
					console.log(res,'地址列表');
					that.addressList = res.data.data;
					that.page = res.data.current_page;
					that.last_page = res.data.last_page;
					that.total = res.data.total;
				})
			},
			
			
			// 设为默认
			setDefault(id,index){
			  let that = this;
			  let addressList = this.addressList;
			  addressList.forEach((item,idx) => {
				  if(idx == index){
					  item.is_default = 1
				  }else{
					  item.is_default = 0
				  }
			  })
			  
			  http.postJSON('api/address/setDefault',{
				  id: id
			  },function(res){
				  console.log(res,'设为默认地址');
				  // that.getUserAddressList()
			  })
			},
			// 跳转添加地址
			jumpAddAddress(){
			  wx.navigateTo({
			    url: './addAddress',
			  })
			},
			
			// 删除地址
			delAddr(id,index){
				let that = this;
				uni.showModal({
					title: '是否删除地址',
					success(res) {
						console.log(res,'点击成功');
						if(res.confirm){
							http.postJSON('api/address/delInfo',{
								id: id
							},function(res){
								console.log(res);
								if(res.code == 200){
									uni.showToast({
										title: '删除成功',
										icon: 'none'
									})
									that.addressList.splice(index,1)
								}else{
									uni.showToast({
										title: res.msg,
										icon: 'none'
									})
								}
							})
						}
					},
				})
			},
			
			// 修改地址
			editAddr(id){
				uni.navigateTo({
					url: "./addAddress?id=" + id
				})
			},
			
			
			// 选择地址
			checkedAddr(addressId){
				if(this.fromType == 'selAddr'){
					let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
					let prevPage = pages[pages.length - 2];
					//prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
					prevPage.addressId = addressId;
					
					uni.navigateBack()
				}
				
				
			},
		},
		onReachBottom(){
			console.log('触底了');
			if(this.page < this.last_page){
				this.page ++;
				this.getUserAddressList()
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
			this.addressList = [];
			this.getUserAddressList();
			uni.stopPullDownRefresh();
		},
	}
</script>

<style>
	page{
	  background-color: #F5F5F5;
	}
	
	.address-container{
	  width: 686rpx;
	  margin: 32rpx;
	  padding-bottom: 190rpx;
	}
	.address-item{
	  width: 686rpx;
	  padding: 16rpx 32rpx 24rpx;
	  margin-bottom: 24rpx;
	  background-color: #fff;
	  border-radius: 16rpx;
	}
	.item-address-dedail{
	  width: 450rpx;
	  height: 80rpx;
	  line-height: 80rpx;
	  font-weight: 500;
	  text-overflow: -o-ellipsis-lastline;
	  overflow: hidden;
	  text-overflow: ellipsis;
	  display: -webkit-box;
	  -webkit-line-clamp: 2;
	  line-clamp: 2;
	  -webkit-box-orient: vertical;
	}
	
	.item-person{
	  margin: 8rpx 0 30rpx;
	  font-size: 24rpx;
	  font-family: PingFang SC, PingFang SC-Regular;
	  font-weight: 400;
	  text-align: LEFT;
	  color: #666666;
	}
	
	.item-operation{
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  width: 100%;
	  height: 54rpx;
	  padding-top: 22rpx;
	  border-top: 2rpx solid #E8E8E8;
	
	}
	.operation-choose{
	  display: flex;
	}
	.choose-txt{
	  font-size: 24rpx;
	  color: #999;
	  line-height: 32rpx;
	
	}
	.operation-image{
	  width: 32rpx;
	  height: 32rpx;
	  margin-right: 8rpx;
	}
	.item-operation-right{
	  display: flex;
	}
	
	.operation-edit{
	  display: flex;
	  align-items: center;
	  height: 32rpx;
	  margin-right: 24rpx;
	}
	
	.operation-delete{
	  display: flex;
	  height: 32rpx;
	 
	}
	.edit-txt,.delete-txt{
	  font-size: 24rpx;
	  color: #666666;
	}
	
	
	
	
	
	
	/* 添加按钮 */
	.add-btn{
	  position: fixed;
	  left: 127rpx;
	  top: 90%;
	  width: 496rpx;
	  height: 96rpx;
	}
	.add-btn-txt{
	  position: absolute;
	  left: 0;
	  top: 0;
	  width: 496rpx;
	  height: 96rpx;
	  font-size: 32rpx;
	  line-height: 96rpx;
	  font-weight: 500;
	  text-align: center;
	  color: #f23740;
	}
	
	
	.btn{
	  position: fixed;
	  left: 50%;
	  top: 80%;
	  transform: translateX(-50%);
	  width: 650rpx;
	  height: 88rpx;
	  opacity: 1;
	  background: #FF2D2D;
	  border-radius: 54rpx;
	  text-align: center;
	  line-height: 88rpx;
	  font-size: 34rpx;
	  color: #fff;
	  margin: 80rpx auto;
	}
	
	/* end添加按钮 */
</style>
