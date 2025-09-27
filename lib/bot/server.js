const { Telegraf, session } = require("telegraf");
const { message } = require("telegraf/filters");
const midtransClient = require("midtrans-client");

// Import handlers dan utilities
const { userSessions } = require("./utils/sessionManager"); // ← GANTI INI
const commandHandlers = require("./handlers/commandHandlers");
const messageHandlers = require("./handlers/messageHandlers");
const paymentHandlers = require("./handlers/paymentHandlers");
const { parseMultiLineCommands } = require("./utils/commandParser");
const { executeCommandsSequentially } = require("./utils/commandExecutor");

function startBotServer(botToken) {
  const bot = new Telegraf(botToken);

  // Setup session middleware
  bot.use(session());

  // Simpan reference ke bot instance globally
  global.botInstance = bot;

  // Setup handlers
  setupBotHandlers(bot);

  return bot.launch();
}

function setupBotHandlers(bot) {
  // Command handlers
  bot.start(commandHandlers.handleStart);
  bot.command("file", commandHandlers.handleFile);
  bot.command("setprint", commandHandlers.handleSetPrint);
  bot.command("pay", commandHandlers.handlePay);
  bot.command("debug", commandHandlers.handleDebug);
  bot.command("debug_all", commandHandlers.handleDebugAll);
  bot.command("status", commandHandlers.handleStatus);

  // Message handlers
  bot.on(message("document"), messageHandlers.handleDocumentUpload);
  bot.on(message("text"), messageHandlers.handleTextMessage);

  // Error handling
  bot.catch(messageHandlers.handleError);
}

module.exports = { startBotServer, userSessions };
