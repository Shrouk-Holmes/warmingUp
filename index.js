const express = require('express')
const connectToDB = require("./config/connectToDB.js");

require("dotenv").config()
connectToDB()
const app = express();
app.use(express.json());
 

app.use(express.json());

app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/cart", require("./routes/cartRoute.js"));
app.use("/api/proudcts", require("./routes/proudctRoute.js"));
app.use("/api/category", require("./routes/categoryRotes.js"));
app.use("/api/checkout", require("./routes/checkOutRoute"));


const PORT = process.env.PORT ||5001
app.listen(PORT, () => 
    console.log(
        `server is runningin ${process.env.NODE_ENV} mode on port ${PORT}`
     )
);