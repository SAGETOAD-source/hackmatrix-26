const express = require("express");

const {
  register,
  login,
} = require("../controllers/auth.controller");

const validate = require("../middleware/validate.middleware");

const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validators");

const router = express.Router();

// POST /api/v1/auth/register
router.post(
  "/register",
  validate(registerSchema),
  register
);

// POST /api/v1/auth/login
router.post(
  "/login",
  validate(loginSchema),
  login
);

module.exports = router;