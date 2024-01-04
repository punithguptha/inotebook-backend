const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt=require('jsonwebtoken');
const fetchuser=require("../middlewares/fetchuser");
/* 
    POST: http://localhost:5555/api/auth/createuser.
    Description: Creates a user with the provided details
*/
router.post("/createuser", [body("email", "Enter a valid Email").isEmail(), body("name", "Min length of name required is 3").isLength({ min: 3 }), body("password", "Password should atleast be 5 characters long").isLength({ min: 5 })], async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ errors: valResult.array() });
  }
  //Check whether user with same email exists already
  try {
    let userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ error: "User with same email exists already!" });
    }
    let safePassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({ name: req.body.name, email: req.body.email, password: safePassword });
    await user.save();
    const privateKey=process.env.PRIVATE_KEY?process.env.PRIVATE_KEY:"defaultprivate@key";
    const authToken=await jwt.sign( {user:{id: user.id }},privateKey);
    return res.json({"authToken":authToken});
  } catch (error) {
    res.status(500).json({ error: "Some error occured" });
  }
});


/** 
 * POST: http://localhost:5555/api/auth/login
 * Description: Authenticate a user. Login is not required to access this api
*/
router.post("/login",[body("email","Enter a valid Email").isEmail(),body("password","Password shouldnt be empty").notEmpty()], async(req,res)=>{
    const valResult=validationResult(req);
    if(!valResult.isEmpty()){
        return res.status(400).json({"errors":valResult.array()});
    }
    const {email,password}=req.body;
    try {
        let user=await User.findOne({"email":email});
        if(!user){
            return res.status(400).json({"errors":"Please try to login with correct credentials"});
        }
        var passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({"errors":"Please try to login with correct credentials"});
        }
        const privateKey=process.env.PRIVATE_KEY?process.env.PRIVATE_KEY:"defaultprivate@key";
        const authToken=jwt.sign( {user:{id: user.id }},privateKey);
        return res.json({"authToken":authToken});
    } catch (error) {
        res.status(500).json({"error":"Internal Server Error"});
    }
});


/**
 * POST: http://localhost:5555/api/auth/getuser
 * Description: Get user details. Login required
 */

router.post("/getuser",fetchuser,async (req,res)=>{
    var userId=req.user.id;
    try {
        //This will return all the user object fields except password
        var user=await User.findById(userId).select("-password");
        if(!user){
            res.status(400).json({"error":"Invalid user!"});
        }else{
            res.status(200).send(user);
        }
    } catch (error) {
        res.status(500).send({"error":"Internal Server Error"});
    }
});

module.exports = router;
