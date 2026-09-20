const cloud=require('wx-server-sdk');cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});const db=cloud.database()
exports.main=async e=>{try{
  const{OPENID}=cloud.getWXContext(),name=String(e.name||'').trim(),memberName=String(e.memberName||'').trim()
  if(!name||!memberName)return{success:false,message:'家庭名称和成员称呼不能为空'}
  if((await db.collection('users').where({_openid:OPENID}).limit(1).get()).data.length)return{success:false,message:'你已经加入了一个家庭'}
  const family={name:name.slice(0,30),address:String(e.address||'').trim().slice(0,60),room:String(e.room||'').trim().slice(0,20),budget:5000,ownerOpenid:OPENID,members:[{openid:OPENID,name:memberName.slice(0,12),role:'admin'}],reminders:[],createdAt:db.serverDate()}
  const add=await db.collection('families').add({data:family});await db.collection('users').add({data:{_openid:OPENID,familyId:add._id,name:memberName.slice(0,12),role:'admin',createdAt:db.serverDate()}})
  return{success:true,familyId:add._id}
}catch(e){console.error(e);return{success:false,message:'创建家庭失败'}}}
