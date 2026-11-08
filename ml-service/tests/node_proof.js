const path = require("path");

process.env.ML_SERVICE_URL = "http://127.0.0.1:8000";

const mlServicePath = path.resolve(
  __dirname,
  "../../../hm-main-readonly/backend/src/services/ml.service.js"
);
const { predictUrl } = require(mlServicePath);

const urls = [
  "https://www.google.com",
  "https://github.com/user/repo/issues/12",
  "http://paypal-secure-login.account-verify.xyz/signin",
  "http://193.42.33.145/login/verify.php?id=1&x=2",
];

async function main() {
  for (const url of urls) {
    const result = await predictUrl(url);
    console.log(JSON.stringify({ url, ...result }, null, 2));
  }
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});

