// lib/bot/handlers/paymentHandlers.js
const midtransClient = require("midtrans-client");

// Buat Snap API instance
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const paymentHandlers = {
  // Handler untuk proses pembayaran
  handlePayment: async (ctx) => {
    try {
      const userId = ctx.from.id;
      const amount = 10000; // Contoh nominal

      const parameter = {
        transaction_details: {
          order_id: `order-${userId}-${Date.now()}`,
          gross_amount: amount,
        },
        customer_details: {
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name || "",
          email: `${ctx.from.id}@example.com`,
          phone: "081234567890",
        },
      };

      const transaction = await snap.createTransaction(parameter);
      await ctx.reply(`Silakan bayar di: ${transaction.redirect_url}`);
    } catch (error) {
      console.error("Payment error:", error);
      await ctx.reply("Terjadi error saat memproses pembayaran");
    }
  },

  // Handler untuk notification dari Midtrans
  handlePaymentNotification: async (notification) => {
    // Implementasi handling notification
    console.log("Payment notification:", notification);
  },
};

module.exports = paymentHandlers;
