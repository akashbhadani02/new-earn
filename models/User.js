const mongoose=require('mongoose');
const schema=new mongoose.Schema({username:{type:String,unique:true,required:true,trim:true},passwordHash:{type:String,required:true},wallet:{type:Number,default:0,min:0}},{timestamps:true});
module.exports=mongoose.model('User',schema);