// bot-runner.js (file baru di root)
require("dotenv").config(); // Load environment variables

console.log("🚀 Starting Telegram Bot (Polling Mode)...");

// Import bot dari struktur baru
const { startBotServer } = require("./bot/index");

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error("❌ TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

// Start bot saja, tanpa Next.js
startBotServer(botToken)
  .then(() => {
    console.log("✅ Bot server is running in POLLING mode!");
  })
  .catch((error) => {
    console.error("❌ Failed to start bot:", error);
    process.exit(1);
  });
