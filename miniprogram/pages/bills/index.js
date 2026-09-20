const {getBills,cloudCall,showError}=require('../../services/cloud')
Page({
  data:{month:'',expenses:[],total:'0.00',groups:[],loading:true,error:''},
  onLoad(){const d=new Date();this.setData({month:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`});this.load()},
  onShow(){if(this.data.month)this.load()}, bindMonth(e){this.setData({month:e.detail.value});this.load()},
  async load(){this.setData({loading:true,error:''});try{const expenses=await getBills(this.data.month),total=expenses.reduce((s,x)=>s+Number(x.amount||0),0),sums={};expenses.forEach(x=>sums[x.category]=(sums[x.category]||0)+Number(x.amount||0));this.setData({expenses,total:total.toFixed(2),groups:Object.keys(sums).map(name=>({name,amount:sums[name].toFixed(2),percent:total?Math.max(5,Math.round(sums[name]/total*100)):0}))})}catch(e){if(e.code==='NO_FAMILY')return wx.reLaunch({url:'/pages/onboarding/index'});this.setData({error:e.message||'账单加载失败'})}finally{this.setData({loading:false})}},
  manage(e){const item=e.currentTarget.dataset.item;if(!item.canEdit)return;wx.showActionSheet({itemList:['编辑账目','删除账目'],success:r=>{if(r.tapIndex===0){wx.setStorageSync('editingExpense',item);wx.switchTab({url:'/pages/expense-add/index'})}else this.remove(item)}})},
  remove(item){wx.showModal({title:'删除账目',content:`确定删除“${item.category} ¥${item.amount}”吗？删除后无法恢复。`,success:async r=>{if(!r.confirm)return;try{await cloudCall('deleteExpense',{expenseId:item._id});wx.showToast({title:'已删除'});this.load()}catch(e){showError(e)}}})}
})
