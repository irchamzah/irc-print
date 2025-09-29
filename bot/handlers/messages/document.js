// bot/handlers/messages/document.js - SIMPAN hanya info file, jangan download

const fileService = require("../../services/fileService");
const userSessions = require("../../config/session").userSessions;
const paymentService = require("../../services/paymentService");
const printService = require("../../services/printService");
const { formatSettingsForMessage } = require("../../utils/helpers");
const getSmartSettingsSuggestion =
  require("../../utils/helpers").getSmartSettingsSuggestion;

async function handleDocumentUpload(ctx) {
  const file = ctx.message.document;
  const userId = ctx.from.id;

  console.log("📄 Document received:", {
    fileName: file.file_name,
    fileSize: file.file_size,
    mimeType: file.mime_type,
    userId: userId,
  });

  // Validasi file PDF
  if (!fileService.isPDFFile(file.mime_type, file.file_name)) {
    await ctx.reply(
      "❌ Hanya file PDF yang diterima. Silakan upload file PDF."
    );
    return;
  }

  // Validasi file size (max 20MB)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.file_size > maxSize) {
    await ctx.reply("❌ File terlalu besar. Maksimal 20MB.");
    return;
  }

  try {
    // Simpan info file ke session (TANPA download dulu)
    if (!userSessions.has(userId)) {
      userSessions.set(userId, {
        currentStep: "configuring",
        lastActivity: Date.now(),
        createdAt: new Date().toISOString(),
      });
    }

    const userSession = userSessions.get(userId);
    userSession.fileUploaded = true;
    userSession.fileInfo = {
      fileId: file.file_id, // Simpan file_id untuk download nanti
      fileName: file.file_name, // Simpan original filename
      fileSize: file.file_size, // Simpan file size
      // localPath: null,           // Akan diisi saat startprint
      // downloadedName: null       // Akan diisi saat startprint
    };
    userSession.lastActivity = Date.now();

    userSessions.set(userId, userSession);

    console.log(
      "✅ File info saved to session (will download later):",
      userSession.fileInfo
    );

    // Prepare response message
    let settingsMessage;
    if (userSession.settings) {
      const formattedSettings = formatSettingsForMessage(userSession.settings);
      settingsMessage =
        `✅ Settings sudah diset. Ketik /pay untuk lanjut pembayaran.\n\n` +
        `📋 Current settings: ${formattedSettings}\n` +
        `💰 Total biaya: Rp ${userSession.cost.toLocaleString("id-ID")}`;
    } else {
      const suggestedSettings = getSmartSettingsSuggestion(userSession);
      settingsMessage =
        `📝 Silakan set print settings dengan command:\n` +
        `/setprint ${suggestedSettings}`;
      userSession.lastSettings = suggestedSettings;
    }

    await ctx.reply(
      `✅ File info disimpan: ${file.file_name}\n` +
        `💾 Size: ${(file.file_size / 1024 / 1024).toFixed(2)} MB\n` +
        `📝 File akan diunduh setelah pembayaran lunas.\n\n` +
        settingsMessage
    );
  } catch (error) {
    console.error("❌ Error processing document:", error);
    await ctx.reply(
      "❌ Gagal memproses file. Silakan coba lagi atau hubungi admin.\n" +
        `Error: ${error.message}`
    );
  }
}
module.exports = { handleDocumentUpload };
