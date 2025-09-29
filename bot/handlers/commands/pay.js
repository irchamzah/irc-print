// bot/handlers/commands/pay.js - TAMBAHKAN CLEANUP PADA VALIDATION ERROR
const { userSessions } = require("../../config/session");
const paymentService = require("../../services/paymentService");
const fileService = require("../../services/fileService");

async function handlePayCommand(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  console.log("💰 Pay command received for user:", userId);

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

  try {
    await paymentService.processPayment(ctx, userSession);
  } catch (error) {
    console.error("❌ Payment processing error:", error);

    // HAPUS FILE JIKA PAYMENT GAGAL
    if (userSession.fileInfo && userSession.fileInfo.localPath) {
      await fileService.deleteFile(userSession.fileInfo.localPath);
      console.log(
        `✅ File deleted due to payment error: ${userSession.fileInfo.localPath}`
      );
    }

    await ctx.reply("❌ Error processing payment. Silakan coba lagi.");
  }
}

module.exports = { handlePayCommand };
