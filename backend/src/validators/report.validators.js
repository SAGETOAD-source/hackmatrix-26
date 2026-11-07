const { z } = require("zod");

const createReportSchema = z.object({
  scanId: z.coerce.number()
    .int()
    .positive()
    .safe(),

  title: z.string()
    .trim()
    .min(1)
    .max(200),

  reportData: z.record(z.any())
});

module.exports = { createReportSchema };