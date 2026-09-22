const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const PAGE_SIZE = 100

async function getAllExpenses(familyId, month) {
  const query = db.collection('expenses').where({ familyId, month })
  const { total } = await query.count()
  const list = []

  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const { data } = await query
      .orderBy('paidAt', 'desc')
      .orderBy('_id', 'desc')
      .skip(offset)
      .limit(PAGE_SIZE)
      .get()
    list.push(...data)
  }

  return list
}

exports.main = async event => {
  try {
    const { OPENID } = cloud.getWXContext()
    const month = String(event.month || '')
    if (!/^\d{4}-\d{2}$/.test(month)) return { success: false, message: '月份格式不正确' }

    const user = (await db.collection('users').where({ _openid: OPENID }).limit(1).get()).data[0]
    if (!user) return { success: false, code: 'NO_FAMILY', message: '请先创建或加入家庭' }

    const list = await getAllExpenses(user.familyId, month)
    const icons = { 房租: '房', 水费: '水', 电费: '电', 宽带费: '网', 物业费: '物', 生活用品: '用', 燃气费: '气', 维修费: '修', 其他: '账' }

    const amountTotal = list.reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return {
      success: true,
      total: amountTotal.toFixed(2),
      expenseCount: list.length,
      expenses: list.map(item => ({
        ...item,
        icon: icons[item.category] || '账',
        paidAtText: item.paidAt,
        canEdit: user.role === 'admin' || item.creatorOpenid === OPENID
      }))
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: '账单加载失败，请检查数据库索引' }
  }
}
