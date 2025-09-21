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

  // Handler untuk text messages (fallback)
  bot.on(message("text"), (ctx) => {
    ctx.reply(
      "Perintah tidak dikenali. Gunakan commands:\n" +
        "/file <nama_file> - Set file name\n" +
        "/setprint <settings> - Atur print settings\n" +
        "/pay - Lanjutkan pembayaran"
    );
  });

  // Error handling
  bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    ctx.reply("❌ Terjadi error. Silakan coba lagi.");
  });

  return bot.launch();
}

function handleFileCommand(ctx, commandText) {
  const fileName = commandText.replace("/file", "").trim();
  const userId = ctx.from.id;

  console.log("📁 File command received:", { userId, fileName });

  if (!userSessions.has(userId)) {
    userSessions.set(userId, {});
    console.log("🆕 New user session created for userId:", userId);
  }

  const userSession = userSessions.get(userId);
  userSession.fileName = fileName;
  userSession.lastActivity = Date.now(); // 🔄 Update timestamp
  userSession.currentStep = "configuring";

  userSessions.set(userId, userSession);

  console.log("💾 User session updated:", JSON.stringify(userSession, null, 2));

  ctx.reply(`✅ File name disimpan: ${fileName}`);
}

function handleSetPrintCommand(ctx, commandText) {
  const settingsText = commandText.replace("/setprint", "").trim();
  const userId = ctx.from.id;

  console.log("⚙️ Setprint command received:", { userId, settingsText });

  try {
    const settings = parsePrintSettings(settingsText);
    const cost = calculateCostFromSettings(settings);

    if (!userSessions.has(userId)) {
      userSessions.set(userId, {});
      console.log("🆕 New user session created for userId:", userId);
    }

    const userSession = userSessions.get(userId);
    userSession.settings = settings;
    userSession.cost = cost;
    userSessions.set(userId, userSession);

    console.log(
      "💾 User session updated:",
      JSON.stringify(userSession, null, 2)
    );

    ctx.reply(
      `✅ Settings diterima! Total biaya: Rp ${cost.toLocaleString("id-ID")}`
    );
  } catch (error) {
    console.error("❌ Error parsing settings:", error);
    ctx.reply("❌ Format settings tidak valid.");
  }
}

// Handler untuk /pay command
function handlePayCommand(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  if (!userSession) {
    return ctx.reply(
      "❌ Silakan set settings terlebih dahulu dengan /setprint"
    );
  }

  if (!userSession.fileName) {
    return ctx.reply("❌ Silakan set file name dengan /file <nama_file>");
  }

  if (!userSession.settings) {
    return ctx.reply("❌ Silakan set print settings dengan /setprint");
  }

  // Cek jika file sudah diupload
  if (!userSession.fileUploaded) {
    return ctx.reply(
      "❌ File belum diupload. Silakan upload file PDF Anda terlebih dahulu.\n\n" +
        "Setelah file terupload, ketik /pay lagi untuk melanjutkan pembayaran."
    );
  }

  // Lanjutkan dengan pembayaran
  ctx.reply(
    `✅ Semua data lengkap!\n\n` +
      `File: ${userSession.fileName}\n` +
      `Settings: ${JSON.stringify(userSession.settings)}\n` +
      `Total biaya: Rp ${userSession.cost.toLocaleString("id-ID")}\n\n` +
      `Sekarang generating QRIS payment...`
  );

  // TODO: Implement QRIS generation
  simulateQRISGeneration(ctx, userSession.cost);
}

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

  ctx.reply(
    `✅ File diterima: ${file.file_name}\n\n` +
      (userSession.settings
        ? `Settings sudah diset. Ketik /pay untuk lanjut pembayaran.`
        : `Silakan set print settings dengan /setprint color:1,3 bw:2,4 copies:2`)
  );
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
function simulateQRISGeneration(ctx, amount) {
  setTimeout(() => {
    ctx.replyWithPhoto(
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TEST_QRIS",
      {
        caption:
          `📋 QRIS Pembayaran\n` +
          `Amount: Rp ${amount.toLocaleString("id-ID")}\n\n` +
          `Scan QR code di atas untuk melakukan pembayaran.`,
      }
    );
  }, 2000);
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

module.exports = { startBotServer, userSessions };
