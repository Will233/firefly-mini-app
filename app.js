//app.js
var conf = require('./conf/conf.js')
var WebService = require('./service/WebService.js')
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.switchTab({
      url: 'pages/index/index'
    })
    wx.setStorageSync('logs', logs)
  },
  globalData: {
    userInfo: null,
    openid: null
  }
})