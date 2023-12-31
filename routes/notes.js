const express=require('express');
const router=express.Router();

router.get('/',(req,res)=>{
    res.send("This is Notes get api");
});


module.exports=router;