// scripts/print-server.js
require("dotenv").config();

console.log("🖨️ Starting Print Server (Polling Mode)...");

// Import langsung dari bot, bukan dari server lama
const { startBotServer } = require("../bot/index");

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found");
  process.exit(1);
}

startBotServer(botToken)
  .then(() => {
    console.log("✅ Bot server is running!");

    // Start session monitoring jika diperlukan
    const { monitorSessions } = require("./monitor-sessions");
    monitorSessions();
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
