const { cloudCall, showError } = require('../../services/cloud')
Page({
  data:{categories:['房租','水费','电费','宽带费','物业费','生活用品','燃气费','维修费','其他'],members:[],categoryIndex:0,payerIndex:0,date:'',amount:'',note:'',expenseId:'',receiptFileID:'',receiptTempPath:'',uploading:false,saving:false,loading:true},
  onLoad(){const d=new Date(),p=n=>String(n).padStart(2,'0');this.setData({date:`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`})},
  async onShow(){
    if(!this.data.members.length) await this.loadFamily()
    const editing=wx.getStorageSync('editingExpense')
    if(editing){
      wx.removeStorageSync('editingExpense')
      this.setData({expenseId:editing._id,amount:String(editing.amount),categoryIndex:Math.max(0,this.data.categories.indexOf(editing.category)),date:editing.paidAt,note:editing.note||'',receiptFileID:editing.receiptFileID||'',receiptTempPath:editing.receiptFileID||'',payerIndex:Math.max(0,this.data.members.indexOf(editing.payerName))})
    }else{
      const category=wx.getStorageSync('prefillCategory'),index=this.data.categories.indexOf(category)
      if(index>=0)this.setData({categoryIndex:index})
      wx.removeStorageSync('prefillCategory')
    }
  },
  async loadFamily(){this.setData({loading:true});try{const result=await cloudCall('getFamily');this.setData({members:(result.family.members||[]).map(x=>x.name)})}catch(e){if(e.code==='NO_FAMILY')wx.reLaunch({url:'/pages/onboarding/index'});else showError(e)}finally{this.setData({loading:false})}},
  bindCategory(e){this.setData({categoryIndex:+e.detail.value})},bindPayer(e){this.setData({payerIndex:+e.detail.value})},bindDate(e){this.setData({date:e.detail.value})},bindField(e){this.setData({[e.currentTarget.dataset.field]:e.detail.value})},
  async chooseReceipt(){try{const r=await wx.chooseMedia({count:1,mediaType:['image'],sourceType:['album','camera'],sizeType:['compressed']}),path=r.tempFiles[0].tempFilePath;this.setData({uploading:true,receiptTempPath:path});const upload=await wx.cloud.uploadFile({cloudPath:`receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,filePath:path});this.setData({receiptFileID:upload.fileID});wx.showToast({title:'票据已上传'})}catch(e){if(!String(e.errMsg||'').includes('cancel'))showError(e,'票据上传失败')}finally{this.setData({uploading:false})}},
  removeReceipt(){this.setData({receiptFileID:'',receiptTempPath:''})},
  async submit(){
    const amount=Number(this.data.amount)
    if(!amount||amount<=0)return wx.showToast({title:'请输入正确金额',icon:'none'})
    if(!this.data.members.length)return wx.showToast({title:'家庭成员加载失败',icon:'none'})
    this.setData({saving:true})
    const data={expenseId:this.data.expenseId,amount,category:this.data.categories[this.data.categoryIndex],payerName:this.data.members[this.data.payerIndex],paidAt:this.data.date,month:this.data.date.slice(0,7),note:this.data.note.trim(),receiptFileID:this.data.receiptFileID}
    try{await cloudCall(this.data.expenseId?'updateExpense':'saveExpense',data);wx.showToast({title:this.data.expenseId?'已更新':'已记账'});this.setData({expenseId:'',amount:'',note:'',receiptFileID:'',receiptTempPath:''});setTimeout(()=>wx.switchTab({url:'/pages/bills/index'}),500)}catch(e){showError(e)}finally{this.setData({saving:false})}
  }
})
