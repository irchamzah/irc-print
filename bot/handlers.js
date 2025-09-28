function setupHandlers(bot) {
  bot.start((ctx) => {
    ctx.reply("Welcome to Print24Jam Bot!");
  });

  bot.on("document", async (ctx) => {
    // Handle document upload
  });

  // Add more handlers...
}

module.exports = { setupHandlers };
