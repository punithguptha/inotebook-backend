const express = require("express");
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
const router = express.Router();
const fetchuser = require("../middlewares/fetchuser");


const customTagValidator=(value)=>{
    if(value!==undefined && !Array.isArray(value)){
        return false;
    }
    return true;
};

/**
 * GET: http://localhost:5555/api/notes/fetchnotes
 * Description: Get all the notes saved by a user. Login required
 */
router.get("/fetchnotes", fetchuser, async (req, res) => {
  const userId = req.user.id;
  try {
    const notes = await Note.find({ user: userId });
    res.status(200).send(notes);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

/**
 * POST: http://localhost:5555/api/notes/addnote
 * Description: Add a note from a user. Login Required
 */
router.post("/addnote", fetchuser, [body("title", "Title should have atleast 3 characters").isLength({ min: 3 }), body("description", "Description should have atleast 5 characters").isLength({ min: 5 }), body("tags", "Expecting an array").custom(customTagValidator)], async (req, res) => {
    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
      return res.status(400).json({ errors: valResult.array() });
    }

    var userId=req.user.id;
    try {
        let note=new Note({
            "user":userId,
            "title":req.body.title,
            "description":req.body.description
        });
        if(req.body.tags){
            note.tags=req.body.tags;
        }
        let savedNote=await note.save();
        res.status(200).send(savedNote);
    } catch (error) {
        res.status(500).send({"error":"Internal Server Error"});
    }
});

module.exports = router;
