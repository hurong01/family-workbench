const { cloudCall } = require('./services/cloud')
App({
  globalData: { env: 'cloudfunctions-d1gi62wijfa055937', user: null, family: null },
  async onLaunch() {
    if (!wx.cloud) return console.error('请使用 2.2.3 或以上基础库')
    wx.cloud.init({ env: this.globalData.env || undefined, traceUser: true })
    try {
      const result = await cloudCall('login')
      this.globalData.user = result.user || null
      this.globalData.family = result.family || null
    } catch (error) { console.error('登录初始化失败', error) }
  }
})
