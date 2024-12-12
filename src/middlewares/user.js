const jwt = require("jsonwebtoken");
const {JWT_USER_PASS} = require("../config")


function userMiddleware(req, res, next){
    const token = req.headers["authorization"];
    // if (!header) {
    //     return res.status(401).json({ message: "Authorization header is missing" });
    // }
   
    if (!token) {
        console.log("token missing")
        return (
            res.status(401).json({ message: "Token is missing" })
        );
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_PASS);
        req.id = decoded.id;
        console.log("Token:", token); 
        next();
    } catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({ message: "Invalid token" });
    }

}

module.exports = {
    userMiddleware
}