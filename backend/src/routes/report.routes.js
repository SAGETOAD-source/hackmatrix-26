const express = require("express");
const validate = require("../middleware/validate.middleware");
const { createReportSchema } = require("../validators/report.validators");
const {
  createReport,
  getReports,
  getReportById
} = require("../controllers/report.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", validate(createReportSchema), createReport);
router.get("/", getReports);
router.get("/:id", getReportById);

module.exports = router;