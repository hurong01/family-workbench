function cloudCall(name, data = {}) {
  return wx.cloud.callFunction({ name, data }).then(({ result }) => {
    if (!result || result.success === false) {
      const error = new Error((result && result.message) || '云端服务暂不可用')
      error.code = result && result.code
      throw error
    }
    return result
  })
}
function getDashboard() {
  const date = new Date()
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  return cloudCall('login', { includeDashboard: true, month }).then(result => {
    if (!result.family) { const error = new Error('请先创建或加入家庭'); error.code = 'NO_FAMILY'; throw error }
    return result.dashboard
  })
}
function getBills(month) {
  return cloudCall('getBills', { month }).then(result => ({
    expenses: result.expenses || [],
    total: result.total || '0.00'
  }))
}
function showError(error, fallback = '操作失败，请稍后重试') { wx.showToast({ title: error && error.message ? error.message : fallback, icon: 'none', duration: 2500 }) }
module.exports = { cloudCall, getDashboard, getBills, showError }
