const bcrypt = require("bcrypt");
const { userModel } = require("../db.js");
const { blogModel } = require("../db.js")
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { userMiddleware } = require("../middlewares/user.js")
const express = require("express");
const app = express();

app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {

    // console.log("Hi")
    const userpfp = "src/assets/Default_pfp.jpg";
    // console.log("Request body: ", req.body);
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        username: z.string().min(3).max(100),
        password: z.string().min(3).max(100),
    })

    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    if (!parsedDataWithSuccess.success) {
        console.error("Validation Error: ", parsedDataWithSuccess.error.issues);
        res.status(400).json({
            message: "Incorrect Format",
            errors: parsedDataWithSuccess.error.issues, // Detailed errors
        });
        return;
    }

    console.log(parsedDataWithSuccess)

    const { email, password, username } = parsedDataWithSuccess.data;
    // const { email, password, username } = req.body;
    console.log(email)
    console.log(password)
    console.log(username)
    const hashedPassword = await bcrypt.hash(password, 5);

    try{
        console.log("hihihi")
        await userModel.create({
            email,
            hashedPassword,
            username,
            userpfp
        })
        console.log("Signed Up")
        res.status(201).json({
            message: "User signed up!",
            nameOfUser: username,
            userpfp

        })

    } catch(error) {
        console.log("Error: ", error)
        res.json({
            message: "Cannot sign up"
        })
    }

   
})

userRouter.post("/check", userMiddleware, async (req, res) => {
    const creatorId = req.id;
    console.log(req.body)
    const { inPass } = req.body;
    console.log(inPass)
    const foundUser = await userModel.findOne({
        _id: creatorId
    })
    console.log(foundUser.hashedPassword)
    try {
        const isPass = await bcrypt.compare(inPass, foundUser.hashedPassword)
        console.log("HI")

        if(!isPass){
            return res.status(403).json({
                message: "Incorrect Credentials!"
            })
        } 
        res.status(201).json({
            message: "Verified"
        })
        console.log("Verified")
            
    } catch (error) {
        console.error(error)
        
    }
    

})

userRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;


    try{

        const foundUser = await userModel.findOne({
            email: email
        })
    
        const isPassValid = await bcrypt.compare(password, foundUser.hashedPassword)
        // console.log(isPassValid)
    
        if(!isPassValid){
            return res.status(403).json({
                message: "Incorrect Credentials!"
            })
        }
        // const options = {
        //     expiresIn: '1h', 
        //   };
    
        const token = jwt.sign(
            { id: foundUser._id },
            process.env.JWT_USER_PASS,
            { expiresIn: '7d' } // Token expires in 7 days
        );
        // console.log(token)
        console.log("user signed in")
        return res.json({ // sending the relevant creds so that it can be rendered as by-default.
            token: token,
            username: foundUser.username,
            userpfp: foundUser.userpfp,
            email: foundUser.email,
            password: password
        })
    } catch(error){
        console.error("Error while signing in: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }


})

// to create a blog user has to first signup/signin....
userRouter.post("/createBlog", userMiddleware, async (req, res) => {

    const creatorId = req.id;
    const { title, description, imgURL } = req.body;

    const blog = await blogModel.create({
        title,
        description,
        imgURL,
        creatorId
    })

    console.log(blog)

    res.json({
        message: "Blog created",
        blogId: blog._id // assigning blogId
    })
    
})

// for editing the blog post.
userRouter.put("/profileUp", userMiddleware, async (req, res) => {
    const creatorId = req.id;
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        username: z.string().min(3).max(100),
        password: z.string().min(3).max(100)
    })

    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    if(!parsedDataWithSuccess.success){
        res.json({
            message: "Incorrect Format"
        })
        return 
    }

    // console.log(parsedDataWithSuccess)

    var { email, password, username, userpfp } = req.body;
    console.log(email)
    console.log(password)
    console.log(username)
    const hashedPassword = await bcrypt.hash(password, 5);

    const found = await userModel.findOne({
        _id: creatorId
    })

    if(!email){
        email = found.email;
    }
    if(!username){
        username = found.username;
    }
    if(!userpfp || userpfp === ""){
        if(found.userpfp){
            userpfp = found.userpfp;
        } else {
            userpfp = ""
        }
    }

    const updatedUser = await userModel.updateOne({
        _id: creatorId
    }, {
        username,
        email,
        hashedPassword,
        userpfp
    })

    console.log(updatedUser)
    console.log(userpfp)

    res.status(201).json({
        message: "Blog updated successfully!",
        updatedUser,
        userpfp
    })


})

userRouter.get("/allBlogs", async (req, res) => {

    try{
    
        const allBlogs = await blogModel.find()
        if (!Array.isArray(allBlogs)) {
            console.error("Data is not an array. Returning an empty array.");
            return res.json([]);
        }
        console.log("found it")

        // console.log("Hi")
        // console.log(typeof(allBlogs))
        // console.log(allBlogs)
        return res.json(allBlogs)
    } catch(error){
        console.log(`Error: ${error}`)
        res.status(500).json({
            error: "Failed to fetch blogs."
        })
    }
})

userRouter.get("/userBlogs", userMiddleware, async (req, res) => {
    const creatorId = req.id;
    const myBlogs = await blogModel.find({
        creatorId: creatorId // it finds on the basis of this creatorid. 
    })
    if (!Array.isArray(myBlogs)) {
        console.error("Data is not an array. Returning an empty array.");
        return res.json([]);
    }

    // console.log(myBlogs)

    res.json(myBlogs)
    
})

userRouter.delete("/delete/:id", userMiddleware, async (req, res) => {
    const creatorId = req.id;  
    const blogId = req.params.id;
    console.log(`creatorId: ${creatorId}`)
    console.log(`blogId: ${blogId}`)
    try{
        const blogToDelete = await blogModel.findOneAndDelete({
            _id: blogId,
            creatorId: creatorId
        })
        console.log("Hi")
        if(!blogToDelete){
            return res.status(404).json({ message: 'Blog post not found' });
        }
        res.status(200).json({ message: 'Blog post deleted successfully' });
        console.log(blogToDelete)
    } catch (error){
        console.error(error)
        res.status(500).json({ message: 'Server error' });
    }

})

module.exports = {
    userRouter: userRouter
}