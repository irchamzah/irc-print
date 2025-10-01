const { parseMultiLineCommands } = require("../../utils/helpers");
const { handleFileCommand } = require("../commands/file");
const { handleSetPrintCommand } = require("../commands/setprint");
const { handlePayCommand } = require("../commands/pay");

async function executeCommandsSequentially(ctx, commands) {
  const userId = ctx.from.id;

  for (const [index, command] of commands.entries()) {
    try {
      await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (command.startsWith("/file")) {
        await handleFileCommand(ctx, command);
      } else if (command.startsWith("/setprint")) {
        await handleSetPrintCommand(ctx, command);
      } else if (command.startsWith("/pay")) {
        await handlePayCommand(ctx);
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
}

async function handleTextMessage(ctx) {
  const text = ctx.message.text;
  const userId = ctx.from.id;

  if (text.includes("\n")) {
    const commands = parseMultiLineCommands(text);
    if (commands.length > 0) {
      await executeCommandsSequentially(ctx, commands);
      await ctx.reply("✅ Semua perintah berhasil diproses!");
      return;
    }
  }

  // Single command fallback
  if (text.startsWith("/file")) {
    await handleFileCommand(ctx, text);
  } else if (text.startsWith("/setprint")) {
    await handleSetPrintCommand(ctx, text);
  } else if (text.startsWith("/pay")) {
    await handlePayCommand(ctx);
  } else {
    await ctx.reply(
      "Perintah tidak dikenali. Gunakan commands:\n/file <nama_file>\n/setprint <settings>\n/pay\n\nAtau kirim semua sekaligus dalam satu message!"
    );
  }
}

module.exports = { handleTextMessage };
