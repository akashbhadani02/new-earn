const express=require('express'),path=require('path'),jwt=require('jsonwebtoken'),bcrypt=require('bcryptjs'),mongoose=require('mongoose');
const User=require('./models/User'),Task=require('./models/Task'),Submission=require('./models/Submission'),Transaction=require('./models/Transaction');
const app=express(),PORT=process.env.PORT||3000,SECRET=process.env.JWT_SECRET||'CHANGE_ME';
app.use(express.json({limit:'10mb'}));app.use(express.static(path.join(__dirname,'../public')));

let dbPromise;
async function connectDB(){
  if(!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if(mongoose.connection.readyState===1) return;
  if(!dbPromise) dbPromise=mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000}).catch(err=>{dbPromise=null;throw err});
  await dbPromise;
}
app.use(async (req,res,next)=>{
  if(req.path.startsWith('/api/')){
    try{await connectDB();return next()}catch(e){console.error('MongoDB connection error:',e.message);return res.status(503).json({error:'Database connection failed',details:e.message})}
  }
  next();
});

const ADMIN_USER=process.env.ADMIN_USER||'admin',ADMIN_PASS=process.env.ADMIN_PASSWORD||'deoxy';
const products=[
['Wireless Earbuds',45,'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80'],
['Smart Watch',60,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'],
['Travel Backpack',55,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'],
['Running Shoes',70,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
['Coffee Mug',20,'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80'],
['Bluetooth Speaker',50,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80'],
['Laptop Stand',40,'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80'],
['Sunglasses',35,'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80'],
['Desk Lamp',30,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'],
['Water Bottle',25,'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'],
['Mechanical Keyboard',65,'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80'],
['Massage Pillow',55,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'],
['Yoga Mat',35,'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=80'],
['Power Bank',45,'https://images.unsplash.com/photo-1609592424936-3a5e1e2a2f2f?auto=format&fit=crop&w=900&q=80'],
['LED Strip Light',30,'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=900&q=80'],
['Travel Tumbler',28,'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80'],
['Phone Holder',22,'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80'],
['Fitness Band',48,'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?auto=format&fit=crop&w=900&q=80'],
['Bluetooth Mouse',32,'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80'],
['Portable Fan',26,'https://images.unsplash.com/photo-1583221295888-2d9f3e3e6d0a?auto=format&fit=crop&w=900&q=80']
];
function auth(req,res,next){try{const h=req.headers.authorization||'';if(!h.startsWith('Bearer '))throw 0;req.user=jwt.verify(h.slice(7),SECRET);next()}catch(e){res.status(401).json({error:'Unauthorized'})}}
function admin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({error:'Admin only'});next()}
app.post('/api/auth/admin-login',(req,res)=>{if(req.body.username===ADMIN_USER&&req.body.password===ADMIN_PASS)return res.json({token:jwt.sign({role:'admin',username:ADMIN_USER},SECRET,{expiresIn:'8h'})});res.status(401).json({error:'Invalid admin credentials'})});
app.post('/api/auth/register',async(req,res)=>{try{const {username,password}=req.body;if(!username||!password||password.length<6)return res.status(400).json({error:'Username and password (6+ chars) required'});const u=await User.create({username,passwordHash:await bcrypt.hash(password,12)});res.json({id:u._id,username:u.username})}catch(e){res.status(400).json({error:'Username already exists'})}});
app.post('/api/auth/login',async(req,res)=>{const u=await User.findOne({username:req.body.username});if(!u||!(await bcrypt.compare(req.body.password,u.passwordHash)))return res.status(401).json({error:'Invalid login'});res.json({token:jwt.sign({role:'user',id:String(u._id),username:u.username},SECRET,{expiresIn:'7d'})})});
app.get('/api/tasks',async(req,res)=>{let ts=await Task.find({active:true}).sort({_id:1});if(ts.length<20){await Task.deleteMany({});await Task.insertMany(products.map((p,i)=>({title:`Review Task ${i+1}: ${p[0]}`,product:p[0],imageUrl:p[2],reward:p[1],durationSeconds:30,description:`Give genuine feedback about ${p[0]} based on your real experience or the supplied product information, then upload proof of the completed review activity.`})));ts=await Task.find({active:true}).sort({_id:1})}res.json(ts)});
app.get('/api/me',auth,async(req,res)=>{if(req.user.role!=='user')return res.status(403).json({error:'User only'});const u=await User.findById(req.user.id).select('username wallet');const s=await Submission.find({userId:req.user.id}).populate('taskId','title product reward').sort({submittedAt:-1});res.json({user:u,submissions:s})});
app.post('/api/submissions',auth,async(req,res)=>{try{if(req.user.role!=='user')return res.status(403).json({error:'User only'});const {taskId,review,proofData}=req.body;if(!taskId||!review||review.trim().length<20||!proofData)return res.status(400).json({error:'Task, genuine review and proof are required'});const exists=await Submission.findOne({userId:req.user.id,taskId,status:{$in:['under_review','approved']}});if(exists)return res.status(409).json({error:'Task already submitted'});const s=await Submission.create({userId:req.user.id,taskId,review:review.trim(),proofData});res.json({id:s._id,status:s.status})}catch(e){res.status(400).json({error:e.message})}});
app.get('/api/admin/submissions',auth,admin,async(req,res)=>{const s=await Submission.find().populate('userId','username wallet').populate('taskId','title product reward').sort({submittedAt:-1});res.json(s)});
app.post('/api/admin/submissions/:id/approve',auth,admin,async(req,res)=>{const session=await mongoose.startSession();try{session.startTransaction();const s=await Submission.findById(req.params.id).populate('taskId','reward').session(session);if(!s||s.status!=='under_review')throw Error('Submission already reviewed or not found');s.status='approved';s.reviewedAt=new Date();await s.save({session});await User.findByIdAndUpdate(s.userId,{$inc:{wallet:s.taskId.reward}},{session});await Transaction.create([{userId:s.userId,submissionId:s._id,amount:s.taskId.reward}],{session});await session.commitTransaction();res.json({ok:true,credited:s.taskId.reward})}catch(e){await session.abortTransaction();res.status(400).json({error:e.message})}finally{session.endSession()}});
app.post('/api/admin/submissions/:id/reject',auth,admin,async(req,res)=>{const s=await Submission.findOneAndUpdate({_id:req.params.id,status:'under_review'},{$set:{status:'rejected',rejectionReason:req.body.reason||'Proof/review could not be verified.',reviewedAt:new Date()}},{new:true});if(!s)return res.status(400).json({error:'Submission already reviewed or not found'});res.json({ok:true})});
app.get('/api/health',(req,res)=>res.json({ok:true,database:mongoose.connection.readyState===1}));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));

if(require.main===module){ensureDb().catch(e=>console.error('MongoDB connection:',e.message));app.listen(PORT,()=>console.log(`EarnFlow running on ${PORT}`));}
module.exports=app;
