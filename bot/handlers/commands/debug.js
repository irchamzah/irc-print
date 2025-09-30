// bot/handlers/commands/debug.js
const { userSessions } = require("../../config/session"); // Import instance
const printerUtils = require("../../utils/printerUtils");
const printService = require("../../services/printService");

async function handleDebugCommand(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  if (!userSession) {
    await ctx.reply("❌ No session data found for your user ID.");
    return;
  }

  const sessionInfo = `
🔍 *DEBUG INFO* 🔍

User ID: ${userId}
File Name: ${userSession.fileName || "Not set"}
Settings: ${
    userSession.settings ? JSON.stringify(userSession.settings) : "Not set"
  }
Cost: ${
    userSession.cost
      ? "Rp " + userSession.cost.toLocaleString("id-ID")
      : "Not calculated"
  }
File Uploaded: ${userSession.fileUploaded ? "✅ Yes" : "❌ No"}
File Info: ${
    userSession.fileInfo
      ? JSON.stringify(userSession.fileInfo)
      : "Not available"
  }
Current Step: ${userSession.currentStep || "Not set"}
  `;

  await ctx.reply(sessionInfo);

  // Juga log ke console
  console.log(
    "🔍 Debug command executed:",
    JSON.stringify(userSession, null, 2)
  );
}

async function handleDebugAllCommand(ctx) {
  // Ganti dengan your user ID untuk security
  const ADMIN_ID = 123456789; // Your Telegram User ID

  if (ctx.from.id !== ADMIN_ID) {
    await ctx.reply("❌ Admin only command.");
    return;
  }

  let allSessionsInfo = `📊 All Active Sessions: ${userSessions.size}\n\n`;

  userSessions.forEach((session, userId) => {
    allSessionsInfo +=
      `User ID: ${userId}\n` +
      `File: ${session.fileName || "None"}\n` +
      `Cost: ${session.cost || "Not set"}\n` +
      `Uploaded: ${session.fileUploaded ? "Yes" : "No"}\n` +
      `Step: ${session.currentStep || "Not set"}\n` +
      `---\n`;
  });

  await ctx.reply(allSessionsInfo);
  console.log("📊 All sessions:", Array.from(userSessions.debugAll()));
}

async function handlePrinterDebugCommand(ctx) {
  try {
    await ctx.reply("🖨️ Checking printer status...");

    // Deteksi semua printer dengan error handling
    let allPrinters = [];
    try {
      allPrinters = await printerUtils.detectAllPrinters();
    } catch (error) {
      console.error("❌ Error detecting printers:", error);
      await ctx.reply(
        "❌ Gagal mendeteksi printer. Pastikan WMIC tersedia di Windows."
      );
      return;
    }

    // Test printer connection
    const printerTest = await printerUtils.testPrinterConnection();

    // Get available printers dengan error handling
    let printersList = "Error getting printers";
    try {
      printersList = await printService.getAvailablePrinters();
    } catch (error) {
      console.error("❌ Error getting printers:", error);
      printersList = "Cannot retrieve printer list";
    }

    let printerListText = "No printers found";
    if (allPrinters.length > 0) {
      printerListText = allPrinters
        .map(
          (p) => `${p.name} ${p.isDefault ? "📌 (DEFAULT)" : ""} - ${p.status}`
        )
        .join("\n");
    }

    const debugInfo = `
🖨️ *PRINTER DEBUG INFO*

✅ Printer Test: ${printerTest.success ? "SUCCESS" : "FAILED"}
📄 Printer Name: ${printerTest.printerName}
🔧 Printer Status: ${printerTest.status}
${printerTest.message ? `💡 Message: ${printerTest.message}` : ""}
${printerTest.error ? `❌ Error: ${printerTest.error}` : ""}

📋 *DETECTED PRINTERS (${allPrinters.length}):*
${printerListText}

📜 *SYSTEM PRINTERS:*
${printersList}

💡 *NEXT STEPS:*
1. Cek nama printer di atas
2. Pastikan printer status "Ready" 
3. Test dengan /startprint
    `;

    await ctx.reply(debugInfo, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("❌ Printer debug error:", error);
    await ctx.reply(
      `❌ Printer debug failed: ${error.message}\n\nCoba periksa file printerUtils.js`
    );
  }
}

module.exports = {
  handleDebugCommand,
  handleDebugAllCommand,
  handlePrinterDebugCommand,
};
