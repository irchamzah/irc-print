// bot/handlers/commands/setprint.js
const { userSessions } = require("../../config/session"); // Import instance
const {
  parsePrintSettings,
  calculateCostFromSettings,
  formatSettingsForMessage,
} = require("../../utils/helpers");

async function handleSetPrintCommand(ctx, commandText) {
  const match = commandText.match(/^\/setprint\s+(.+)$/);
  if (!match) {
    await ctx.reply(
      "❌ Format salah. Gunakan: /setprint color:1 bw:2-6 copies:1"
    );
    return;
  }

  const settingsText = match[1].trim();
  const userId = ctx.from.id;

  console.log("⚙️ Setprint command received:", { userId, settingsText });

  try {
    const settings = parsePrintSettings(settingsText);
    const cost = calculateCostFromSettings(settings);

    if (!userSessions.has(userId)) {
      userSessions.set(userId, {
        currentStep: "configuring",
        lastActivity: Date.now(),
        createdAt: new Date().toISOString(),
      });
    }

    const userSession = userSessions.get(userId);
    userSession.settings = settings;
    userSession.cost = cost;
    userSession.lastActivity = Date.now();
    userSession.currentStep = "settings_configured";
    userSession.lastSettings = settingsText;

    userSessions.set(userId, userSession);

    console.log(
      "💾 Session after setprint:",
      JSON.stringify(userSession, null, 2)
    );

    const formattedSettings = formatSettingsForMessage(settings);
    await ctx.reply(
      `✅ Settings diterima!\n` +
        `• ${formattedSettings}\n` +
        `• Total biaya: Rp ${cost.toLocaleString("id-ID")}\n\n` +
        `Silakan ketik /pay untuk mulai pembayaran.`
    );
  } catch (error) {
    console.error("❌ Error parsing settings:", error);
    await ctx.reply(
      "❌ Format settings tidak valid. Contoh: /setprint color:1 bw:2-6 copies:1"
    );
  }
}

module.exports = { handleSetPrintCommand };
