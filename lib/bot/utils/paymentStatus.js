const midtransClient = require("midtrans-client");

async function checkPaymentStatus(orderId) {
  try {
    console.log("🔍 Checking payment status for order:", orderId);

    let snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_ENVIRONMENT === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const statusResponse = await snap.transaction.status(orderId);

    console.log("✅ Payment status found:", statusResponse.transaction_status);
    return statusResponse;
  } catch (error) {
    console.error("❌ Payment status check failed for order:", orderId);

    // ⚠️ INI MASALAHNYA: Function ini return null saat error
    // Seharusnya return object dengan status not_registered

    if (error.ApiResponse) {
      try {
        const apiResponse = JSON.parse(error.ApiResponse);
        console.error("📄 Midtrans API Error:", {
          status_code: apiResponse.status_code,
          message: apiResponse.status_message,
        });

        // ⚠️ PERBAIKAN: Jangan return null, return object dengan status
        if (apiResponse.status_code === "404") {
          return {
            transaction_status: "not_registered",
            status_code: "404",
            status_message: "Transaction not found",
          };
        }
      } catch (e) {
        console.error("📄 Raw error response:", error.ApiResponse);
      }
    }

    // ⚠️ PERBAIKAN: Return object, bukan null
    return {
      transaction_status: "error",
      error_message: error.message,
    };
  }
}
module.exports = { checkPaymentStatus };
