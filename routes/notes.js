const express = require("express");
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
const router = express.Router();
const fetchuser = require("../middlewares/fetchuser");

const customTagValidator = (value) => {
  if (value !== undefined && !Array.isArray(value)) {
    return false;
  }
  return true;
};

const customUpdateValidator = (value) => {
  const errors = [];
  console.log(value);
  //Checking for title validity if it exists
  if (value.title && value.title.length < 3) {
    errors.push({ field: "title", msg: "Min length of title field required is 3" });
  }
  //Checking if description exists it should be having min length 5
  if (value.description && value.description.length < 5) {
    errors.push({ field: "description", msg: "Min length of description should be 5" });
  }
  //Checking if tags are sent they should be sent in an array format
  if (value.tags && !Array.isArray(value.tags)) {
    errors.push({ field: "tags", msg: "tags field should be an array" });
  }
  if (errors.length) {
    throw new Error(JSON.stringify(errors));
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
    console.log(error);
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
    return res.status(400).json({ errors: JSON.parse(valResult.array()[0].msg) });
  }

  let userId = req.user.id;
  try {
    let note = new Note({
      user: userId,
      title: req.body.title,
      description: req.body.description,
    });
    if (req.body.tags) {
      note.tags = req.body.tags;
    }
    let savedNote = await note.save();
    res.status(200).send(savedNote);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

/**
 * PUT: http://localhost:5555/api/notes/updatenote/:id
 * Description: Find the note and check if the update of note is triggered by the owner of the note and if so update the note and return updated note back
 */
router.put("/updatenote/:id", fetchuser, [body().custom(customUpdateValidator)], async (req, res) => {
  const valResult = validationResult(req);
  const {title,description,tags}=req.body;
  if (!valResult.isEmpty()) {
    return res.status(400).json({ errors: JSON.parse(valResult.array()[0].msg) });
  }
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note not found");
    }

    var userId = req.user.id;
    console.log(note);
    if (userId != note.user.toString()) {
      return res.status(401).send("UnAuthorized");
    }

    let newNote = {};

    if (req.body.title) newNote.title = title;
    if (req.body.description) newNote.description = description;
    if (req.body.tags) newNote.tags = tags;

    let updatedNote = await Note.findByIdAndUpdate(req.params.id, newNote, { new: true });
    return res.status(200).json(updatedNote);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * DELETE: http://localhost:5555/api/notes/deletenote/:id
 * Description: Endpoint to delete a note with the id provided
 */
router.delete("/deletenote/:id",fetchuser,async (req,res)=>{
    try {
        let note=await Note.findById(req.params.id);
        if(!note){
            return res.status(404).send("Note not found");
        }
        console.log(note);
        console.log(req.user.id);
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not Authorized to delete this note!");
        }
        await Note.findByIdAndDelete(req.params.id);
        return res.status(200).json({"msg":`Succesfully deleted note with id ${req.params.id}` });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
