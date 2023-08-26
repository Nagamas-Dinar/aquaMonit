const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return  res.json({ error:"Unauthorized" });; //Unauthorized
  // console.log(authHeader); //Bearer token
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // console.log(`Error: ${err}`);
    if (err) return res.json({ error:"Invalid Token" }) //invalid token
    
    req.user = decoded.userInfo.username;
    // console.log(req.user)
    req.roles = decoded.userInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
