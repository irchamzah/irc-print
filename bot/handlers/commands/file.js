// bot/handlers/commands/file.js
const { userSessions } = require("../../config/session"); // Import instance

async function handleFileCommand(ctx, commandText) {
  const match = commandText.match(/^\/file\s+(.+)$/);
  if (!match) {
    await ctx.reply("❌ Format salah. Gunakan: /file <nama_file>");
    return;
  }

  const fileName = match[1].trim();
  const userId = ctx.from.id;

  console.log("📁 File command received - Filename:", fileName);
  console.log("📊 Total active sessions before:", userSessions.size);

  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      currentStep: "configuring",
      lastActivity: Date.now(),
      createdAt: new Date().toISOString(),
    });
  }

  const userSession = userSessions.get(userId);
  userSession.fileName = fileName;
  userSession.lastActivity = Date.now();
  userSession.currentStep = "file_set";

  userSessions.set(userId, userSession);

  console.log("✅ File name disimpan di session");
  console.log("📊 Total active sessions after:", userSessions.size);

  await ctx.reply(
    `✅ File name disimpan: ${fileName}\n\nSilakan upload file PDF.`
  );
}

module.exports = { handleFileCommand };
