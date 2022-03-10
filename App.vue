<script>
	// 引入SDK核心类
	var QQMapWX = require("./utils/qqmap-wx-jssdk.min");
	var qqmapsdk;// app.js
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 热更新
			if (uni.canIUse('getUpdateManager')) {
				const updateManager = uni.getUpdateManager()
				//检查是否有新版本
				updateManager.onCheckForUpdate(function(res) {
					// 如果有新版本
					if (res.hasUpdate) {
						// 手机支持热更新时
						updateManager.onUpdateReady(function() {
							uni.showModal({
								title: '更新提示',
								content: '新版本已经准备好，是否重启应用？',
								success: function(res) {
									if (res.confirm) {
										updateManager.applyUpdate()
									}
								}
							})
						})
						// 手机不支持热更新时
						updateManager.onUpdateFailed(function() {
							uni.showModal({
								title: '已经有新版本了哟~',
								content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
							})
						})
					}
				})
			} else {

			}

			let that = this;
			// 获取用户手机型号
			uni.getSystemInfo({
				success: function(res) {
					if (res.model == "iPhone X") {
						that.globalData.isIphoneX = true
					}
				}
			})

			// 实例化API核心类
			qqmapsdk = new QQMapWX({
			  key: 'NKIBZ-QBYR3-MMC3P-3VYBO-2WY2Z-4WBE7'
			});
			// 获取用户位置
			uni.getLocation({
				type: 'wgs84',
				success(res) {
					console.log(res, '获取用户地理位置');
					const latitude = res.latitude; // 纬度
					const longitude = res.longitude; // 经度

					uni.setStorageSync('latitude', latitude);
					uni.setStorageSync('longitude', longitude);
					uni.setStorageSync('selfLocation', true)
					// 调用接口
					qqmapsdk.reverseGeocoder({
						location: {
							latitude: latitude,
							longitude: longitude
						},
						success: function(req) {
							// console.log(req);
							let tempData = req.result.address_component;
							let tempAd_info = req.result.ad_info;
							
							let currentCityObj = {
								name: tempData.city,
								lng: longitude,
								lat: latitude,
							}
							
							// 存储到本地
							uni.setStorageSync('tempDate', tempData);
							uni.setStorageSync('currentTempData',req.result.ad_info);
							uni.setStorageSync('tempAd_info',tempAd_info);
							uni.setStorageSync('currentCity',tempData.city);
							uni.setStorageSync('currentCityObj',currentCityObj);
							
						},
						fail: function(error) {
							console.log("err")
							console.error(error);
						}
			  })
				},
				fail(err) {
					console.log(err, '拒绝授权');
				}
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			userInfo: null,
			isIphoneX: false,
			qqmapsdkKey: 'NKIBZ-QBYR3-MMC3P-3VYBO-2WY2Z-4WBE7'
		}
	}
</script>
<style>
	page {
		background: #fff;
		width: 100%;
		overflow-x:hidden;
	}
</style>
<style>
	/*每个页面公共css */
	view {
		box-sizing: border-box;
	}

	view,
	text {
		font-family: PingFang SC;
	}

	image {
		display: inline-block;
	}

	.pic {
		width: 100%;
		height: 100%;
	}

	.baseflex {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.multiHide {
		// 多行隐藏 显示省略号 默认两行,可覆盖, 需设置宽高
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.singleHide {
		// 单行文本溢出隐藏, 需设置宽 高
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	
	.goodsNull{
		color: #999;
		text-align: center;
		margin: 40rpx auto;
	}
</style>
