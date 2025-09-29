// bot/handlers/commands/startprint.js
const { userSessions } = require("../../config/session");
const fileService = require("../../services/fileService");
const printService = require("../../services/printService");

async function handleStartPrintCommand(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  console.log("🖨️ StartPrint command received for user:", userId);

  if (!userSession) {
    await ctx.reply("❌ Tidak ada session aktif. Silakan mulai dari /file");
    return;
  }

  if (!userSession.paymentInfo || userSession.paymentInfo.status !== "paid") {
    await ctx.reply(
      "❌ Pembayaran belum lunas. Silakan ketik /checkstatus untuk mengecek status pembayaran."
    );
    return;
  }

  if (!userSession.fileInfo || !userSession.fileInfo.fileId) {
    await ctx.reply(
      "❌ File tidak ditemukan. Silakan upload file PDF kembali."
    );
    return;
  }

  try {
    await ctx.reply("📥 Mengunduh file PDF untuk printing...");

    // Download file PDF (karena sebelumnya hanya simpan info, belum download)
    const downloadResult = await fileService.downloadFile(
      userSession.fileInfo.fileId,
      userSession.fileInfo.fileName,
      userId
    );

    if (!downloadResult.success) {
      throw new Error(`Gagal mengunduh file: ${downloadResult.error}`);
    }

    // Update session dengan path file yang didownload
    userSession.fileInfo.localPath = downloadResult.filePath;
    userSession.fileInfo.downloadedName = downloadResult.fileName;
    userSession.lastActivity = Date.now();
    userSessions.set(userId, userSession);

    console.log("✅ File downloaded for printing:", downloadResult.filePath);

    // Proses printing
    await ctx.reply("🖨️ Memulai proses printing...");
    const printResult = await printService.processPrint(userSession);

    if (printResult.success) {
      await ctx.reply(
        `✅ PRINTING BERHASIL!\n\n` +
          `📄 File: ${userSession.fileInfo.fileName}\n` +
          `⚙️ Settings: ${JSON.stringify(userSession.settings)}\n` +
          `💰 Total: Rp ${userSession.cost.toLocaleString("id-ID")}\n\n` +
          `Terima kasih telah menggunakan layanan kami! 🎉`
      );

      // Hapus session setelah selesai
      userSessions.delete(userId);
    } else {
      throw new Error(printResult.error);
    }
  } catch (error) {
    console.error("❌ Error in startprint:", error);
    await ctx.reply(
      `❌ Gagal memproses printing: ${error.message}\n\n` +
        `Silakan hubungi admin untuk bantuan.`
    );
  }
}

module.exports = { handleStartPrintCommand };
