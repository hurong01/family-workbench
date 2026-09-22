const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const PAGE_SIZE = 100
const MAX_EXPORT = 5000

const cell = value => {
  let text = String(value == null ? '' : value)
  if (/^[=+@-]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

async function getAllExpenses(familyId) {
  const query = db.collection('expenses').where({ familyId })
  const { total } = await query.count()
  const cap = Math.min(total, MAX_EXPORT)
  const list = []

  for (let offset = 0; offset < cap; offset += PAGE_SIZE) {
    const { data } = await query
      .orderBy('paidAt', 'desc')
      .orderBy('_id', 'desc')
      .skip(offset)
      .limit(PAGE_SIZE)
      .get()
    list.push(...data)
  }

  return { list, truncated: total > MAX_EXPORT }
}

exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext()
    const user = (await db.collection('users').where({ _openid: OPENID }).limit(1).get()).data[0]
    if (!user) return { success: false, message: '尚未加入家庭' }

    const { list, truncated } = await getAllExpenses(user.familyId)
    const rows = [
      ['日期', '月份', '分类', '具体名称', '金额', '付款人', '票据文件ID'],
      ...list.map(item => [
        item.paidAt,
        item.month,
        item.category,
        item.itemName || item.note || '',
        item.amount,
        item.payerName,
        item.receiptFileID || ''
      ])
    ]

    return {
      success: true,
      fileName: `家庭账单-${new Date().toISOString().slice(0, 10)}.csv`,
      expenseCount: list.length,
      truncated,
      csv: '\ufeff' + rows.map(row => row.map(cell).join(',')).join('\r\n')
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: '账单导出失败' }
  }
}
