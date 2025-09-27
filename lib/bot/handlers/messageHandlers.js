const {
  getSmartSettingsSuggestion,
  formatSettingsForMessage,
} = require("../utils/printUtils");
const { parseMultiLineCommands } = require("../utils/commandParser");
const { executeCommandsSequentially } = require("../utils/commandExecutor");
const { userSessions } = require("../utils/sessionManager"); // ← INI

async function handleDocumentUpload(ctx) {
  const file = ctx.message.document;
  const userId = ctx.from.id;

  if (!file.mime_type.includes("pdf")) {
    return ctx.reply("❌ Hanya file PDF yang diterima.");
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
  userSessions.set(userId, userSession);

  let settingsMessage;
  if (userSession.settings) {
    const formattedSettings = formatSettingsForMessage(userSession.settings);
    settingsMessage =
      `✅ Settings sudah diset. Ketik /pay untuk lanjut pembayaran.\n\n` +
      `📋 Current settings: ${formattedSettings}\n` +
      `💰 Total biaya: Rp ${userSession.cost.toLocaleString("id-ID")}`;
  } else {
    const suggestedSettings = getSmartSettingsSuggestion(userSession);
    settingsMessage = `📝 Silakan paste text yang disimpan di clipboard anda untuk set print settings lalu kirim`;
    userSession.lastSettings = suggestedSettings;
    userSessions.set(userId, userSession);
  }

  ctx.reply(`✅ File diterima: ${file.file_name}\n\n` + settingsMessage);
}

async function handleTextMessage(ctx) {
  const text = ctx.message.text;
  const userId = ctx.from.id;

  if (text.includes("\n")) {
    const commands = parseMultiLineCommands(text);
    if (commands.length > 0) {
      return executeCommandsSequentially(ctx, commands)
        .then(() => {
          ctx.reply("✅ Semua perintah berhasil diproses!");
        })
        .catch((error) => {
          console.error("Error executing multi-commands:", error);
          ctx.reply("❌ Terjadi error memproses beberapa perintah.");
        });
    }
  }

  if (text.startsWith("/file")) {
    const { handleFile } = require("./commandHandlers");
    return handleFile(ctx);
  } else if (text.startsWith("/setprint")) {
    const { handleSetPrint } = require("./commandHandlers");
    return handleSetPrint(ctx);
  } else if (text.startsWith("/pay")) {
    const { handlePay } = require("./commandHandlers");
    return handlePay(ctx);
  } else if (text.startsWith("/debug")) {
    const { showAllTransactions } = require("./commandHandlers");
    return showAllTransactions(ctx);
  } else {
    return ctx.reply(
      "Perintah tidak dikenali. Gunakan commands:\n" +
        "/file <nama_file>\n" +
        "/setprint <settings>\n" +
        "/pay\n\n" +
        "Atau kirim semua sekaligus dalam satu message!"
    );
  }
}

function handleError(err, ctx) {
  console.error("Bot error:", err);
  ctx.reply("❌ Terjadi error. Silakan coba lagi.");
}

module.exports = {
  handleDocumentUpload,
  handleTextMessage,
  handleError,
};
