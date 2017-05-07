/**
 * 网络接口调用类
 */
var conf = require('../conf/conf.js')
var Weixin = wx;
var WebService = {
	//全局变量
	wxCheckSession: function(callback) {
		if(Weixin) {
			var ss_id = Weixin.getStorageSync('ss_id')
			if(ss_id) {
				callback();
			} else {
				WebService.wxLogin(callback);
			}
		} else {
			console.log("error : 找不到app对象");
		}
	},
	wxLogin: function(callback) {
		if(Weixin) {
			//调用登录接口
			Weixin.login({
				success: function(data) {
					//发起网络请求
					Weixin.request({
						url: conf.host + '/wxapp/token.php',
						data: {
							code: data.code
						},
						method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
						header: {
							'content-type': 'application/json'
						}, // 设置请求的 header
						success: function(res) {
							Weixin.setStorageSync('ss_id', res.data.ss_id);
							callback(null, res.data.ss_id);
						},
						fail: function(res) {
							console.log('登录失败，将无法正常使用开放接口等服务', res)
							callback(res)
						}
					});
				},
				fail: function(err) {
					console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
				}
			});
		} else {
			console.error('cant find app object');
			return new Error("cant find app ");
		}
	},
	//获取用户信息
	wxGetUserInfo: function(callback) {
		Weixin.getUserInfo({
			withCredentials: false,
			success: function(res) {
				Weixin.setStorageSync('userInfo', res.userInfo)
				typeof callback == "function" && callback(res.userInfo)
			},
			fail: function(res) {
				console.log("fail" + res);
				callback(res);
			}
		});
	},
	apiGet: function(opts) {
		var defaults = {
			url: '',
			data: '',
			success: function() {},
			fail: function() {},
			error: function() {}
		};
		for(var key in opts) {
			defaults[key] = opts[key];
		}
		try {
			Weixin.request({
				url: defaults['url'],
				data: defaults['data'],
				method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
				header: {
					'content-type': 'application/json'
				}, // 设置请求的 header
				success: function(res) {
					defaults['success'](res);
				},
				fail: function(res) {
					// fail
					defaults['fail'](res);
				}
			})
		} catch(e) {
			console.log('error');
			defaults['error'](e);
		}
	},
	apiPost: function(opts) {
		var defaults = {
			url: '',
			data: '',
			success: function() {},
			fail: function() {},
			error: function() {}
		}
		for(var key in opts) {
			defaults[key] = opts[key];
		}
		try {
			Weixin.request({
				url: defaults['url'],
				data: defaults['data'],
				method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
				header: {
					'content-type': 'application/json'
				}, // 设置请求的 header
				success: function(res) {
					defaults['success'](res);
				},
				fail: function(res) {
					// fail
					defaults['fail'](res);
				}
			})
		} catch(e) {
			console.log('error');
			defaults['error'](e);
		}
	}

}
module.exports = {
	wxCheckSession: WebService.wxCheckSession,
	wxLogin: WebService.wxLogin,
	wxGetUserInfo: WebService.wxGetUserInfo,
	apiGet: WebService.apiGet,
	apiPost: WebService.apiPost
}