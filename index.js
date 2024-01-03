//This is the entry point of our application

const connectToMongo = require("./db");
const express = require("express");

connectToMongo();
const app = express();
const port = 5555;

//Middleware to accept and return json content in a request
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Daisy!");
});

//Exposing the available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`Example application listening at http://localhost:${port}`);
});
