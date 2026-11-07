const express = require("express");
const { getIntelligence } = require("../controllers/intelligence.controller");

const router = express.Router();

router.get("/", getIntelligence);

module.exports = router;