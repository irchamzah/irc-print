// bot/index.js
const { Telegraf, session } = require("telegraf");
const { message } = require("telegraf/filters");

// Import session instance, bukan function
const { userSessions, startSessionCleanup } = require("./config/session");
const { testMidtransConnection } = require("./utils/midtransTest");

// Import handlers
const { handleStartCommand } = require("./handlers/commands/start");
const { handleFileCommand } = require("./handlers/commands/file");
const { handleSetPrintCommand } = require("./handlers/commands/setprint");
const { handlePayCommand } = require("./handlers/commands/pay");
const { handleStatusCommand } = require("./handlers/commands/status");
const {
  handleDebugCommand,
  handleDebugAllCommand,
} = require("./handlers/commands/debug");
const { handleDocumentUpload } = require("./handlers/messages/document");
const { handleTextMessage } = require("./handlers/messages/text");

async function startBotServer(botToken) {
  try {
    // Test koneksi terlebih dahulu
    console.log("🔑 Testing Midtrans connection...");
    const success = await testMidtransConnection();
    if (!success) {
      throw new Error("❌ Cannot start bot due to Midtrans connection issues");
    }

    const bot = new Telegraf(botToken);

    // Setup session middleware
    bot.use(session());

    // Setup command handlers
    bot.start(handleStartCommand);
    bot.command("file", (ctx) => handleFileCommand(ctx, ctx.message.text));
    bot.command("setprint", (ctx) =>
      handleSetPrintCommand(ctx, ctx.message.text)
    );
    bot.command("pay", handlePayCommand);
    bot.command("status", handleStatusCommand);
    bot.command("debug", handleDebugCommand);
    bot.command("debug_all", handleDebugAllCommand);

    // Setup message handlers
    bot.on(message("document"), handleDocumentUpload);
    bot.on(message("text"), handleTextMessage);

    // Error handling
    bot.catch((err, ctx) => {
      console.error("Bot error:", err);
      ctx.reply("❌ Terjadi error. Silakan coba lagi.");
    });

    // Start session cleanup
    startSessionCleanup();

    // Start bot
    await bot.launch();
    console.log("🤖 Telegram bot started successfully");

    return bot;
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
    process.exit(1);
  }
}

module.exports = { startBotServer };
