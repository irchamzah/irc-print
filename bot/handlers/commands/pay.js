// bot/handlers/commands/pay.js
const { userSessions } = require("../../config/session"); // Import instance
const paymentService = require("../../services/paymentService");

async function handlePayCommand(ctx) {
  const userId = ctx.from.id;

  // Debug info
  console.log("💰 Pay command received for user:", userId);
  console.log("📊 Total active sessions:", userSessions.size);

  const userSession = userSessions.get(userId);

  if (!userSession) {
    await ctx.reply("❌ Silakan mulai dengan /file terlebih dahulu");
    return;
  }

  if (!userSession.fileName) {
    await ctx.reply("❌ Silakan set file name dengan /file <nama_file>");
    return;
  }

  if (!userSession.settings) {
    await ctx.reply("❌ Silakan set print settings dengan /setprint");
    return;
  }

  if (!userSession.fileUploaded) {
    await ctx.reply(
      "❌ File belum diupload. Silakan upload file PDF terlebih dahulu."
    );
    return;
  }

  console.log("✅ All validations passed for payment, cost:", userSession.cost);

  await ctx.reply(
    `✅ Semua data lengkap! Total: Rp ${userSession.cost.toLocaleString(
      "id-ID"
    )}. Membuat QRIS pembayaran...`
  );
  await paymentService.processPayment(ctx, userSession);
}

module.exports = { handlePayCommand };
