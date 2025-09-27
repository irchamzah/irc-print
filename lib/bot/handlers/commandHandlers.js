const {
  parsePrintSettings,
  calculateCostFromSettings,
  formatSettingsForMessage,
} = require("../utils/printUtils");
const { createPaymentLink } = require("../utils/paymentUtils");
const { checkPaymentStatus } = require("../utils/paymentStatus");

// GANTI import userSessions:
const { userSessions } = require("../utils/sessionManager"); // ← INI
const { generatePaymentLink } = require("../utils/paymentUtils");

// Delay the import to avoid circular dependencies
function getUserSessions() {
  if (!userSessions) {
    userSessions = require("../server").userSessions;
  }
  return userSessions;
}

async function handleStart(ctx) {
  const startParam = ctx.message.text.split(" ")[1];

  if (startParam) {
    try {
      const decodedMessage = decodeURIComponent(
        Buffer.from(startParam, "base64").toString()
      );
      const commands = decodedMessage.split("\n").filter((cmd) => cmd.trim());

      const {
        executeCommandsSequentially,
      } = require("../utils/commandExecutor");
      await executeCommandsSequentially(ctx, commands);
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
}

async function handleFile(ctx) {
  const commandText = ctx.message.text;
  const match = commandText.match(/^\/file\s+(.+)$/);

  if (!match) {
    return ctx.reply("❌ Format salah. Gunakan: /file <nama_file>");
  }

  const fileName = match[1].trim();
  const userId = ctx.from.id;

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

  ctx.reply(`✅ File name disimpan: ${fileName}\n\nSilakan upload file PDF.`);
}

async function handleSetPrint(ctx) {
  const commandText = ctx.message.text;
  const match = commandText.match(/^\/setprint\s+(.+)$/);

  if (!match) {
    return ctx.reply(
      "❌ Format salah. Gunakan: /setprint color:1 bw:2-6 copies:1"
    );
  }

  const settingsText = match[1].trim();
  const userId = ctx.from.id;

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

    const formattedSettings = formatSettingsForMessage(settings);

    ctx.reply(
      `✅ Settings diterima!\n` +
        `• ${formattedSettings}\n` +
        `• Total biaya: Rp ${cost.toLocaleString("id-ID")}\n\n` +
        `Silakan ketik /pay untuk mulai pembayaran.`
    );
  } catch (error) {
    console.error("❌ Error parsing settings:", error);
    ctx.reply(
      "❌ Format settings tidak valid. Contoh: /setprint color:1 bw:2-6 copies:1"
    );
  }
}

async function handlePay(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  if (!userSession) {
    return ctx.reply("❌ Silakan mulai dengan /file terlebih dahulu");
  }

  if (!userSession.fileName) {
    return ctx.reply("❌ Silakan set file name dengan /file <nama_file>");
  }

  if (!userSession.settings) {
    return ctx.reply("❌ Silakan set print settings dengan /setprint");
  }

  if (!userSession.fileUploaded) {
    return ctx.reply(
      "❌ File belum diupload. Silakan upload file PDF terlebih dahulu."
    );
  }

  ctx.reply(
    `✅ Semua data lengkap! Total: Rp ${userSession.cost.toLocaleString(
      "id-ID"
    )}. Membuat payment link...`
  );

  try {
    await generatePaymentLink(ctx, userSession.cost);

    userSession.currentStep = "awaiting_payment";
    userSession.lastActivity = Date.now();
    userSessions.set(userId, userSession);
  } catch (error) {
    console.error("Payment error:", error);
    ctx.reply("❌ Error processing payment");
  }
}

async function handleDebug(ctx) {
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
}

async function handleDebugAll(ctx) {
  const ADMIN_ID = 123456789;
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
}

async function handleStatus(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  if (!userSession || !userSession.paymentInfo) {
    return ctx.reply("❌ Tidak ada transaksi pembayaran yang aktif.");
  }

  let orderId = userSession.paymentInfo.orderId;
  console.log("🔍 [STATUS] Checking status for order:", orderId);

  // Step 1: Coba dengan order ID yang disimpan
  let status = await checkPaymentStatus(orderId);
  console.log("📊 [STATUS] Initial status check result:", status);

  // Step 2: Jika tidak ditemukan, CARI DI MIDTRANS
  if (!status || status.transaction_status === "not_registered") {
    console.log("🔄 [STATUS] Order not found, searching in Midtrans...");

    // ⚠️ INI BAGIAN YANG MEMANGGIL SEARCH
    const { findOrderByTimestampPattern } = require("../utils/paymentUtils");
    const foundOrder = await findOrderByTimestampPattern(userId, orderId);

    if (foundOrder) {
      console.log("✅ [STATUS] Found order in Midtrans:", foundOrder.order_id);

      // Update session dengan order ID yang benar
      userSession.paymentInfo.orderId = foundOrder.order_id;
      userSession.paymentInfo.amount = parseInt(foundOrder.gross_amount);
      userSessions.set(userId, userSession);

      // Check status dengan order ID yang benar
      status = await checkPaymentStatus(foundOrder.order_id);
      console.log("📊 [STATUS] New status after search:", status);
    } else {
      console.log("❌ [STATUS] No order found in Midtrans search");
    }
  }

  // Step 3: Handle case tidak ditemukan
  if (!status || status.transaction_status === "not_registered") {
    return ctx.reply(
      "❌ Transaksi tidak ditemukan di sistem Midtrans.\n\n" +
        `Order ID: ${orderId}\n` +
        "Silakan buat transaksi baru dengan /pay"
    );
  }

  // Step 4: Tampilkan status
  let statusMessage = `📊 Status Pembayaran:\n`;
  statusMessage += `Order ID: ${userSession.paymentInfo.orderId}\n`;
  statusMessage += `Amount: Rp ${userSession.paymentInfo.amount.toLocaleString(
    "id-ID"
  )}\n`;
  statusMessage += `Status: ${status.transaction_status}\n`;

  if (status.transaction_status === "settlement") {
    statusMessage += "✅ Pembayaran berhasil! File akan segera diproses.";
    // TODO: Trigger printing process here
  } else if (status.transaction_status === "pending") {
    statusMessage += "⏳ Menunggu pembayaran...\n";
    statusMessage += "Silakan selesaikan pembayaran Anda.";
  } else if (status.transaction_status === "expire") {
    statusMessage += "❌ Pembayaran expired.\n";
    statusMessage += "Silakan mulai lagi dengan /pay.";
  } else if (status.transaction_status === "cancel") {
    statusMessage += "❌ Pembayaran dibatalkan.\n";
    statusMessage += "Silakan mulai lagi dengan /pay.";
  }

  ctx.reply(statusMessage);
}

async function debugOrderSearch(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  if (!userSession || !userSession.paymentInfo) {
    return ctx.reply("❌ Tidak ada transaksi yang aktif.");
  }

  const orderId = userSession.paymentInfo.orderId;

  const {
    extractFirstTimestamp,
    findOrderByTimestampPattern,
    getAllRecentTransactions,
  } = require("../utils/paymentUtils");

  const firstTimestamp = extractFirstTimestamp(orderId);

  let debugMessage = `🔍 Debug Order Search\n`;
  debugMessage += `User ID: ${userId}\n`;
  debugMessage += `Order ID in session: ${orderId}\n`;
  debugMessage += `First timestamp: ${firstTimestamp}\n\n`;

  // Cari matching orders
  const foundOrder = await findOrderByTimestampPattern(userId, orderId);

  if (foundOrder) {
    debugMessage += `✅ FOUND MATCHING ORDER:\n`;
    debugMessage += `Order ID: ${foundOrder.order_id}\n`;
    debugMessage += `Status: ${foundOrder.transaction_status}\n`;
    debugMessage += `Amount: ${foundOrder.gross_amount}\n`;
    debugMessage += `Time: ${foundOrder.transaction_time}\n`;
  } else {
    debugMessage += `❌ NO MATCHING ORDER FOUND\n\n`;

    // Show recent transactions for debugging
    const recentTransactions = await getAllRecentTransactions();
    debugMessage += `Recent transactions in Midtrans: ${recentTransactions.length}\n`;

    if (recentTransactions.length > 0) {
      debugMessage += `Last 3 transactions:\n`;
      recentTransactions.slice(0, 3).forEach((tx, index) => {
        debugMessage += `${index + 1}. ${tx.order_id} (${
          tx.transaction_status
        })\n`;
      });
    }
  }

  ctx.reply(debugMessage);
}

// Tambahkan di commandHandlers.js untuk test
async function testMidtransSearch(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  if (!userSession || !userSession.paymentInfo) {
    return ctx.reply("❌ No active session");
  }

  const orderId = userSession.paymentInfo.orderId;
  const { searchOrdersInMidtrans } = require("../utils/paymentUtils");

  // Test search langsung
  const parts = orderId.split("-");
  const searchPattern = `print-${userId}-${parts[2]}`;

  ctx.reply(`🔍 Testing search for pattern: ${searchPattern}`);

  const results = await searchOrdersInMidtrans(userId, searchPattern);

  let message = `📊 Search Results:\n`;
  message += `Pattern: ${searchPattern}\n`;
  message += `Found: ${results.length} transactions\n\n`;

  results.forEach((tx, index) => {
    message += `${index + 1}. ${tx.order_id}\n`;
    message += `   Status: ${tx.transaction_status}\n`;
    message += `   Amount: ${tx.gross_amount}\n\n`;
  });

  ctx.reply(message);
}

async function showAllTransactions(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Konfigurasi Snap API
    const snap = new midtransClient.Snap({
      isProduction: false, // Ganti true untuk production
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // Get list transaksi
    // Note: Midtrans API memiliki limit dan pagination
    const transactions = await snap.transaction.all({
      // Optional parameters
      // from_date: "2024-01-01",
      // to_date: "2024-12-31",
      // page: 1,
      // per_page: 10
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "Error fetching transactions",
      error: error.message,
    });
  }
}

module.exports = {
  handleStart,
  handleFile,
  handleSetPrint,
  handlePay,
  handleDebug,
  handleDebugAll,
  handleStatus,
  debugOrderSearch,
  testMidtransSearch,
  showAllTransactions,
};
