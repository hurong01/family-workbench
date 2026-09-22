const {cloudCall,showError}=require('../../services/cloud')
Page({
  data:{nickname:'家庭成员',familyName:'',role:'member',busy:false},
  onShow(){
    cloudCall('getFamily').then(r=>this.setData({nickname:(r.currentMember&&r.currentMember.name)||'家庭成员',familyName:(r.family&&r.family.name)||'',role:r.role||'member'})).catch(e=>{
      if(e.code==='NO_FAMILY')return wx.reLaunch({url:'/pages/onboarding/index'})
      showError(e)
    })
  },
  openPrivacy(){wx.navigateTo({url:'/pages/privacy/index'})},
  async exportData(){this.setData({busy:true});try{const r=await cloudCall('exportBills'),path=`${wx.env.USER_DATA_PATH}/${r.fileName}`,fs=wx.getFileSystemManager();await new Promise((resolve,reject)=>fs.writeFile({filePath:path,data:r.csv,encoding:'utf8',success:resolve,fail:reject}));if(r.truncated)wx.showModal({title:'导出条数已达上限',content:`本次导出 ${r.expenseCount} 条账目，已达到单次上限。请先创建备份，再联系管理员分批导出。`,showCancel:false});if(wx.shareFileMessage)wx.shareFileMessage({filePath:path,fileName:r.fileName});else wx.openDocument({filePath:path,showMenu:true})}catch(e){showError(e,'账单导出失败')}finally{this.setData({busy:false})}},
  async backup(){this.setData({busy:true});try{const r=await cloudCall('backupFamily',{action:'create'});wx.showModal({title:'备份完成',content:`已备份 ${r.expenseCount} 条账目。`,showCancel:false})}catch(e){showError(e)}finally{this.setData({busy:false})}},
  async restore(){this.setData({busy:true});try{const r=await cloudCall('backupFamily',{action:'list'}),latest=r.backups&&r.backups[0];if(!latest)return wx.showToast({title:'暂无可恢复备份',icon:'none'});wx.showModal({title:'恢复最新备份',content:`将用最新备份覆盖当前家庭设置和账目（${latest.expenseCount} 条），继续吗？`,confirmText:'确认恢复',confirmColor:'#d9534f',success:async x=>{if(!x.confirm)return;try{const result=await cloudCall('restoreFamily',{backupId:latest._id});wx.showModal({title:'恢复完成',content:`已恢复 ${result.expenseCount} 条账目。`,showCancel:false})}catch(err){showError(err)}}})}catch(e){showError(e)}finally{this.setData({busy:false})}},
  about(){wx.showModal({title:'璀璨家庭账本',content:'让家庭开销清清楚楚，让共同生活更轻松。',showCancel:false})},
  leave(){wx.showModal({title:'退出家庭',content:'退出后将无法继续查看家庭账目，已创建的账目会保留。管理员需先转移管理员权限。',confirmText:'确认退出',confirmColor:'#d9534f',success:async r=>{if(!r.confirm)return;try{await cloudCall('leaveFamily');wx.reLaunch({url:'/pages/onboarding/index'})}catch(e){showError(e)}}})}
})
