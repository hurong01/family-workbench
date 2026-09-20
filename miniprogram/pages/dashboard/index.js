const { getDashboard } = require('../../services/cloud')
Page({
  data:{ loading:true,error:'',dashboard:{total:'0.00',members:[],reminders:[],recent:[]}, categories:[{name:'房租',icon:'房',color:'#F4DFD2'},{name:'水费',icon:'水',color:'#DDEBF0'},{name:'电费',icon:'电',color:'#F5EBC8'},{name:'宽带费',icon:'网',color:'#DDE7F1'},{name:'物业费',icon:'物',color:'#E8E0EF'},{name:'生活用品',icon:'用',color:'#DFEBDD'}] },
  onShow(){this.load()}, onPullDownRefresh(){this.load().finally(()=>wx.stopPullDownRefresh())},
  async load(){this.setData({loading:true,error:''});try{this.setData({dashboard:await getDashboard()})}catch(e){if(e.code==='NO_FAMILY')return wx.reLaunch({url:'/pages/onboarding/index'});this.setData({error:e.message||'加载失败'})}finally{this.setData({loading:false})}},
  addExpense(e){wx.setStorageSync('prefillCategory',e.currentTarget.dataset.category||'');wx.switchTab({url:'/pages/expense-add/index'})},
  openBills(){wx.switchTab({url:'/pages/bills/index'})}
})
