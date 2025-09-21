const { Telegraf, session } = require("telegraf");
const { message } = require("telegraf/filters");

// Simpan user sessions (dalam production, gunakan database)
// Di awal file, buat session manager dengan logging
function createSessionManager() {
  const sessions = new Map();

  return {
    get(userId) {
      const session = sessions.get(userId);
      console.log("📥 Get session for", userId, ":", session);
      return session;
    },

    set(userId, data) {
      console.log("💾 Set session for", userId, ":", data);
      sessions.set(userId, data);
      return sessions.get(userId);
    },

    has(userId) {
      const exists = sessions.has(userId);
      console.log("🔍 Check session exists for", userId, ":", exists);
      return exists;
    },

    delete(userId) {
      console.log("🗑️ Delete session for", userId);
      return sessions.delete(userId);
    },

    // Method untuk debug
    debugAll() {
      return Array.from(sessions.entries());
    },
  };
}

// Ganti userSessions dengan:
const userSessions = createSessionManager();

function startBotServer(botToken) {
  const bot = new Telegraf(botToken);

  // Setup session middleware
  bot.use(session());

  // Simpan reference ke bot instance globally untuk akses di handler lain
  global.botInstance = bot;

  // Handler untuk command /start
  bot.start((ctx) => {
    const startParam = ctx.message.text.split(" ")[1];

    if (startParam) {
      try {
        // Decode deep link message
        const decodedMessage = decodeURIComponent(
          Buffer.from(startParam, "base64").toString()
        );
        const commands = decodedMessage.split("\n").filter((cmd) => cmd.trim());

        // Simulate receiving commands dari deep link
        commands.forEach((command) => {
          if (command.startsWith("/file")) {
            handleFileCommand(ctx, command);
          } else if (command.startsWith("/setprint")) {
            handleSetPrintCommand(ctx, command);
          } else if (command.startsWith("/pay")) {
            handlePayCommand(ctx);
          }
        });
      } catch (error) {
        console.error("Error processing deep link:", error);
        ctx.reply("❌ Terjadi error processing deep link. Silakan coba lagi.");
      }
    } else {
      ctx.reply(
        "🖨️ Selamat datang di Print24Jam Bot!\n\n" +
          "Kirim file PDF yang ingin dicetak, lalu ikuti instruksi selanjutnya."
      );
    }
  });

  // Handler untuk command /file
  bot.command("file", (ctx) => {
    handleFileCommand(ctx, ctx.message.text);
  });

  // Handler untuk command /setprint
  bot.command("setprint", (ctx) => {
    handleSetPrintCommand(ctx, ctx.message.text);
  });

  // Handler untuk command /pay
  bot.command("pay", (ctx) => {
    handlePayCommand(ctx);
  });

  // Di file server.js, tambahkan command debug
  bot.command("debug", (ctx) => {
    const userId = ctx.from.id;
    const userSession = userSessions.get(userId);

    if (!userSession) {
      return ctx.reply("❌ No session data found for your user ID.");
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
  `;

    ctx.reply(sessionInfo);

    // Juga log ke console
    console.log(
      "🔍 Debug command executed:",
      JSON.stringify(userSession, null, 2)
    );
  });

  // Command untuk melihat semua sessions (hanya untuk admin)
  bot.command("debug_all", (ctx) => {
    // Ganti dengan your user ID untuk security
    const ADMIN_ID = 123456789; // Your Telegram User ID

    if (ctx.from.id !== ADMIN_ID) {
      return ctx.reply("❌ Admin only command.");
    }

    let allSessionsInfo = `📊 All Active Sessions: ${userSessions.size}\n\n`;

    userSessions.forEach((session, userId) => {
      allSessionsInfo +=
        `User ID: ${userId}\n` +
        `File: ${session.fileName || "None"}\n` +
        `Cost: ${session.cost || "Not set"}\n` +
        `Uploaded: ${session.fileUploaded ? "Yes" : "No"}\n` +
        `---\n`;
    });

    ctx.reply(allSessionsInfo);
    console.log("📊 All sessions:", Array.from(userSessions.entries()));
  });

  // Handler untuk document upload
  bot.on(message("document"), async (ctx) => {
    await handleDocumentUpload(ctx);
  });

  // Handler untuk text messages - PERBAIKI BAGIAN INI
  bot.on(message("text"), (ctx) => {
    const text = ctx.message.text;
    const userId = ctx.from.id;

    console.log("📩 Received text:", text);

    // Cek jika message mengandung multiple commands
    if (text.includes("\n")) {
      console.log("🔍 Multi-line message detected");
      const commands = parseMultiLineCommands(text);
      console.log("📋 Parsed commands:", commands);

      if (commands.length > 0) {
        console.log("🚀 Processing multiple commands");
        console.log("=== MULTI-COMMAND DEBUG ===");
        console.log("Raw input:", text);
        console.log("Parsed commands:", commands);
        console.log("User ID:", userId);
        console.log("Current session:", userSessions.get(userId));
        console.log("===========================");
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

    // Fallback untuk single commands
    if (text.startsWith("/file")) {
      return handleFileCommand(ctx, text);
    } else if (text.startsWith("/setprint")) {
      return handleSetPrintCommand(ctx, text);
    } else if (text.startsWith("/pay")) {
      return handlePayCommand(ctx);
    } else {
      return ctx.reply(
        "Perintah tidak dikenali. Gunakan commands:\n" +
          "/file <nama_file>\n" +
          "/setprint <settings>\n" +
          "/pay\n\n" +
          "Atau kirim semua sekaligus dalam satu message!"
      );
    }
  });

  // Error handling
  bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    ctx.reply("❌ Terjadi error. Silakan coba lagi.");
  });

  return bot.launch();
}

async function handleFileCommand(ctx, commandText) {
  return new Promise((resolve) => {
    // **FIX**: Gunakan regex yang lebih robust untuk extract filename
    const match = commandText.match(/^\/file\s+(.+)$/);
    if (!match) {
      ctx
        .reply("❌ Format salah. Gunakan: /file <nama_file>")
        .then(() => resolve())
        .catch(() => resolve());
      return;
    }

    const fileName = match[1].trim();
    const userId = ctx.from.id;

    console.log("📁 File command received - Filename:", fileName);

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

    ctx
      .reply(`✅ File name disimpan: ${fileName}\n\nSilakan upload file PDF.`)
      .then(() => resolve())
      .catch((error) => {
        console.error("Reply error:", error);
        resolve();
      });
  });
}

function getSmartSettingsSuggestion(userSession) {
  // Jika ada settings sebelumnya, suggest yang sama
  if (userSession.lastSettings) {
    return userSession.lastSettings;
  }

  // Jika ada fileName, coba predict berdasarkan nama file
  if (userSession.fileName) {
    // Heuristic: Jika file mengandung "skripsi", "thesis", dll -> mostly BW
    const fileName = userSession.fileName.toLowerCase();
    if (
      fileName.includes("skripsi") ||
      fileName.includes("thesis") ||
      fileName.includes("laporan")
    ) {
      return "color:1 bw:2-10 copies:2"; // Halaman 1 warna, lainnya BW, 2 copies
    }

    // Jika file mengandung "presentasi", "slide", dll -> mostly color
    if (
      fileName.includes("presentasi") ||
      fileName.includes("slide") ||
      fileName.includes("proposal")
    ) {
      return "color:1-10 copies:1"; // Semua halaman warna
    }
  }

  // Default suggestion
  return "color:1 bw:2-6 copies:1";
}

async function handleSetPrintCommand(ctx, commandText) {
  return new Promise((resolve) => {
    const match = commandText.match(/^\/setprint\s+(.+)$/);
    if (!match) {
      ctx
        .reply("❌ Format salah. Gunakan: /setprint color:1 bw:2-6 copies:1")
        .then(() => resolve())
        .catch(() => resolve());
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

      // **SIMPAN last settings untuk reference future**
      userSession.lastSettings = settingsText;

      userSessions.set(userId, userSession);

      console.log(
        "💾 Session after setprint:",
        JSON.stringify(userSession, null, 2)
      );

      // Format settings untuk display yang user-friendly
      const formattedSettings = formatSettingsForMessage(settings);

      ctx
        .reply(
          `✅ Settings diterima!\n` +
            `• ${formattedSettings}\n` +
            `• Total biaya: Rp ${cost.toLocaleString("id-ID")}\n\n` +
            `Silakan ketik /pay untuk mulai pembayaran.`
        )
        .then(() => resolve())
        .catch((error) => {
          console.error("Reply error:", error);
          resolve();
        });
    } catch (error) {
      console.error("❌ Error parsing settings:", error);
      ctx
        .reply(
          "❌ Format settings tidak valid. Contoh: /setprint color:1 bw:2-6 copies:1"
        )
        .then(() => resolve())
        .catch(() => resolve());
    }
  });
}

// Handler untuk /pay command
async function handlePayCommand(ctx) {
  return new Promise((resolve) => {
    const userId = ctx.from.id;
    const userSession = userSessions.get(userId);

    console.log("💰 Pay command received for user:", userId);
    console.log("📊 Current session:", userSession);

    if (!userSession) {
      console.log("❌ No session found for pay command");
      ctx
        .reply("❌ Silakan mulai dengan /file terlebih dahulu")
        .then(() => resolve())
        .catch(() => resolve());
      return;
    }

    if (!userSession.fileName) {
      console.log("❌ No filename in session");
      ctx
        .reply("❌ Silakan set file name dengan /file <nama_file>")
        .then(() => resolve())
        .catch(() => resolve());
      return;
    }

    if (!userSession.settings) {
      console.log("❌ No settings in session");
      ctx
        .reply("❌ Silakan set print settings dengan /setprint")
        .then(() => resolve())
        .catch(() => resolve());
      return;
    }

    if (!userSession.fileUploaded) {
      console.log("❌ File not uploaded yet");
      ctx
        .reply(
          "❌ File belum diupload. Silakan upload file PDF terlebih dahulu."
        )
        .then(() => resolve())
        .catch(() => resolve());
      return;
    }

    console.log("✅ All validations passed for payment");

    // Process payment
    ctx
      .reply(
        `✅ Semua data lengkap! Total: Rp ${userSession.cost.toLocaleString(
          "id-ID"
        )} silakan lakukan pembayaran menggunakan QRIS.\n\n`
      )
      .then(() => simulateQRISGeneration(ctx, userSession.cost))
      .then(() => {
        userSession.currentStep = "awaiting_payment";
        userSession.lastActivity = Date.now();
        userSessions.set(userId, userSession);
        resolve();
      })
      .catch((error) => {
        console.error("Payment error:", error);
        ctx
          .reply("❌ Error processing payment")
          .then(() => resolve())
          .catch(() => resolve());
      });
  });
}

// Handler untuk document upload
// Handler untuk document upload
async function handleDocumentUpload(ctx) {
  const file = ctx.message.document;
  const userId = ctx.from.id;

  // Cek jika file PDF
  if (!file.mime_type.includes("pdf")) {
    return ctx.reply("❌ Hanya file PDF yang diterima.");
  }

  // Simpan info file ke session
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

  // Prepare response message based on session state
  let settingsMessage;

  if (userSession.settings) {
    // Settings sudah diset, show current settings
    const formattedSettings = formatSettingsForMessage(userSession.settings);
    settingsMessage =
      `✅ Settings sudah diset. Ketik /pay untuk lanjut pembayaran.\n\n` +
      `📋 Current settings: ${formattedSettings}\n` +
      `💰 Total biaya: Rp ${userSession.cost.toLocaleString("id-ID")}`;
  } else {
    // Settings belum diset, provide smart suggestion
    const suggestedSettings = getSmartSettingsSuggestion(userSession);
    settingsMessage = `📝 Silakan paste text yang disimpan di clipboard anda untuk set print settings lalu kirim`;
    // `contoh: /setprint ${suggestedSettings}`;

    // Save suggestion for consistency
    userSession.lastSettings = suggestedSettings;
    userSessions.set(userId, userSession);
  }

  ctx.reply(`✅ File diterima: ${file.file_name}\n\n` + settingsMessage);
}

// Helper function untuk format settings menjadi string
function formatSettingsForMessage(settings) {
  if (!settings) return "color:1 bw:2-4 copies:1"; // Default fallback

  const parts = [];

  if (settings.colorPages && settings.colorPages.length > 0) {
    const colorStr = settings.colorPages.join(",");
    parts.push(`color:${colorStr}`);
  }

  if (settings.bwPages && settings.bwPages.length > 0) {
    const bwStr = settings.bwPages.join(",");
    parts.push(`bw:${bwStr}`);
  }

  if (settings.copies) {
    parts.push(`copies:${settings.copies}`);
  }

  return parts.join(" ");
}

// Contoh output: "color:1,3,5 bw:2,4,6-10 copies:2"

async function executeCommandsSequentially(ctx, commands) {
  const userId = ctx.from.id;
  console.log("🔄 Executing commands for user:", userId);
  console.log("📜 Commands:", commands);

  for (const [index, command] of commands.entries()) {
    try {
      console.log(`➡️ [${index + 1}/${commands.length}] Processing:`, command);

      // Show typing action
      await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // **FIX**: Jangan clean command yang sudah benar
      if (command.startsWith("/file")) {
        await handleFileCommand(ctx, command);
      } else if (command.startsWith("/setprint")) {
        await handleSetPrintCommand(ctx, command);
      } else if (command.startsWith("/pay")) {
        await handlePayCommand(ctx);
      } else {
        console.warn("⚠️ Unknown command:", command);
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

  // Debug: Tampilkan session setelah semua commands
  const finalSession = userSessions.get(userId);
  console.log("🎯 Final session state:", JSON.stringify(finalSession, null, 2));

  console.log("✅ All commands executed successfully");
}

// Helper function untuk parse settings
function parsePrintSettings(settingsText) {
  const settings = {
    colorPages: [],
    bwPages: [],
    copies: 1,
  };

  const regex = /(color|bw):([\d,\-]+)|copies:(\d+)/gi;
  let match;

  while ((match = regex.exec(settingsText)) !== null) {
    const [, type, pages, copies] = match;

    if (type && pages) {
      const pageArray = parsePageRange(pages);
      if (type === "color") {
        settings.colorPages = pageArray;
      } else if (type === "bw") {
        settings.bwPages = pageArray;
      }
    } else if (copies) {
      settings.copies = parseInt(copies);
    }
  }

  return settings;
}

// Helper function untuk parse page range
function parsePageRange(pageStr) {
  if (!pageStr) return [];

  const pages = [];
  const parts = pageStr.split(",");

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    } else {
      pages.push(Number(part));
    }
  }

  return pages;
}

// Helper function untuk calculate cost
function calculateCostFromSettings(settings) {
  const colorCost = settings.colorPages.length * 1000;
  const bwCost = settings.bwPages.length * 500;
  return (colorCost + bwCost) * settings.copies;
}

// Simulate QRIS generation (akan diganti dengan real implementation)
async function simulateQRISGeneration(ctx, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      ctx
        .replyWithPhoto(
          "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TEST_QRIS",
          {
            caption: `📋 QRIS Pembayaran\nAmount: Rp ${amount.toLocaleString(
              "id-ID"
            )}`,
          }
        )
        .then(() => resolve())
        .catch((error) => {
          console.error("QRIS error:", error);
          resolve();
        });
    }, 2000);
  });
}

// Session cleanup function
// Session expiry configuration
const SESSION_EXPIRY = {
  AWAITING_FILE: 6 * 60 * 60 * 1000, // 6 jam - menunggu upload file
  CONFIGURING: 2 * 60 * 60 * 1000, // 2 jam - configuring settings
  AWAITING_PAYMENT: 30 * 60 * 1000, // 30 menit - menunggu pembayaran
  COMPLETED: 24 * 60 * 60 * 1000, // 24 jam - menyimpan history
  DEFAULT: 2 * 60 * 60 * 1000, // 2 jam - default
};
function startSessionCleanup() {
  setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    userSessions.forEach((session, userId) => {
      const expiryTime = getSessionExpiryTime(session);

      if (now > expiryTime) {
        console.log(`🧹 Cleaning expired session for user: ${userId}`);
        userSessions.delete(userId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`✅ Cleaned ${cleanedCount} expired sessions`);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

function getSessionExpiryTime(session) {
  if (!session.lastActivity) return Date.now() - 1; // Expire immediately

  const lastActivity = session.lastActivity;

  switch (session.currentStep) {
    case "awaiting_file":
      return lastActivity + SESSION_EXPIRY.AWAITING_FILE;
    case "configuring":
      return lastActivity + SESSION_EXPIRY.CONFIGURING;
    case "awaiting_payment":
      return lastActivity + SESSION_EXPIRY.AWAITING_PAYMENT;
    case "completed":
      return lastActivity + SESSION_EXPIRY.COMPLETED;
    default:
      return lastActivity + SESSION_EXPIRY.DEFAULT;
  }
}

function parseMultiLineCommands(text) {
  const lines = text.split("\n").map((line) => line.trim());
  const commands = [];

  for (const line of lines) {
    // Hanya ambil lines yang startsWith '/'
    if (line.startsWith("/")) {
      commands.push(line);
    }
  }

  return commands;
}

module.exports = { startBotServer, userSessions };
