const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Transaction = require('../models/Transaction');

const app = express();
app.use(express.json({ limit: '12mb' }));

let dbPromise = null;
async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in Vercel Environment Variables');
  if (mongoose.connection.readyState === 1) return;
  if (!dbPromise) {
    dbPromise = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .catch(err => { dbPromise = null; throw err; });
  }
  await dbPromise;
}

// Vercel rewrites /api/* to this function. Strip /api before Express routing.
app.use((req, res, next) => {
  if (req.url === '/api') req.url = '/';
  else if (req.url.startsWith('/api/')) req.url = req.url.slice(4);
  next();
});

app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (e) { console.error('MongoDB:', e); res.status(503).json({ ok: false, error: 'Database connection failed', details: e.message }); }
});

const SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_JWT_SECRET';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'deoxy';

const products = [
['Wireless Earbuds',45,'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80'],['Smart Watch',60,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'],['Travel Backpack',55,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'],['Running Shoes',70,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],['Coffee Mug',20,'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80'],['Bluetooth Speaker',50,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80'],['Laptop Stand',40,'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80'],['Sunglasses',35,'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80'],['Desk Lamp',30,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'],['Water Bottle',25,'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'],['Mechanical Keyboard',65,'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80'],['Massage Pillow',55,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'],['Yoga Mat',35,'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=80'],['Power Bank',45,'https://images.unsplash.com/photo-1609592424936-3a5e1e2a2f2f?auto=format&fit=crop&w=900&q=80'],['LED Strip Light',30,'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=900&q=80'],['Travel Tumbler',28,'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80'],['Phone Holder',22,'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80'],['Fitness Band',48,'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?auto=format&fit=crop&w=900&q=80'],['Bluetooth Mouse',32,'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80'],['Portable Fan',26,'https://images.unsplash.com/photo-1583221295888-2d9f3e3e6d0a?auto=format&fit=crop&w=900&q=80']
];

function makeToken(payload, expiresIn) { return jwt.sign(payload, SECRET, { expiresIn }); }
function auth(req,res,next){ try { const h=req.headers.authorization||''; if(!h.startsWith('Bearer ')) throw 0; req.user=jwt.verify(h.slice(7),SECRET); next(); } catch { res.status(401).json({ok:false,error:'Unauthorized'}); } }
function admin(req,res,next){ if(req.user?.role!=='admin') return res.status(403).json({ok:false,error:'Admin only'}); next(); }

app.get('/transactions',auth,async(req,res)=>{if(req.user.role!=='user')return res.status(403).json({ok:false,error:'User only'});const tx=await Transaction.find({userId:req.user.id}).sort({createdAt:-1}).populate('submissionId','taskId');res.json(tx);});
app.get('/health',(req,res)=>res.json({ok:true,database:mongoose.connection.readyState===1}));

app.post('/auth/register', async (req,res)=>{
  try {
    const username=String(req.body?.username||'').trim().toLowerCase();
    const password=String(req.body?.password||'');
    if(!/^[a-z0-9_]{3,30}$/.test(username)) return res.status(400).json({ok:false,error:'Username must be 3-30 characters using letters, numbers or underscore.'});
    if(password.length<6) return res.status(400).json({ok:false,error:'Password must be at least 6 characters.'});
    const exists=await User.findOne({username}).lean();
    if(exists) return res.status(409).json({ok:false,error:'Username already registered. Please login.'});
    const u=await User.create({username,passwordHash:await bcrypt.hash(password,12),wallet:0});
    return res.status(201).json({ok:true,message:'Registration successful',token:makeToken({role:'user',id:String(u._id),username:u.username},'7d'),user:{id:String(u._id),username:u.username,wallet:u.wallet}});
  } catch(e) { console.error('REGISTER:',e); return res.status(500).json({ok:false,error:'Registration failed. '+(e.code===11000?'Username already registered.':'Please try again.')}); }
});

app.post('/auth/login',async(req,res)=>{
  try { const username=String(req.body?.username||'').trim().toLowerCase(),password=String(req.body?.password||''); const u=await User.findOne({username}); if(!u||!(await bcrypt.compare(password,u.passwordHash))) return res.status(401).json({ok:false,error:'Invalid username or password'}); res.json({ok:true,token:makeToken({role:'user',id:String(u._id),username:u.username},'7d'),user:{id:String(u._id),username:u.username,wallet:u.wallet}}); }
  catch(e){console.error('LOGIN:',e);res.status(500).json({ok:false,error:'Login failed. Please try again.'});}
});
app.post('/auth/admin-login',(req,res)=>{if(String(req.body?.username||'')===ADMIN_USER&&String(req.body?.password||'')===ADMIN_PASS)return res.json({ok:true,token:makeToken({role:'admin',username:ADMIN_USER},'8h')});res.status(401).json({ok:false,error:'Invalid admin credentials'});});

app.get('/tasks',async(req,res)=>{let ts=await Task.find({active:true}).sort({_id:1});if(ts.length!==20){await Task.deleteMany({});await Task.insertMany(products.map((p,i)=>({title:`Review Task ${i+1}: ${p[0]}`,product:p[0],imageUrl:p[2],reward:p[1],durationSeconds:30,description:`Give genuine feedback about ${p[0]} based on your real experience or the supplied product information, then upload proof of the completed review activity.`})));ts=await Task.find({active:true}).sort({_id:1});}res.json(ts);});
app.get('/me',auth,async(req,res)=>{if(req.user.role!=='user')return res.status(403).json({ok:false,error:'User only'});const u=await User.findById(req.user.id).select('username wallet');if(!u)return res.status(404).json({ok:false,error:'User not found'});const s=await Submission.find({userId:req.user.id}).populate('taskId','title product reward').sort({submittedAt:-1});res.json({user:u,submissions:s});});
app.post('/submissions',auth,async(req,res)=>{try{if(req.user.role!=='user')return res.status(403).json({ok:false,error:'User only'});const {taskId,review,proofData}=req.body||{};if(!taskId||!String(review||'').trim()||String(review).trim().length<20||!proofData)return res.status(400).json({ok:false,error:'Task, genuine review and proof are required'});const task=await Task.findById(taskId);if(!task)return res.status(404).json({ok:false,error:'Task not found'});const exists=await Submission.findOne({userId:req.user.id,taskId,status:{$in:['under_review','approved']}});if(exists)return res.status(409).json({ok:false,error:'Task already submitted'});const s=await Submission.create({userId:req.user.id,taskId,review:String(review).trim(),proofData});res.status(201).json({ok:true,id:String(s._id),status:s.status});}catch(e){console.error(e);res.status(400).json({ok:false,error:e.message});}});
app.get('/admin/submissions',auth,admin,async(req,res)=>res.json(await Submission.find().populate('userId','username wallet').populate('taskId','title product reward').sort({submittedAt:-1})));
app.post('/admin/submissions/:id/approve',auth,admin,async(req,res)=>{const session=await mongoose.startSession();try{session.startTransaction();const s=await Submission.findById(req.params.id).populate('taskId','reward').session(session);if(!s||s.status!=='under_review')throw Error('Submission already reviewed or not found');s.status='approved';s.reviewedAt=new Date();await s.save({session});await User.findByIdAndUpdate(s.userId,{$inc:{wallet:s.taskId.reward}},{session});await Transaction.create([{userId:s.userId,submissionId:s._id,amount:s.taskId.reward}],{session});await session.commitTransaction();res.json({ok:true,credited:s.taskId.reward});}catch(e){await session.abortTransaction();res.status(400).json({ok:false,error:e.message});}finally{session.endSession();}});
app.post('/admin/submissions/:id/reject',auth,admin,async(req,res)=>{const s=await Submission.findOneAndUpdate({_id:req.params.id,status:'under_review'},{$set:{status:'rejected',rejectionReason:req.body?.reason||'Proof/review could not be verified.',reviewedAt:new Date()}},{new:true});if(!s)return res.status(400).json({ok:false,error:'Submission already reviewed or not found'});res.json({ok:true});});

module.exports=app;
if(require.main===module){connectDB().then(()=>app.listen(process.env.PORT||3000)).catch(e=>{console.error(e);process.exit(1);});}
