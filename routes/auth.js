const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt=require('jsonwebtoken');

/* 
    POST: https://localhost:3000/api/auth/createuser.
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
    const authToken=jwt.sign( {user:{id: user.id }},privateKey);
    return res.json({"authToken":authToken});
  } catch (error) {
    res.status(500).json({ error: "Some error occured" });
  }
});

module.exports = router;
