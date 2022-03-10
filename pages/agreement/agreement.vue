<template>
	<view class="content">
		<rich-text :nodes="content"></rich-text>
	</view>
</template>

<script>
	import http from "@/utils/http.js"
	export default {
		data(){
			return {
				content: '',
				type: 1,
			}
		},
		onLoad(options) {
			console.log(options);
			this.type = options.type;
			this.getAgreementInfo()
		},
		methods:{
			// 获取协议信息
			getAgreementInfo(){
				let that = this;
				http.postJSON('api/Index/getAgreementInfo',{
					type: this.type,
				},function(res){
					if(res.code == 200){
						that.content = res.data.content;
						uni.setNavigationBarTitle({
						　　title: res.data.title
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
		}
	}
</script>

<style>
	.content{
		width: 100%;
		overflow-x: hidden;
		padding: 20rpx;
	}
</style>
