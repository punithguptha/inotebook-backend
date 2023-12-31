const express=require('express');
const User = require('../models/User');
const router=express.Router();

router.post('/',(req,res)=>{
    console.log(req.body);
    let user=new User(req.body);
    user.save(); //Saves to mongodb
});

module.exports=router;