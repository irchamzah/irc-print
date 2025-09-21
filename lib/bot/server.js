const { Telegraf } = require("telegraf");
const { setupHandlers } = require("./handlers");

function startBotServer() {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  // Setup handlers
  setupHandlers(bot);

  // Start bot
  return bot.launch();
}

module.exports = { startBotServer };
