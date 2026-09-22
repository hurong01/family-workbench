const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const PAGE_SIZE = 100

async function sumMonthlyExpenses(familyId, month) {
  const query = db.collection('expenses').where({ familyId, month })
  const { total } = await query.count()
  let sum = 0

  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const { data } = await query
      .orderBy('_id', 'asc')
      .skip(offset)
      .limit(PAGE_SIZE)
      .get()
    sum += data.reduce((value, expense) => value + Number(expense.amount || 0), 0)
  }

  return sum
}

exports.main = async event => {
  try {
    const { OPENID } = cloud.getWXContext()
    const user = (await db.collection('users').where({ _openid: OPENID }).limit(1).get()).data[0] || null

    if (!user) return { success: true, openid: OPENID, user: null, family: null }

    const source = (await db.collection('families').doc(user.familyId).get()).data
    const family = {
      _id: source._id,
      name: source.name,
      address: source.address || '',
      room: source.room || '',
      members: (source.members || []).map(item => ({ name: item.name, role: item.role })),
      reminders: source.reminders || [],
      fixedExpenses: source.fixedExpenses || [],
      budget: Number(source.budget || 5000)
    }

    if (!event.includeDashboard) {
      return {
        success: true,
        openid: OPENID,
        user: { name: user.name, role: user.role, familyId: user.familyId },
        family
      }
    }

    const serverMonth = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 7)
    const month = /^\d{4}-\d{2}$/.test(String(event.month || '')) ? String(event.month) : serverMonth
    const expenseQuery = db.collection('expenses').where({ familyId: user.familyId, month })
    const [total, recentResult] = await Promise.all([
      sumMonthlyExpenses(user.familyId, month),
      expenseQuery.orderBy('paidAt', 'desc').limit(5).get()
    ])
    const list = recentResult.data
    const budget = family.budget
    const icons = { 房租: '房', 水费: '水', 电费: '电', 宽带费: '网', 物业费: '物', 生活用品: '用', 燃气费: '气', 维修费: '修', 其他: '账' }
    const fixedReminders = family.fixedExpenses.map(item => ({
      name: item.category,
      amount: `¥${Number(item.amount).toFixed(2)}`,
      status: `每月${item.day}日提醒`
    }))

    return {
      success: true,
      user: { name: user.name, role: user.role, familyId: user.familyId },
      family,
      dashboard: {
        familyName: family.name,
        month,
        monthLabel: `${Number(month.slice(5))}月`,
        total: total.toFixed(2),
        budget: budget.toFixed(2),
        remaining: Math.max(0, budget - total).toFixed(2),
        budgetPercent: budget > 0 ? Math.min(100, Math.round(total / budget * 100)) : 0,
        compareText: '本月持续记录中',
        members: family.members.map(item => item.name),
        reminders: [...fixedReminders, ...family.reminders],
        recent: list.map(item => ({ ...item, icon: icons[item.category] || '账', paidAtText: item.paidAt }))
      }
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: '工作台加载失败，请稍后重试' }
  }
}
