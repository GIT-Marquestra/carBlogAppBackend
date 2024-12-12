const { Schema, default: mongoose } = require("mongoose");

const userSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    hashedPassword: String,
    userpfp: String

})

const blogSchema = new Schema({
    title: String,
    description: String,
    imgURL: String,
    creatorId: String
}) //,{timestamps: true}

const userModel = mongoose.model("user", userSchema);
const blogModel = mongoose.model("blog", blogSchema);

module.exports = {
    userModel,
    blogModel
}
