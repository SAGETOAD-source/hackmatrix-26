const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/auth.controller");

const validate = require("../middleware/validate.middleware");
const authenticateToken = require("../middleware/auth.middleware");

const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validators");

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected route
router.get("/me", authenticateToken, getMe);

module.exports = router;