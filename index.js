const express = require('express')
const connectToDB = require("./config/connectToDB.js");

require("dotenv").config()
connectToDB()
const app = express();
app.use(express.json());
 

app.use(express.json());

app.use("/api/auth", require("./routes/authRoute"));


const PORT = process.env.PORT ||5001
app.listen(PORT, () => 
    console.log(
        `server is runningin ${process.env.NODE_ENV} mode on port ${PORT}`
     )
);