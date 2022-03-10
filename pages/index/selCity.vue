<template>
	<view class="">
		<t-index-address @select="select"></t-index-address>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			select(data) {
				console.log(data)
				let pages = getCurrentPages();  //获取所有页面栈实例列表
				let nowPage = pages[ pages.length - 1];  //当前页页面实例
				let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
				prevPage.$vm.currentCityObj = data;   //修改上一页data里面的currentCityObj参数值为data
				uni.navigateBack({  //uni.navigateTo跳转的返回，默认1为返回上一级
					delta: 1
				});
			},
		}
	}
</script>

<style>
</style>
