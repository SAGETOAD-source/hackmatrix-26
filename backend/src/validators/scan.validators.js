const { z } = require("zod");

const createScanSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .url("Enter a valid URL")
    .refine(
      (value) => ["http:", "https:"].includes(new URL(value).protocol),
      "Only HTTP and HTTPS URLs are supported"
    ),
});

module.exports = { createScanSchema };