const mongoose=require('mongoose');
const { Schema } = mongoose;

const notesSchema=new Schema({
    // User here is a foreign key mapping to user model
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tags:{
        type:[String],
        default:["General"]
    },
    date:{
        type:Date,
        default:Date.now
    }
});


const Notes=mongoose.model('Notes',notesSchema);
module.exports=Notes;