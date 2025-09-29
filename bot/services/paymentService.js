const midtransClient = require("midtrans-client");
const userSessions = require("../config/session").userSessions;

class PaymentService {
  async generateQRIS(orderId, amount) {
    try {
      const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
      let snap = new midtransClient.Snap({
        isProduction: isProduction,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      });

      let parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        enabled_payments: ["qris"],
      };

      const transaction = await snap.createTransaction(parameter);

      if (!transaction.redirect_url) {
        throw new Error("Redirect URL not found in transaction response");
      }

      let qrCodeUrl;
      if (isProduction && transaction.qr_code) {
        qrCodeUrl = transaction.qr_code;
      } else {
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          transaction.redirect_url
        )}`;
      }

      return {
        success: true,
        qr_code: qrCodeUrl,
        redirect_url: transaction.redirect_url,
        payment_url: transaction.redirect_url,
        transaction_id: transaction.transaction_id || transaction.token,
        token: transaction.token,
      };
    } catch (error) {
      console.error("❌ QRIS generation error:", error);
      return { success: false, error: error.message };
    }
  }

  async processPayment(ctx, userSession) {
    try {
      const orderId = `print-${ctx.from.id}-${Date.now()}`;
      const qrisResult = await this.generateQRIS(orderId, userSession.cost);

      if (!qrisResult.success) {
        throw new Error(qrisResult.error);
      }

      // Update session dengan payment info
      const userId = ctx.from.id;
      userSession.paymentInfo = {
        orderId: orderId,
        amount: userSession.cost,
        transactionId: qrisResult.transaction_id,
        token: qrisResult.token,
        status: "pending",
        payment_url: qrisResult.payment_url,
      };
      userSession.currentStep = "awaiting_payment";
      userSession.lastActivity = Date.now();
      userSessions.set(userId, userSession);

      // Kirim QRIS ke user
      try {
        await ctx.replyWithPhoto(qrisResult.qr_code, {
          caption: `📋 QRIS Pembayaran\nAmount: Rp ${userSession.cost.toLocaleString(
            "id-ID"
          )}\n\nSilakan scan QR code ini untuk melakukan pembayaran.`,
        });
      } catch (photoError) {
        await ctx.reply(
          `📋 QRIS Pembayaran\nAmount: Rp ${userSession.cost.toLocaleString(
            "id-ID"
          )}\n\nSilakan gunakan link berikut: ${qrisResult.payment_url}`
        );
      }

      await ctx.reply(
        "💳 *Cara Pembayaran:*\n\n1. Buka aplikasi dompet digital\n2. Scan QR code di atas\n3. Konfirmasi pembayaran\n\nAtau klik: " +
          qrisResult.payment_url +
          "\n\nKetik /checkstatus untuk mengecek status pembayaran.",
        { parse_mode: "Markdown" }
      );

      this.startPaymentStatusCheck(ctx, orderId);
    } catch (error) {
      console.error("❌ Payment error:", error);
      let errorMessage = "❌ Gagal generate QRIS. ";
      if (error.message.includes("credentials")) {
        errorMessage += "Error autentikasi dengan payment gateway.";
      } else {
        errorMessage += "Silakan coba lagi atau hubungi admin.";
      }
      await ctx.reply(errorMessage);
    }
  }

  startPaymentStatusCheck(ctx, orderId) {
    const checkInterval = setInterval(async () => {
      const status = await this.checkPaymentStatus(orderId);

      if (status && status.transaction_status === "settlement") {
        clearInterval(checkInterval);
        await this.handleSuccessfulPayment(ctx, orderId);
      } else if (status && status.transaction_status === "expire") {
        clearInterval(checkInterval);
        await ctx.reply(
          "❌ Waktu pembayaran telah habis. Silakan mulai lagi dengan /pay."
        );
      }
    }, 10000);
  }

  async checkPaymentStatus(orderId) {
    try {
      const midtransClient = require("midtrans-client");

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      const statusResponse = await snap.transaction.status(orderId);
      console.log(
        "📊 Payment status for",
        orderId,
        ":",
        statusResponse.transaction_status
      );

      return statusResponse;
    } catch (error) {
      console.error("❌ Payment status check error:", error.message);
      return null;
    }
  }

  async handleSuccessfulPayment(ctx, orderId) {
    const userId = ctx.from.id;
    const userSession = userSessions.get(userId);

    userSession.paymentInfo.status = "paid";
    userSession.currentStep = "payment_completed";
    userSessions.set(userId, userSession);

    await ctx.reply(
      "✅ Pembayaran berhasil! File Anda akan segera diproses untuk dicetak."
    );
    await this.processPrinting(ctx, userSession);
  }

  async processPrinting(ctx, userSession) {
    try {
      await ctx.reply("🖨️ Memproses printing...");
      // Implement printing logic here
      await ctx.reply("✅ Printing selesai! File Anda telah berhasil dicetak.");
      userSessions.delete(ctx.from.id);
    } catch (error) {
      console.error("Printing error:", error);
      await ctx.reply("❌ Gagal memproses printing. Silakan hubungi admin.");
    }
  }

  async processPrinting(ctx, userSession) {
    try {
      await ctx.reply("🖨️ Memproses printing...");

      // Dapatkan info file dari session
      if (!userSession.fileInfo || !userSession.fileInfo.localPath) {
        throw new Error("File tidak ditemukan untuk printing");
      }

      const fileInfo = userSession.fileInfo;

      // TODO: Implement printing logic di sini
      // Untuk sekarang, kita hanya konfirmasi file siap diprint

      await ctx.reply(
        `✅ File siap dicetak!\n\n` +
          `📄 File: ${fileInfo.fileName}\n` +
          `📁 Lokal: ${fileInfo.downloadedName}\n` +
          `⚙️ Settings: ${JSON.stringify(userSession.settings)}\n` +
          `🖨️ Akan dicetak dengan konfigurasi yang sudah ditentukan.`
      );

      // Simpan info printing ke database atau log (opsional)
      await this.logPrintJob(userSession);

      // Hapus session setelah selesai
      const { userSessions } = require("../config/session");
      userSessions.delete(ctx.from.id);
    } catch (error) {
      console.error("Printing error:", error);
      await ctx.reply("❌ Gagal memproses printing. Silakan hubungi admin.");
    }
  }

  async logPrintJob(userSession) {
    // TODO: Implement logging ke database
    console.log("📋 Print job completed:", {
      userId: userSession.userId,
      fileName: userSession.fileInfo.fileName,
      settings: userSession.settings,
      cost: userSession.cost,
      completedAt: new Date().toISOString(),
    });
  }
}

module.exports = new PaymentService();
