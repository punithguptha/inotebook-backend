const express = require("express");
const User = require("../models/User");
const router = express.Router();
const {body,validationResult}=require('express-validator');



router.post("/",[body('email',"Enter a valid Email").isEmail(),body('name',"Min length of name required is 3").isLength({min:3}),body('password',"Password should atleast be 5 characters long").isLength({min:5})], (req, res) => {
  const valResult=validationResult(req);
  if(!valResult.isEmpty()){
    return res.status(400).json({'errors':valResult.array()})
  }
  let user = new User(req.body);
//  user.save();
  user.save().then(user=>res.json(user)).catch(err => {
    res.json({'error':"Duplicate email entry detected!!",'message':err.message});
  });
});

module.exports = router;