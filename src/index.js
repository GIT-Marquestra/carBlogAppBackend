const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const cors = require("cors");
const app = express();
app.use(express.json())
app.use(cors({ origin: "http://localhost:5173" }));
dotenv.config();

const { userRouter } = require("./routes/user")
const { blogRouter } = require("./routes/blog")


const port = 3000;


app.use("/user", userRouter);
app.use("/blog", blogRouter);


console.log(process.env.MONGO_URL)
async function listen(){
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(port, () => {
        console.log(`Listening on port: ${port}`)
    }) 
}

listen();