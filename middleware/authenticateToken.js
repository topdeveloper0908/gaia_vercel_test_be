const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET || "default-secret-key";

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  console.log({ token, headers: req.headers });
  if (!token)
    return res.status(401).json({ message: "Access denied. Token missing." });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
