//index.js
//获取应用实例
var conf = require('../../conf/conf.js');
var WebService = require('../../service/WebService.js');
var app = getApp()
Page({
	data: {
		hasRecord: false,
		count: 0,
		userInfo: {},
		src: '',
		shareData: {},
		readSlide: '120分钟',
		readTime: 120,
		exp: 0,
		bookcount: 0,
		daycount: 0,
		error: false,
		msg: ''
	},
	onShareAppMessage: function() {
		return this.data.shareData
	},
	changeHasRecord: function(val) {
		this.setData({
			hasRecord: val
		})
	},
	changeCount: function(val) {
		this.setData({
			count: val
		})
	},
	hasSignedToday: function() {
		var self = this
		try {
			var ss_id = wx.getStorageSync('ss_id')
			WebService.apiPost({
				url: conf.host + '/wxapp/record.php?action=getRecord&ss_id=' + ss_id,
				data: {},
				success: function(res) {
					self.setData({
						hasRecord: res.data.hasRecord
					})
					if(res.data.success === 1) {
						self.setData({
							count: res.data.count
						})
						if(res.data.hasRecord) {
							self.setData({
								bookDate: res.data.date,
								bookName: res.data.bookName,
								bookIdea: res.data.bookIdea,
								readTime: res.data.readTime
							})
						}
					} else {
						wx.showToast({
							title: res.data.msg,
							icon: 'success',
							duration: 2000
						})
					}
				},
				fail: function(res) {
					// fail
				}
			});
		} catch(e) {
			console.log('用户token过期，跳转到登录页面')
			return false;
		}
	},
	getMyGain: function() {
		var self = this;
		var ss_id = wx.getStorageSync('ss_id');
		WebService.apiPost({
			url: conf.host + '/wxapp/record.php?action=getmygain&ss_id=' + ss_id,
			data: {},
			success: function(res) {
				if(res.data.success === 1) {
					self.setData({
						bookcount: res.data.bookSum,
						exp: res.data.expSum,
						daycount: res.data.signSum,
						shareData: {
							title: '我已坚持读书打卡' + res.data.signSum + '天',
							desc: '快来一起享受阅读吧',
							path: 'pages/index/index'
						}
					})
				}
			},
			fail: function(res) {
				console.log(res);
			}
		});
	},
	//事件处理函数
	submitRecord: function(e) {
		var self = this
		var data = e.detail.value
		console.log(data);
		try {
			var time = data.readTime
			var bookName = data.bookName
			var bookIdea = data.bookIdea
			if (time < 0) {
				self.setData({ 
					error: true,
					msg: '读书时间不能小于0'
				});
				return false;
			}else if (bookName.length <= 0) {
				self.setData({ 
					error: true,
					msg: '书名不能为空'
				});
				return false;
			}else if (bookIdea.length <= 0) {
				self.setData({
					error: true,
					msg: '读书心得不能为空'
				});
				return false;
			}else {
				self.setData({
					error: false
				});
			}
			var ss_id = wx.getStorageSync('ss_id')
			WebService.apiPost({
				url: conf.host + '/wxapp/record.php?action=postRecord&ss_id=' + ss_id,
				data: {
					readTime: time,
					bookName: bookName,
					bookIdea: bookIdea
				},
				success: function(res) {
					if(res.data.success === 1) {
						//打卡成功，页面
						console.log('打卡成功')
						wx.showToast({
							title: '打卡成功',
							icon: 'success',
							duration: 2000
						})
						self.setData({
							hasRecord: true,
							bookDate: res.data.date,
							readTime: time,
							bookName: bookName,
							bookIdea: bookIdea
						})
					} else {
						wx.showToast({
							title: res.data.msg,
							icon: 'fail',
							duration: 2000
						})
					}
				},
				fail: function(res) {
					console.log('fail' + res)
				}
			})
		} catch(e) {
			console.log('出错' + e)
			return false;
		}
	},
	getUserInfo: function() {
		var self = this;
		WebService.wxGetUserInfo(function(res) {
			self.setData({
				userInfo: res
			});
		});
	},
	readSlidChange: function(e) {
		var readSlide = e.detail.value || 0;
		var hour = parseInt(readSlide / 60);
		var min = (readSlide % 60);
		var readSlideStr = (hour === 0 ? '' : (hour + '小时')) + (min === 0 ? '' : (min + '分钟'));
		this.setData({
			readSlide: readSlideStr,
			readTime: readSlide
		});
	},
	onLoad: function() {
		//todo 判断用户是否签到
		var self = this
		WebService.wxCheckSession(function() {
			self.hasSignedToday();
			self.getMyGain();
			self.getUserInfo();
		});

	}
})