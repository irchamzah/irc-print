// bot/handlers/commands/status.js
const { userSessions } = require("../../config/session"); // Import instance

async function handleStatusCommand(ctx) {
  const userId = ctx.from.id;

  // Debug: cek session yang ada
  console.log("🔍 Checking status for user:", userId);
  console.log("📊 Total active sessions:", userSessions.size);

  const userSession = userSessions.get(userId);

  if (!userSession || !userSession.paymentInfo) {
    await ctx.reply("❌ Tidak ada transaksi pembayaran yang aktif.");
    return;
  }

  // DATA STATIS UNTUK TESTING
  const status = {
    transaction_status: "settlement",
    order_id: userSession.paymentInfo.orderId,
    gross_amount: userSession.paymentInfo.amount,
    payment_type: "gopay",
    transaction_time: new Date().toISOString(),
    settlement_time: new Date().toISOString(),
  };

  let statusMessage = `📊 Status Pembayaran:\nOrder ID: ${userSession.paymentInfo.orderId}\n`;
  statusMessage += `Amount: Rp ${userSession.paymentInfo.amount.toLocaleString(
    "id-ID"
  )}\n`;
  statusMessage += `Status: ${status.transaction_status}\n`;
  statusMessage += `Metode: ${status.payment_type}\n`;
  statusMessage += `Waktu: ${new Date(status.settlement_time).toLocaleString(
    "id-ID"
  )}\n`;

  if (status.transaction_status === "settlement") {
    statusMessage +=
      "\n🎉 PEMBAYARAN BERHASIL! LUNAS!\nTerima kasih telah melakukan pembayaran.";
  } else if (status.transaction_status === "pending") {
    statusMessage += "⏳ Menunggu pembayaran...";
  } else if (status.transaction_status === "expire") {
    statusMessage += "❌ Pembayaran expired. Silakan mulai lagi dengan /pay.";
  }

  await ctx.reply(statusMessage);
}

module.exports = { handleStatusCommand };
