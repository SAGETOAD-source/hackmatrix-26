const { generateToken } = require("../utils/jwt");
const {
  registerUser,
  loginUser,
} = require("../services/auth.service");

function formatErrorDetails(error) {
  if (!error) return "Unknown error";

  // AggregateError from Node net.afterConnectMultiple
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    const subMessages = error.errors.map(e => e.message || e.code || String(e)).join(", ");
    return `${error.name || "AggregateError"}: ${subMessages}`;
  }

  if (error.message) {
    let msg = error.message;
    if (error.code) msg += ` (Code: ${error.code})`;
    if (error.detail) msg += ` (Detail: ${error.detail})`;
    return msg;
  }

  return String(error);
}

function isDatabaseConnectionError(error) {
  const code = error?.code;
  const msg = error?.message || "";
  const subErrors = Array.isArray(error?.errors) ? error.errors : [];

  const check = (c, m) =>
    c === "ECONNREFUSED" ||
    c === "ETIMEDOUT" ||
    c === "EACCES" ||
    c === "ENOTFOUND" ||
    c === "28P01" || // auth failed
    c === "3D000" || // database does not exist
    /connection|connect|database|ECONNREFUSED/i.test(m);

  if (check(code, msg)) return true;
  return subErrors.some(sub => check(sub?.code, sub?.message));
}

async function register(req, res) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    const formattedMsg = formatErrorDetails(error);
    console.error("Registration error:", formattedMsg);
    if (process.env.NODE_ENV !== "production" && error.stack) {
      console.error(error.stack);
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    if (error.code === "PASSWORD_TOO_LONG") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({
        success: false,
        message: "Database service unavailable. Ensure PostgreSQL is running on port " + (process.env.DB_PORT || 5432),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function login(req, res) {
  try {
    const user = await loginUser(req.body);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
        tokenType: "Bearer",
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      },
    });
  } catch (error) {
    const formattedMsg = formatErrorDetails(error);
    console.error("Login error:", formattedMsg);
    if (process.env.NODE_ENV !== "production" && error.stack) {
      console.error(error.stack);
    }

    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({
        success: false,
        message: "Database service unavailable. Ensure PostgreSQL is running on port " + (process.env.DB_PORT || 5432),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getMe(req, res) {
  try {
    const pool = require("../config/database");

    const result = await pool.query(
      `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    const formattedMsg = formatErrorDetails(error);
    console.error("Get profile error:", formattedMsg);
    if (process.env.NODE_ENV !== "production" && error.stack) {
      console.error(error.stack);
    }

    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({
        success: false,
        message: "Database service unavailable. Ensure PostgreSQL is running on port " + (process.env.DB_PORT || 5432),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  formatErrorDetails,
  isDatabaseConnectionError,
};
