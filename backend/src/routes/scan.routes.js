const express = require("express");

const {
  createScan,
  getScans,
  getScanById,
} = require("../controllers/scan.controller");

const authenticateToken = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createScanSchema } = require("../validators/scan.validators");

const router = express.Router();

router.use(authenticateToken);

router.post("/", validate(createScanSchema), createScan);
router.get("/", getScans);
router.get("/:id", getScanById);

module.exports = router;