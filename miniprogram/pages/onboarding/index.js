const { cloudCall, showError } = require('../../services/cloud')
Page({
  data:{mode:'create',name:'璀璨之家',address:'璀璨天城1期',room:'2605',memberName:'',inviteCode:'',loading:false,agreed:false},
  onLoad(options){if(options.invite)this.setData({mode:'join',inviteCode:String(options.invite).toUpperCase()})},
  setMode(e){this.setData({mode:e.currentTarget.dataset.mode})},
  input(e){this.setData({[e.currentTarget.dataset.field]:e.detail.value})},
  toggleAgree(e){this.setData({agreed:e.detail.value.length>0})},
  openPrivacy(){wx.navigateTo({url:'/pages/privacy/index'})},
  async submit(){
    if(!this.data.agreed)return wx.showToast({title:'请先阅读并同意隐私说明',icon:'none'})
    if(!this.data.memberName.trim())return wx.showToast({title:'请输入你的称呼',icon:'none'})
    this.setData({loading:true})
    try{
      if(this.data.mode==='create') await cloudCall('createFamily',{name:this.data.name.trim(),address:this.data.address.trim(),room:this.data.room.trim(),memberName:this.data.memberName.trim()})
      else await cloudCall('joinFamily',{inviteCode:this.data.inviteCode.trim().toUpperCase(),memberName:this.data.memberName.trim()})
      wx.showToast({title:this.data.mode==='create'?'家庭已创建':'加入成功'})
      setTimeout(()=>wx.reLaunch({url:'/pages/dashboard/index'}),500)
    }catch(e){showError(e)}finally{this.setData({loading:false})}
  }
})
