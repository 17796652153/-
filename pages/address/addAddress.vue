<template>
	<view class="">
		<view class="addrForm">
		  <!-- 姓名 -->
		  <view class="addr-item">
		    <view class="addr-item-name">姓名</view>
		    <view class="addr-item-write">
		      <input type="text" v-model="name" placeholder="请填写姓名" />
		    </view>
		  </view>
		
		  <!-- 手机号 -->
		  <view class="addr-item">
		    <view class="addr-item-name">手机号</view>
		    <view class="addr-item-write">
		      <input maxlength="11" v-model="phone" type="idcard" placeholder="请输入手机号" />
		    </view>
		  </view>
		
		  <!-- 地址 -->
		  <view class="addr-item" @click="showAddrPopup">
		    <view class="addr-item-name">地址</view>
		    <view class="addr-item-write" :style="'color:' + address.length==7 ? '#808080':'#333333' + ';padding:40rpx 0;'">
		      <input type="text" disabled="true" :value="address" placeholder="请选择地址" style="margin:0;" />
		    </view>
		  </view>
		
		  <!-- 详细地址 -->
		  <view class="addr-item">
		    <view class="addr-item-name">详细地址</view>
		    <view class="addr-item-write">
		      <textarea name="addrs" v-model="address_l" type="text" placeholder="请填写详细地址，具体到小区名称"
		        id="addrs" auto-height="true"></textarea>
		    </view>
		  </view>
		
		  <!-- 设为默认地址 -->
		  <view class="addr-item">
		    <view class="addr-item-name">设为默认地址</view>
		    <view class="addr-item-switch">
		      <switch :checked="switch1Checked" style="zoom:0.7;" color="#FF2D2D" @click="switchChange"/>
		    </view>
		  </view>
		</view>
		<!-- 保存按钮 -->
		<view class="btn" @click="submitAddr">保存</view>
	
		<linkAddress :maskVisual="popupAddr" @areaSelectedStr="areaSelected" @cascadeDismiss="cascadeDismiss"></linkAddress>
	</view>
</template>

<script>
	import linkAddress from "@/components/linkAddress/linkAddress.vue"
	
	import http from "@/utils/http.js";
	export default{
		components:{
			linkAddress
		},
		data(){
			return {
				name: '', // 用户姓名
				phone: '', // 用户手机号
				arrAddr: [], // 地址数组
				address: '', // 地址
				address_l: '', // 详细地址
				switch1Checked: false, // 默认
				
				popupAddr: 'hidden', // 弹出地址选择框
				
				id: '', // 修改的地址id
			}
		},
		onLoad(option) {
			this.id = option.id;
			console.log(option,'option');
			if(this.id){
				this.getAddrInfo()
			}
		},
		methods:{
			switchChange(){
				
			},
			
			// 查询地址信息
			getAddrInfo(){
				let that = this;
				http.postJSON('api/address/getInfo',{
					id: this.id
				},function(res){
					console.log(res,'地址信息');
					that.arrAddr = [res.data.province, res.data.city, res.data.district];
					that.address = res.data.province + res.data.city + res.data.district;
					that.name = res.data.name;
					that.phone = res.data.mobile;
					that.address_l = res.data.address;
					that.switch1Checked = res.data.is_default == 1 ? true : false;
				})
			},
			
			// 弹出 省市区 选择框
			showAddrPopup(){
			  this.popupAddr = 'show'
			},
			
			// 隐藏弹出框
			cascadeDismiss(){
				this.popupAddr = 'hidden'
			},
			
			// 选择后的结果
			areaSelected(data){
			  this.arrAddr = data;
			  this.address = data.join('');
			},
			
			
			// 提交添加新地址
			submitAddr(){
				
				if(!this.name){
					uni.showToast({
						title: '请填写名称',
						icon: 'none'
					})
					return
				}
				let reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
				if (!this.phone) {
					uni.showToast({
						title: '请填写联系电话',
						icon: 'none',
					})
					return
				} else if (!reg_tel.test(this.phone)) {
					uni.showToast({
						title: '请填写正确的手机号',
						icon: 'none'
					})
					return
				}
				if(!this.address){
					uni.showToast({
						title: '请选择省市区',
						icon: 'none'
					})
					return
				}
				if(!this.address_l){
					uni.showToast({
						title: '请填写详细地址',
						icon: 'none'
					})
					return
				}
				
				let switch1Checked = this.switch1Checked ? 1 : 2;
				let province = this.arrAddr[0];
				let city = this.arrAddr[1];
				let district = this.arrAddr[2];
				
				if(this.id){ // id存在则为修改
					http.postJSON('api/address/editInfo',{
						id: this.id,
						name: this.name,
						mobile: this.phone,
						province: province,
						city: city,
						district: district,
						address: this.address_l,
						is_default: switch1Checked
					},function(res){
						console.log(res,'修改地址');
						if(res.code == 200){
							uni.showToast({
								title: '修改成功',
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
					return
				}
				http.postJSON('api/address/addInfo',{
					name: this.name,
					mobile: this.phone,
					province: province,
					city: city,
					district: district,
					address: this.address_l,
					is_default: switch1Checked
				},function(res){
					console.log(res);
					if(res.code == 200){
						uni.showToast({
							title: '添加成功',
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
		}
	}
</script>

<style>
	.address{
	  margin: 32rpx 32rpx 16rpx;
	  font-size: 32rpx;
	  font-weight: 500;
	}
	
	.addr-list{
	  display: flex;
	  align-items: center;
	  width: 686rpx;
	  height: 120rpx;
	  margin: 0 32rpx;
	  border-bottom: 1rpx solid #f6f6f6;
	}
	.addr-list-name{
	  width: 112rpx;
	  text-align: left;
	  margin-right: 32rpx;
	}
	.input{
	  width: 542rpx;
	  font-weight: 500;
	}
	
	.addr-location{
	  width: 542rpx;
	}
	
	
	.confirm-btn{
	  position: absolute;
	  left: 32rpx;
	  /* bottom: 24rpx; */
	  top: 90%;
	  z-index: 5;
	  width: 686rpx;
	  height: 96rpx;
	  border-radius: 48rpx;
	  font-size: 32rpx;
	  line-height: 96rpx;
	  font-weight: 500;
	  text-align: center;
	  color: #ffffff;
	  background-color: #F23740;
	}
	
	
	
	
	
	
	
	
	
	.addrForm{
	  padding: 0 30rpx;
	}
	
	.addr-item{
	  width: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  overflow: hidden;
	}
	.addr-item-name{
	  font-size: 32rpx;
	  color: #333;
	}
	.addr-item-write{
	  width: 100%;
	  height: 100%;
	  max-width: 510rpx;
	  border-bottom: 2rpx solid #EBEBEB;
	}
	.addr-item-write input{
	  width: 100%;
	  height: 100%;
	  color: #333;
	  font-size: 32rpx;
	  margin: 40rpx 0;
	}
	.addr-item-write textarea{
	  width: 100%;
	  min-height: 45rpx;
	  color: #333;
	  font-size: 32rpx;
	  margin: 40rpx 0;
	}
	.addr-item-switch{
	  height: 112rpx;
	  display: flex;
	  align-items: center;
	}
	
	
	
	.btn{
	  width: 400rpx;
	  height: 100rpx;
	  opacity: 1;
	  border-radius: 55rpx;
	  background-color: #FF2D2D;
	  text-align: center;
	  line-height: 100rpx;
	  font-size: 34rpx;
	  color: #fff;
	  margin: 80rpx auto;
	}
</style>
