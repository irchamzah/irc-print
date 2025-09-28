const midtransClient = require("midtrans-client");

async function testMidtransConnection() {
  try {
    console.log(
      "🔑 Midtrans Server Key exists:",
      !!process.env.MIDTRANS_SERVER_KEY
    );
    console.log(
      "🔑 Midtrans Client Key exists:",
      !!process.env.MIDTRANS_CLIENT_KEY
    );

    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const testTransaction = await snap.createTransaction({
      transaction_details: {
        order_id: `test-${Date.now()}`,
        gross_amount: 1000,
      },
    });

    console.log("✅ Midtrans connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Midtrans connection test failed:", error.message);
    return false;
  }
}

module.exports = { testMidtransConnection };
