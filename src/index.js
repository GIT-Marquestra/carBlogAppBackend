const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const cors = require("cors");
const app = express();
app.use(express.json())
dotenv.config();

const { userRouter } = require("./routes/user")
const { blogRouter } = require("./routes/blog")
const corsOptions = {
    origin: "https://car-blog-frontend-fj1u.vercel.app", // Update this to the frontend URL when deploying
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Specify allowed methods
    credentials: true, 
};
app.use(cors(corsOptions));

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