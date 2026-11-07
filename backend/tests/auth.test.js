require("dotenv").config();

const request = require("supertest");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

test("POST /api/v1/auth/register rejects invalid input", async () => {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "A",
      email: "invalid-email",
      password: "123",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Validation failed");
});
test("POST /api/v1/auth/register creates a new user", async () => {
  const uniqueEmail = `test.${Date.now()}@example.com`;

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "Test User",
      email: uniqueEmail,
      password: "TestPassword123!",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, uniqueEmail);
  assert.ok(response.body.data.user.id);
  assert.equal(response.body.data.user.password_hash, undefined);
});
test("POST /api/v1/auth/register rejects duplicate email", async () => {
  const email = `duplicate.${Date.now()}@example.com`;

  const payload = {
    name: "Duplicate Test",
    email,
    password: "TestPassword123!",
  };

  const firstResponse = await request(app)
    .post("/api/v1/auth/register")
    .send(payload);

  assert.equal(firstResponse.status, 201);

  const secondResponse = await request(app)
    .post("/api/v1/auth/register")
    .send(payload);

  assert.equal(secondResponse.status, 409);
  assert.equal(secondResponse.body.success, false);
});
test("POST /api/v1/auth/login authenticates a registered user", async () => {
  const email = `login.${Date.now()}@example.com`;

  await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "Login Test",
      email,
      password: "TestPassword123!",
    });

  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email,
      password: "TestPassword123!",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.token);
  assert.equal(response.body.data.user.email, email);
  assert.equal(response.body.data.user.password_hash, undefined);
});

test("POST /api/v1/auth/login rejects an incorrect password", async () => {
  const email = `wrong.${Date.now()}@example.com`;

  await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "Wrong Password Test",
      email,
      password: "CorrectPassword123!",
    });

  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email,
      password: "WrongPassword123!",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
test("GET /api/v1/auth/me rejects invalid token", async () => {
  const response = await request(app)
    .get("/api/v1/auth/me")
    .set("Authorization", "Bearer invalid.token.value");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});