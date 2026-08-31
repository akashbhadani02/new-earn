const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 submissionId:{type:mongoose.Schema.Types.ObjectId,ref:'Submission',required:true,unique:true},
 amount:{type:Number,required:true,min:0}
},{timestamps:true});
module.exports=mongoose.model('Transaction',schema);