const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 taskId:{type:mongoose.Schema.Types.ObjectId,ref:'Task',required:true},
 review:{type:String,required:true},proofData:{type:String,required:true},
 status:{type:String,enum:['under_review','approved','rejected'],default:'under_review'},
 rejectionReason:String,submittedAt:{type:Date,default:Date.now},reviewedAt:Date
});
schema.index({userId:1,taskId:1});
module.exports=mongoose.model('Submission',schema);