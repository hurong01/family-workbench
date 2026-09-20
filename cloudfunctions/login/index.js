const cloud=require('wx-server-sdk');cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});const db=cloud.database()
exports.main=async event=>{try{
  const{OPENID}=cloud.getWXContext(),user=(await db.collection('users').where({_openid:OPENID}).limit(1).get()).data[0]||null
  if(!user)return{success:true,openid:OPENID,user:null,family:null}
  const source=(await db.collection('families').doc(user.familyId).get()).data
  const family={_id:source._id,name:source.name,address:source.address||'',room:source.room||'',members:(source.members||[]).map(x=>({name:x.name,role:x.role})),reminders:source.reminders||[],fixedExpenses:source.fixedExpenses||[],budget:Number(source.budget||5000)}
  if(!event.includeDashboard)return{success:true,openid:OPENID,user:{name:user.name,role:user.role,familyId:user.familyId},family}
  const now=new Date(Date.now()+8*3600000),month=now.toISOString().slice(0,7),list=(await db.collection('expenses').where({familyId:user.familyId,month}).orderBy('paidAt','desc').limit(20).get()).data,total=list.reduce((s,x)=>s+Number(x.amount||0),0),budget=family.budget,icons={'房租':'房','水费':'水','电费':'电','宽带费':'网','物业费':'物','生活用品':'用','燃气费':'气','维修费':'修','其他':'账'},fixedReminders=family.fixedExpenses.map(x=>({name:x.category,amount:`¥${Number(x.amount).toFixed(2)}`,status:`每月${x.day}日提醒`})),reminders=[...fixedReminders,...family.reminders]
  return{success:true,user:{name:user.name,role:user.role,familyId:user.familyId},family,dashboard:{familyName:family.name,month,monthLabel:`${Number(month.slice(5))}月`,total:total.toFixed(2),budget:budget.toFixed(2),remaining:Math.max(0,budget-total).toFixed(2),budgetPercent:Math.min(100,Math.round(total/budget*100)),compareText:'本月持续记录中',members:family.members.map(x=>x.name),reminders,recent:list.slice(0,5).map(x=>({...x,icon:icons[x.category]||'账',paidAtText:x.paidAt}))}}
}catch(e){console.error(e);return{success:false,message:'工作台加载失败，请稍后重试'}}}
