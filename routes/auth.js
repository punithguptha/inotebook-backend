const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// POST: https://localhost:3000/api/auth/createuser.
// Desc: Creates a user with the provided details
router.post("/createuser", [body("email", "Enter a valid Email").isEmail(), body("name", "Min length of name required is 3").isLength({ min: 3 }), body("password", "Password should atleast be 5 characters long").isLength({ min: 5 })], 
async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ errors: valResult.array() });
  }
  //Check whether user with same email exists already
  try {
    let userExists=await User.findOne({"email":req.body.email});
    if(userExists){
      return res.status(400).json({"error":"User with same email exists already!"});
    }
    let user = new User(req.body);
    await user.save();
    return res.json({"User":user});
  } catch (error) {
   res.status(500).json({"error":"Some error occured"}); 
  }
});

module.exports = router;
