// Tambahkan di paling atas file
require("dotenv").config({ path: ".env" }); // Path ke .env file

const { startBotServer } = require("../lib/bot/server");
const { monitorSessions } = require("./monitor-sessions");

console.log("🖨️ Starting Print Server...");
console.log(
  "Token from env:",
  process.env.TELEGRAM_BOT_TOKEN ? "Exists" : "Missing"
); // Debug

startBotServer(process.env.TELEGRAM_BOT_TOKEN)
  .then(() => {
    console.log("✅ Bot server is running!");

    // Also start session monitoring
    monitorSessions();
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
