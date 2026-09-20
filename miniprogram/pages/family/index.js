const {cloudCall,showError}=require('../../services/cloud')
Page({
  data:{family:null,members:[],role:'member',loading:true,error:'',inviteCode:''},
  onShow(){this.load()},
  async load(){this.setData({loading:true,error:''});try{const r=await cloudCall('getFamily');this.setData({family:r.family,members:r.family.members||[],role:r.role})}catch(e){if(e.code==='NO_FAMILY')return wx.reLaunch({url:'/pages/onboarding/index'});this.setData({error:e.message})}finally{this.setData({loading:false})}},
  async invite(){try{const r=await cloudCall('createInvite');this.setData({inviteCode:r.inviteCode});wx.setClipboardData({data:r.inviteCode});wx.showModal({title:'家庭邀请码',content:`${r.inviteCode}\n已复制，有效期 7 天。`,showCancel:false})}catch(e){showError(e)}},
  updateBudget(){wx.showModal({title:'修改家庭月预算',editable:true,placeholderText:String(this.data.family.budget||5000),success:async r=>{if(!r.confirm)return;try{await cloudCall('manageFamily',{action:'budget',budget:Number(r.content)});wx.showToast({title:'预算已更新'});this.load()}catch(e){showError(e)}}})},
  transfer(e){const member=e.currentTarget.dataset.member;if(this.data.role!=='admin'||member.role==='admin')return;wx.showModal({title:'转移管理员',content:`确定将管理员转移给“${member.name}”吗？转移后你将成为普通成员。`,confirmText:'确认转移',success:async r=>{if(!r.confirm)return;try{await cloudCall('manageFamily',{action:'transfer',targetMemberId:member.memberId});wx.showToast({title:'已转移'});this.load()}catch(err){showError(err)}}})},
  revoke(){wx.showModal({title:'撤销邀请码',content:'所有尚未使用的邀请码将立即失效。',success:async r=>{if(!r.confirm)return;try{await cloudCall('manageFamily',{action:'revokeInvites'});this.setData({inviteCode:''});wx.showToast({title:'已撤销'})}catch(e){showError(e)}}})},
  recurring(){wx.navigateTo({url:'/pages/recurring/index'})},
  deleteFamily(){wx.showModal({title:'删除整个家庭',content:'这会永久删除成员关系、所有账目和备份，无法恢复。',confirmText:'继续',confirmColor:'#d9534f',success:r=>{if(!r.confirm)return;wx.showModal({title:'最后确认',editable:true,placeholderText:'请输入：删除家庭',confirmText:'永久删除',confirmColor:'#d9534f',success:async x=>{if(!x.confirm)return;if(x.content!=='删除家庭')return wx.showToast({title:'确认文字不正确',icon:'none'});try{await cloudCall('manageFamily',{action:'delete'});wx.reLaunch({url:'/pages/onboarding/index'})}catch(e){showError(e)}}})}})},
  onShareAppMessage(){const code=this.data.inviteCode;return{title:`邀请你加入「${this.data.family?this.data.family.name:'家庭账本'}」`,path:code?`/pages/onboarding/index?invite=${code}`:'/pages/onboarding/index'}}
})
