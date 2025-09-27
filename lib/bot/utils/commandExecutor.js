const { userSessions } = require("../utils/sessionManager"); // ← INI

async function executeCommandsSequentially(ctx, commands) {
  const userId = ctx.from.id;

  for (const [index, command] of commands.entries()) {
    try {
      await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (command.startsWith("/file")) {
        const { handleFile } = require("../handlers/commandHandlers");
        await handleFile({
          ...ctx,
          message: { ...ctx.message, text: command },
        });
      } else if (command.startsWith("/setprint")) {
        const { handleSetPrint } = require("../handlers/commandHandlers");
        await handleSetPrint({
          ...ctx,
          message: { ...ctx.message, text: command },
        });
      } else if (command.startsWith("/pay")) {
        const { handlePay } = require("../handlers/commandHandlers");
        await handlePay({ ...ctx, message: { ...ctx.message, text: command } });
      } else {
        await ctx.reply(`⚠️ Perintah tidak dikenali: ${command}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error(`❌ Error executing command ${index + 1}:`, error);
      await ctx.reply(
        `❌ Gagal memproses: ${command}\nError: ${error.message}`
      );
    }
  }

  console.log("✅ All commands executed successfully");
}

module.exports = { executeCommandsSequentially };
