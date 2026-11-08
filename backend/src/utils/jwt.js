const jwt = require("jsonwebtoken");

function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
    },
    secret,
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