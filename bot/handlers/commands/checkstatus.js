const { userSessions } = require("../../config/session");
// const paymentService = require("../../services/paymentService");

async function handleCheckStatusCommand(ctx) {
  const userId = ctx.from.id;
  const userSession = userSessions.get(userId);

  if (!userSession || !userSession.paymentInfo) {
    await ctx.reply("❌ Tidak ada transaksi pembayaran yang aktif.");
    return;
  }

  await ctx.reply("🔄 Mengecek status pembayaran...");

  try {
    // const status = await paymentService.checkPaymentStatus(
    //   userSession.paymentInfo.orderId
    // );

    const status = {
      transaction_status: "settlement", // Selalu lunas untuk testing
      order_id: "print-8484140221-1758949851510-1758949951611",
      gross_amount: 50000, // Amount dummy
      payment_type: "qris",
      transaction_time: new Date().toISOString(),
      settlement_time: new Date().toISOString(),
      status_code: "200",
      status_message: "Success",
    };

    if (!status) {
      await ctx.reply(
        "❌ Gagal memeriksa status pembayaran. Silakan coba lagi."
      );
      return;
    }

    let statusMessage = `📊 Status Pembayaran:\nOrder ID: ${userSession.paymentInfo.orderId}\n`;
    statusMessage += `Amount: Rp ${userSession.paymentInfo.amount.toLocaleString(
      "id-ID"
    )}\n`;
    statusMessage += `Status: ${status.transaction_status}\n`;
    statusMessage += `Metode: ${status.payment_type || "N/A"}\n`;

    if (status.transaction_status === "settlement") {
      // Update session status
      userSession.paymentInfo.status = "paid";
      userSession.lastActivity = Date.now();
      userSessions.set(userId, userSession);

      statusMessage += "\n🎉 PEMBAYARAN SUDAH LUNAS!\n";
      statusMessage += "Ketik /startprint untuk memulai proses printing.\n\n";
      statusMessage += "File Anda akan segera dicetak dengan konfigurasi:\n";
      statusMessage += `• ${
        userSession.settings
          ? JSON.stringify(userSession.settings)
          : "Default settings"
      }`;
    } else if (status.transaction_status === "pending") {
      statusMessage += "\n⏳ MENUNGGU PEMBAYARAN...\n";
      statusMessage += "Silakan selesaikan pembayaran Anda.\n";
      statusMessage += `Gunakan QRIS yang sudah diberikan atau bayar di: ${userSession.paymentInfo.payment_url}`;
    } else if (status.transaction_status === "expire") {
      statusMessage += "\n❌ PEMBAYARAN EXPIRED\n";
      statusMessage +=
        "Silakan mulai lagi dengan /pay untuk membuat pembayaran baru.";
    } else {
      statusMessage += `\n📝 Status: ${status.transaction_status}\n`;
      statusMessage += "Silakan coba lagi nanti atau hubungi admin.";
    }

    await ctx.reply(statusMessage);
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    await ctx.reply("❌ Gagal memeriksa status pembayaran. Silakan coba lagi.");
  }
}

module.exports = { handleCheckStatusCommand };
