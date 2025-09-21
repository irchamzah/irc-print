// Tambahkan webhook handler untuk menerima notifikasi dari Midtrans
const express = require("express");
const webhookApp = express();
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3001;

webhookApp.use(express.json());

webhookApp.post("/midtrans-webhook", async (req, res) => {
  try {
    const notification = req.body;
    console.log("🔔 Webhook received:", notification);

    // Verifikasi signature (penting untuk keamanan)
    const crypto = require("crypto");
    const signatureKey = crypto
      .createHash("sha512")
      .update(
        notification.order_id +
          notification.status_code +
          notification.gross_amount +
          process.env.MIDTRANS_SERVER_KEY
      )
      .digest("hex");

    if (signatureKey !== notification.signature_key) {
      console.error("❌ Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    // Proses notifikasi
    await handlePaymentNotification(notification);

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).send("Error");
  }
});

// Fungsi untuk menangani notifikasi pembayaran
async function handlePaymentNotification(notification) {
  const {
    order_id,
    transaction_status,
    fraud_status,
    status_code,
    gross_amount,
  } = notification;

  console.log(`📊 Payment update: ${order_id} - ${transaction_status}`);

  // Cari user berdasarkan order_id
  const userEntry = findUserByOrderId(order_id);
  if (!userEntry) {
    console.log("User not found for order:", order_id);
    return;
  }

  const [userId, userSession] = userEntry;

  // Update status pembayaran
  userSession.paymentInfo.status = transaction_status;
  userSession.paymentInfo.fraudStatus = fraud_status;
  userSessions.set(userId, userSession);

  // Kirim notifikasi ke user
  await sendPaymentStatusUpdate(
    userId,
    transaction_status,
    order_id,
    gross_amount
  );

  // Proses berdasarkan status
  switch (transaction_status) {
    case "settlement":
      await processSuccessfulPayment(userId, userSession);
      break;
    case "expire":
      await processExpiredPayment(userId, userSession);
      break;
    case "deny":
    case "cancel":
      await processFailedPayment(userId, userSession);
      break;
  }
}

// Fungsi untuk mencari user berdasarkan order ID
function findUserByOrderId(orderId) {
  const sessions = Array.from(userSessions.entries());
  return sessions.find(
    ([userId, session]) =>
      session.paymentInfo && session.paymentInfo.orderId === orderId
  );
}

// Fungsi untuk mengirim update status ke user
async function sendPaymentStatusUpdate(userId, status, orderId, amount) {
  const messages = {
    settlement: `✅ Pembayaran berhasil!\nOrder ID: ${orderId}\nAmount: Rp ${amount}\nFile akan segera diproses.`,
    pending: `⏳ Menunggu pembayaran...\nOrder ID: ${orderId}\nSilakan selesaikan pembayaran Anda.`,
    expire: `❌ Pembayaran expired.\nOrder ID: ${orderId}\nSilakan mulai ulang dengan /pay.`,
    deny: `❌ Pembayaran ditolak.\nOrder ID: ${orderId}\nSilakan coba metode pembayaran lain.`,
    cancel: `❌ Pembayaran dibatalkan.\nOrder ID: ${orderId}`,
  };

  try {
    await global.botInstance.telegram.sendMessage(
      userId,
      messages[status] || `Status: ${status}`
    );
  } catch (error) {
    console.error("Error sending status update:", error);
  }
}
