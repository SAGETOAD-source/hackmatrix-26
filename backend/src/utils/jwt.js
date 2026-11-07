const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer: "threatlens-api",
      audience: "threatlens-client",
    }
  );
}

module.exports = {
  generateToken,
};