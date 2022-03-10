var rootDocument = 'https://shanghu.zhongyigames.com/';

var header = {
  'Accept': 'application/json',
  'content-type': 'application/json',
  'Authorization': null,
};

// get请求
function getJSON(url, cb) {
  uni.request({
    url: rootDocument + url,
    method: "GET",
    header: header,
    success: function (res) {
      return typeof cb === "function" && cb(res.data)
    },
    fail: function (err) {
      uni.showModal({
        title: '网络错误',
        content: '网络出错，请刷新重试',
        showCancel: false
      })
      return typeof cb === "function" && cb(false)
    }
  })
}


// post请求
function postJSON(url, data, cb) {
	let utoken = uni.getStorageSync('utoken')
	data.token = 'api';
	data.utoken = utoken;
  
  uni.request({
    url: rootDocument + url,
    method: "POST",
    header: {
      'content-type': 'application/x-www-form-urlencoded' //post
    },
    data: data,
    type: "json",
    success: function (res) {
		if(res.data.code == 2){
			uni.showToast({
				title: '请重新登录',
				icon: 'none',
				duration: 2000
			})
			setTimeout(function(){
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},2000)
		}
      return typeof cb === "function" && cb(res.data)
    },
    fail: function (err) {
      uni.showModal({
        title: '网络错误',
        content: '网络错误，请刷新重试',
        showCancel: false
      })
      return typeof cb === "function" && cb(false)
    }
  })
}



//暴露接口供外部调用
module.exports = {
  getJSON: getJSON,
  postJSON: postJSON,
  rootDocument: rootDocument,
  header: header
}