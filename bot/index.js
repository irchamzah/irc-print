// bot/index.js - PERBAIKI IMPORT
const { Telegraf, session } = require("telegraf");
const { message } = require("telegraf/filters");

// Import session instance
const { userSessions, startSessionCleanup } = require("./config/session");
const { testMidtransConnection } = require("./utils/midtransTest");

// Import handlers dengan debugging
console.log("🔍 Loading handlers...");

// Import handlers satu per satu dengan try-catch
const { handleStartCommand } = require("./handlers/commands/start");
console.log("✅ start handler loaded");

const { handleFileCommand } = require("./handlers/commands/file");
console.log("✅ file handler loaded");

const { handleSetPrintCommand } = require("./handlers/commands/setprint");
console.log("✅ setprint handler loaded");

const { handlePayCommand } = require("./handlers/commands/pay");
console.log("✅ pay handler loaded");

// PERBAIKI DI SINI - pastikan nama file sama
const { handleCheckStatusCommand } = require("./handlers/commands/checkstatus"); // Capital S
console.log("✅ checkstatus handler loaded");

const { handleStartPrintCommand } = require("./handlers/commands/startprint");
console.log("✅ startprint handler loaded");

const {
  handleDebugCommand,
  handleDebugAllCommand,
} = require("./handlers/commands/debug");
console.log("✅ debug handlers loaded");

const { handleDocumentUpload } = require("./handlers/messages/document");
console.log("✅ document handler loaded");

const { handleTextMessage } = require("./handlers/messages/text");
console.log("✅ text handler loaded");

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
    console.log("🔧 Registering command handlers...");

    bot.start(handleStartCommand);
    console.log("✅ start command registered");

    bot.command("file", (ctx) => handleFileCommand(ctx, ctx.message.text));
    console.log("✅ file command registered");

    bot.command("setprint", (ctx) =>
      handleSetPrintCommand(ctx, ctx.message.text)
    );
    console.log("✅ setprint command registered");

    bot.command("pay", handlePayCommand);
    console.log("✅ pay command registered");

    bot.command("checkstatus", handleCheckStatusCommand);
    console.log("✅ checkstatus command registered");

    bot.command("startprint", handleStartPrintCommand);
    console.log("✅ startprint command registered");

    bot.command("debug", handleDebugCommand);
    bot.command("debug_all", handleDebugAllCommand);
    console.log("✅ debug commands registered");

    // Setup message handlers
    console.log("🔧 Registering message handlers...");

    bot.on(message("document"), handleDocumentUpload);
    console.log("✅ document handler registered");

    bot.on(message("text"), handleTextMessage);
    console.log("✅ text handler registered");

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
