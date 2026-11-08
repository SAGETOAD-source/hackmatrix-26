
const { rateLimit } = require("express-rate-limit");

const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isDev ? 100 : 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: isDev ? 100 : 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again after 1 hour.",
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
};
