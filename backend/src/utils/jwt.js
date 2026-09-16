const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

function signToken(userId) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "30d" });
}

function verifyToken(token) {
  const payload = jwt.verify(token, SECRET);
  return payload.sub;
}

module.exports = { signToken, verifyToken };
