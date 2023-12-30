//File to perform database related operations

require('dotenv').config();
const mongoose = require('mongoose');

const mongoConnStr=process.env.MONGO_CONN_STR;
const connectToMongo = ()=>{
    mongoose.connect(mongoConnStr).then(()=>{
        console.log("Succesfully connected to mongo..");
    }).catch((error)=>{
        console.log("Connection failed!!");
    });
}

module.exports=connectToMongo;