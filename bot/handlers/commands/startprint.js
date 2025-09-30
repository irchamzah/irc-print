// bot/handlers/commands/startprint.js - PASTIKAN TIDAK ADA PERUBAHAN
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

    // Download file PDF
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

    // Proses printing - INI YANG MEMANGGIL printService.processPrint
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

      // HAPUS FILE SETELAH PRINT BERHASIL
      if (userSession.fileInfo.localPath) {
        const deleteResult = await fileService.deleteFile(
          userSession.fileInfo.localPath
        );
        if (deleteResult.success) {
          console.log(
            `✅ File deleted after successful print: ${userSession.fileInfo.localPath}`
          );
        }
      }

      // Hapus session setelah selesai
      userSessions.delete(userId);
    } else {
      throw new Error(printResult.error);
    }
  } catch (error) {
    console.error("❌ Error in startprint:", error);

    // HAPUS FILE JIKA ADA ERROR (rollback)
    if (userSession && userSession.fileInfo && userSession.fileInfo.localPath) {
      await fileService.deleteFile(userSession.fileInfo.localPath);
      console.log(
        `✅ File deleted due to error: ${userSession.fileInfo.localPath}`
      );
    }

    await ctx.reply(
      `❌ Gagal memproses printing: ${error.message}\n\n` +
        `Silakan hubungi admin untuk bantuan.`
    );
  }
}

module.exports = { handleStartPrintCommand };
