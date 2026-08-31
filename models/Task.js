const mongoose=require('mongoose');
const schema=new mongoose.Schema({title:String,product:String,imageUrl:String,reward:{type:Number,min:0},durationSeconds:{type:Number,default:30},description:String,active:{type:Boolean,default:true}},{timestamps:true});
module.exports=mongoose.model('Task',schema);