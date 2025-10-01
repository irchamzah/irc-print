// bot/handlers/commands/start.js
// JANGAN import handler lain di sini, pindahkan logic ke text.js

async function handleStartCommand(ctx) {
  const startParam = ctx.message.text.split(" ")[1];

  if (startParam) {
    try {
      const decodedMessage = decodeURIComponent(
        Buffer.from(startParam, "base64").toString()
      );

      // Simpan commands ke session, biar text.js yang proses
      const { userSessions } = require("../../config/session");
      const userId = ctx.from.id;

      if (!userSessions.has(userId)) {
        userSessions.set(userId, {
          currentStep: "configuring",
          lastActivity: Date.now(),
          createdAt: new Date().toISOString(),
        });
      }

      const userSession = userSessions.get(userId);
      userSession.pendingCommands = decodedMessage
        .split("\n")
        .filter((cmd) => cmd.trim());
      userSessions.set(userId, userSession);

      await ctx.reply("🔗 Deep link diterima! Memproses commands...");

      // Trigger text handler untuk proses commands
      const { handleTextMessage } = require("../messages/text");
      await handleTextMessage(ctx);
    } catch (error) {
      console.error("Error processing deep link:", error);
      await ctx.reply(
        "❌ Terjadi error processing deep link. Silakan coba lagi."
      );
    }
  } else {
    await ctx.reply(
      "🖨️ Selamat datang di Print24Jam Bot!\n\nKirim file PDF yang ingin dicetak, lalu ikuti instruksi selanjutnya."
    );
  }
}

module.exports = { handleStartCommand };
