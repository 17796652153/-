<template>
	<view class="showModel" v-if="showModel">
		<view class="mask"></view>
		<view class="model">
			<view class="title">
				{{title}}
			</view>
			<view class="content" v-if="showInput">
				<input type="text" @input="changeContent($event)" v-model="inputContent" />
			</view>
			<view class="content" v-if="showPicker">
				<picker class="selPicker" mode="selector" :range="selectArr" @change="selectArrs($event)">
					<view>{{selectArr[currentIdx]}}</view>
				</picker>
				<image src="../../static/icon_arrow-downGray.png" mode=""></image>
			</view>
			<view class="operation">
				<view class="cancel" @click="cancel">
					{{leftBtn}}
				</view>
				<view class="confirm" @click="confirm">
					{{rightBtn}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		name:'eject',
		props:{
			showModel: {
				type: Boolean,
				default: false,
				required: true
			},
			title: {
				type: String,
				default: "",
				required: true
			},
			showInput: {
				type: Boolean,
				default: false
			},
			showPicker: {
				type: Boolean,
				default: false
			},
			selectArr: {
				type: Array,
				default: []
			},
			currentIdx: {
				type: Number,
				default: 0
			},
			leftBtn: {
				type: String,
				default: '取消'
			},
			rightBtn: {
				type: String,
				default: '确定'
			}
		},
		data(){
			return{
				inputContent: '', // 输入框的内容
			}
		},
		methods:{
			// 输入框的内容
			changeContent(e){
				this.inputContent = e.detail.value
			},
			
			// 选择器选择
			selectArrs(e){
				// console.log(e,'选择器选择的内容');
				this.$emit('selectArrs',e.detail.value)
			},
			
			// 取消
			cancel(){
				console.log('点击了左侧的取消键');
				this.$emit('cancel')
			},
			
			// 确认
			confirm(){
				console.log('点击了右侧的确定键');
				if(this.inputContent){
					this.$emit('confirm',this.inputContent)
				}else{
					this.$emit('confirm')
				}
				
			},
		}
	}
</script>

<style lang="less">
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
