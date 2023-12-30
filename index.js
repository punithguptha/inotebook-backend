//This is the entry point of our application

const connectToMongo=require('./db');
const express=require('express');

connectToMongo();
const app =express();
app.listen(3000);

app.get('/',(req,res)=>{
    res.send("Hello Daisy!");
})