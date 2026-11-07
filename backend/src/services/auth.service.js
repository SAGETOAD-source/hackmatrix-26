const bcrypt = require("bcrypt");
const pool = require("../config/database");

const SALT_ROUNDS = 12;

async function registerUser({ name, email, password }) {
  if (Buffer.byteLength(password, "utf8") > 72) {
    const error = new Error("Password cannot exceed 72 bytes");
    error.code = "PASSWORD_TOO_LONG";
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, role, created_at
  `;

  const result = await pool.query(query, [
    name,
    email,
    passwordHash,
  ]);

  return result.rows[0];
}


async function loginUser({ email, password }) {
  const query = `
    SELECT id, name, email, password_hash, role, created_at
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  if (result.rowCount === 0) {
    return null;
  }

  const user = result.rows[0];

  // Reject passwords exceeding bcrypt's 72-byte limit.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    return null;
  }

  // Never expose the password hash.
  const { password_hash, ...safeUser } = user;

  return safeUser;
}

module.exports = {
  registerUser,
  loginUser,
};