const userSessions = require("../../config/session").userSessions;
const {
  getSmartSettingsSuggestion,
  formatSettingsForMessage,
} = require("../../utils/helpers");

async function handleDocumentUpload(ctx) {
  const file = ctx.message.document;
  const userId = ctx.from.id;

  if (!file.mime_type.includes("pdf")) {
    await ctx.reply("❌ Hanya file PDF yang diterima.");
    return;
  }

  if (!userSessions.has(userId)) {
    userSessions.set(userId, {});
  }

  const userSession = userSessions.get(userId);
  userSession.fileUploaded = true;
  userSession.fileInfo = {
    fileId: file.file_id,
    fileName: file.file_name,
    fileSize: file.file_size,
  };

  let settingsMessage;
  if (userSession.settings) {
    const formattedSettings = formatSettingsForMessage(userSession.settings);
    settingsMessage = `✅ Settings sudah diset. Ketik /pay untuk lanjut pembayaran.\n\n📋 Current settings: ${formattedSettings}\n💰 Total biaya: Rp ${userSession.cost.toLocaleString(
      "id-ID"
    )}`;
  } else {
    const suggestedSettings = getSmartSettingsSuggestion(userSession);
    settingsMessage = `📝 Silakan paste text yang disimpan di clipboard anda untuk set print settings lalu kirim`;
    userSession.lastSettings = suggestedSettings;
  }

  userSessions.set(userId, userSession);
  await ctx.reply(`✅ File diterima: ${file.file_name}\n\n` + settingsMessage);
}

module.exports = { handleDocumentUpload };
