// bot/handlers/commands/debug.js
const { userSessions } = require("../../config/session"); // Import instance

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

module.exports = { handleDebugCommand, handleDebugAllCommand };
