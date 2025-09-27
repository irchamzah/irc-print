const { userSessions } = require("../utils/sessionManager"); // ← INI

async function createPaymentLink(orderId, amount, userId, fileName) {
  try {
    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const authString = Buffer.from(serverKey + ":").toString("base64");

    const apiUrl = isProduction
      ? "https://api.midtrans.com/v1/payment-links"
      : "https://api.sandbox.midtrans.com/v1/payment-links";

    // ⚠️ TAMBAHKAN CUSTOM IDENTIFIER
    const webOrderId = `web-${userId}-${Date.now()}`;
    console.log("🌐 Web Order ID:", webOrderId);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        usage: 1,
        item_details: [
          {
            id: "print-service",
            name: `Print: ${fileName.substring(0, 40)}`,
            price: amount,
            quantity: 1,
          },
        ],
        customer_details: {
          first_name: `Telegram User`,
          last_name: userId.toString(),
          email: `user-${userId}@telegram.print24jam.com`,
        },
        enabled_payments: ["qris", "gopay", "shopeepay", "bank_transfer"],
        metadata: {
          telegram_user_id: userId,
          file_name: fileName,
          // ⚠️ TAMBAHKAN CUSTOM IDENTIFIER UNTUK PENCARIAN
          web_order_id: webOrderId,
          bot_order_id: orderId, // Simpan juga order ID asli
          custom_reference: `telegram-bot-${userId}`,
        },
      }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(data.error_message || `HTTP ${response.status}`);
    }

    if (!data.payment_url) {
      throw new Error("Payment URL not received from Midtrans");
    }

    console.log("✅ Payment link created");
    console.log("   Midtrans Order ID:", data.order_id || orderId);
    console.log("   Web Order ID:", webOrderId);

    return {
      success: true,
      payment_url: data.payment_url,
      order_id: data.order_id || orderId,
      web_order_id: webOrderId, // ⬅️ RETURN WEB ORDER ID
      transaction_id: data.id || data.transaction_id,
    };
  } catch (error) {
    console.error("❌ Payment Link creation error:", error);
    return { success: false, error: error.message };
  }
}
async function generatePaymentLink(ctx, amount) {
  try {
    const userId = ctx.from.id;
    const userSession = userSessions.get(userId);
    const orderId = `print-${userId}-${Date.now()}`;
    const webOrderId = `web-${userId}-${Date.now()}`; // ⚠️ BUAT WEB ORDER ID

    console.log("📦 Generated Order ID:", orderId);
    console.log("🌐 Generated Web Order ID:", webOrderId);

    const paymentLinkResult = await createPaymentLink(
      orderId,
      amount,
      userId,
      userSession.fileName
    );

    if (!paymentLinkResult.success) {
      throw new Error(paymentLinkResult.error);
    }

    // ⚠️ SIMPAN WEB ORDER ID DI SESSION
    userSession.paymentInfo = {
      orderId: paymentLinkResult.order_id,
      webOrderId: paymentLinkResult.web_order_id || webOrderId, // ⬅️ SIMPAN WEB ORDER ID
      amount: amount,
      payment_url: paymentLinkResult.payment_url,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    userSessions.set(userId, userSession);

    await ctx.reply(
      `💳 *Payment Link Created*\n\n` +
        `Amount: Rp ${amount.toLocaleString("id-ID")}\n` +
        `Order ID: ${paymentLinkResult.order_id}\n` +
        `Web Reference: ${webOrderId}\n\n` +
        `Payment URL: ${paymentLinkResult.payment_url}`,
      { parse_mode: "Markdown" }
    );

    return true;
  } catch (error) {
    console.error("❌ Error generating Payment Link:", error);
    ctx.reply("❌ Gagal membuat payment link. Silakan coba lagi.");
    return false;
  }
}

// Tambahkan function ini di paymentUtils.js
async function findOrdersByPattern(userId, searchPattern) {
  try {
    console.log("🔍 Searching for orders with pattern:", searchPattern);

    const coreApi = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_ENVIRONMENT === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // Method 1: Using transaction API with filters
    const transactions = await coreApi.transaction.all({
      // Midtrans doesn't support wildcard search directly,
      // but we can filter by other criteria and then filter locally
      page: 1,
      per_page: 50,
      sort: "transaction_time",
      order: "desc",
    });

    console.log("📊 Found", transactions.length, "transactions");

    // Filter transactions that match our pattern
    const matchingTransactions = transactions.filter(
      (transaction) =>
        transaction.order_id && transaction.order_id.includes(searchPattern)
    );

    console.log(
      "✅ Found",
      matchingTransactions.length,
      "matching transactions"
    );

    return matchingTransactions;
  } catch (error) {
    console.error("❌ Error searching transactions:", error);

    // Fallback: Try direct API call
    try {
      return await findOrdersDirectAPI(searchPattern);
    } catch (fallbackError) {
      console.error("❌ Fallback search also failed:", fallbackError);
      return [];
    }
  }
}

// Alternative: Direct API call with fetch
async function findOrdersDirectAPI(searchPattern) {
  try {
    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const authString = Buffer.from(serverKey + ":").toString("base64");

    const apiUrl = isProduction
      ? "https://api.midtrans.com/v1"
      : "https://api.sandbox.midtrans.com/v1";

    // Get recent transactions
    const response = await fetch(
      `${apiUrl}?page=1&per_page=100&sort=transaction_time&order=desc`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const transactions = await response.json();

    // Filter transactions that match our pattern
    return transactions.filter(
      (transaction) =>
        transaction.order_id && transaction.order_id.includes(searchPattern)
    );
  } catch (error) {
    console.error("❌ Direct API search error:", error);
    throw error;
  }
}

// Tambahkan di paymentUtils.js
async function findOrderByWebId(webOrderId) {
  try {
    console.log("🔍 Searching for order by Web ID:", webOrderId);

    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const authString = Buffer.from(serverKey + ":").toString("base64");

    const apiUrl = isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2";

    // Get all recent transactions
    const response = await fetch(
      `${apiUrl}?page=1&per_page=100&sort=transaction_time&order=desc`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const transactions = await response.json();

    // Cari transaction yang metadata-nya mengandung webOrderId
    const matchingTransactions = transactions.filter((transaction) => {
      if (!transaction || !transaction.metadata) return false;

      // Convert metadata object to string untuk pencarian
      const metadataStr = JSON.stringify(transaction.metadata).toLowerCase();
      const searchStr = webOrderId.toLowerCase();

      return metadataStr.includes(searchStr);
    });

    console.log(
      "✅ Found transactions by Web ID:",
      matchingTransactions.length
    );

    if (matchingTransactions.length > 0) {
      return matchingTransactions[0]; // Return yang pertama
    }

    return null;
  } catch (error) {
    console.error("❌ Error searching by Web ID:", error);
    return null;
  }
}

// Function untuk search by custom reference
async function findOrderByCustomReference(userId) {
  try {
    const customRef = `telegram-bot-${userId}`;
    console.log("🔍 Searching by custom reference:", customRef);

    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const authString = Buffer.from(serverKey + ":").toString("base64");

    const apiUrl = isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2";

    const response = await fetch(
      `${apiUrl}?page=1&per_page=100&sort=transaction_time&order=desc`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const transactions = await response.json();

    // Cari by custom reference di metadata
    const matchingTransactions = transactions.filter((transaction) => {
      if (!transaction || !transaction.metadata) return false;

      const metadataStr = JSON.stringify(transaction.metadata).toLowerCase();
      return metadataStr.includes(customRef.toLowerCase());
    });

    console.log(
      "✅ Found transactions by custom reference:",
      matchingTransactions.length
    );

    return matchingTransactions;
  } catch (error) {
    console.error("❌ Error searching by custom reference:", error);
    return [];
  }
}

// Function to find specific order by partial match
async function findSpecificOrder(userId, partialOrderId) {
  try {
    console.log("🔍 Looking for order with partial ID:", partialOrderId);

    // Search pattern: user ID + timestamp prefix
    const searchPattern = `print-${userId}-${partialOrderId.split("-")[2]}`;

    const transactions = await findOrdersByPattern(userId, searchPattern);

    if (transactions.length === 0) {
      console.log("❌ No transactions found with pattern:", searchPattern);
      return null;
    }

    // Find the most recent matching transaction
    const mostRecent = transactions.sort(
      (a, b) => new Date(b.transaction_time) - new Date(a.transaction_time)
    )[0];

    console.log("✅ Found order:", mostRecent.order_id);
    console.log("   Status:", mostRecent.transaction_status);
    console.log("   Time:", mostRecent.transaction_time);

    return mostRecent;
  } catch (error) {
    console.error("❌ Error finding specific order:", error);
    return null;
  }
}

// Function untuk extract timestamp pertama dari order ID
function extractFirstTimestamp(orderId) {
  try {
    const parts = orderId.split("-");
    if (parts.length >= 3) {
      return parts[2]; // timestamp pertama: print-userId-TIMESTAMP1
    }
    return null;
  } catch (error) {
    console.error("Error extracting timestamp:", error);
    return null;
  }
}

// Function yang BENAR-BENAR memanggil API Midtrans untuk search
async function searchOrdersInMidtrans(userId, searchPattern) {
  try {
    console.log(
      "🔍 [SEARCH] Searching in Midtrans API for pattern:",
      searchPattern
    );

    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const authString = Buffer.from(serverKey + ":").toString("base64");

    const apiUrl = isProduction
      ? "https://api.midtrans.com/v1"
      : "https://api.sandbox.midtrans.com/v1";

    // ⚠️ INI YANG BENAR-BENAR MEMANGGIL MIDTRANS API
    const response = await fetch(
      `${apiUrl}?page=1&per_page=100&sort=transaction_time&order=desc`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    console.log("📊 [SEARCH] API Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const transactions = await response.json();
    console.log(
      "📊 [SEARCH] Total transactions from API:",
      transactions.length
    );

    // Filter transactions yang match pattern
    const matchingTransactions = transactions.filter(
      (transaction) =>
        transaction.order_id && transaction.order_id.includes(searchPattern)
    );

    console.log(
      "✅ [SEARCH] Found matching transactions:",
      matchingTransactions.length
    );

    return matchingTransactions;
  } catch (error) {
    console.error("❌ [SEARCH] Error searching in Midtrans:", error);
    return [];
  }
}

// Function yang memanggil search dan return result
async function findOrderByTimestampPattern(userId, originalOrderId) {
  try {
    console.log("🎯 [FIND] Starting search for:", originalOrderId);

    // Extract timestamp pertama
    const parts = originalOrderId.split("-");
    if (parts.length < 3) {
      console.log("❌ [FIND] Invalid order ID format");
      return null;
    }

    const firstTimestamp = parts[2];
    const searchPattern = `print-${userId}-${firstTimestamp}`;

    console.log("🔍 [FIND] Search pattern:", searchPattern);

    // ⚠️ INI PEMANGGILAN API YANG SEBENARNYA
    const matchingTransactions = await searchOrdersInMidtrans(
      userId,
      searchPattern
    );

    if (matchingTransactions.length === 0) {
      console.log("❌ [FIND] No transactions found with pattern");
      return null;
    }

    // Ambil yang paling baru
    const mostRecent = matchingTransactions.sort(
      (a, b) => new Date(b.transaction_time) - new Date(a.transaction_time)
    )[0];

    console.log("🎉 [FIND] Found order:", mostRecent.order_id);
    return mostRecent;
  } catch (error) {
    console.error("❌ [FIND] Error in findOrderByTimestampPattern:", error);
    return null;
  }
}

// Function untuk mendapatkan semua transaksi terbaru
async function getAllRecentTransactions() {
  try {
    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const authString = Buffer.from(serverKey + ":").toString("base64");

    const apiUrl = isProduction
      ? "https://api.midtrans.com/v1"
      : "https://api.sandbox.midtrans.com/v1";

    // Get recent transactions (last 100)
    const response = await fetch(
      `${apiUrl}?page=1&per_page=100&sort=transaction_time&order=desc`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);

    // Fallback: try with midtrans-client library
    try {
      const coreApi = new midtransClient.CoreApi({
        isProduction: process.env.MIDTRANS_ENVIRONMENT === "production",
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      const transactions = await coreApi.transaction.all({
        page: 1,
        per_page: 50,
      });

      return Array.isArray(transactions) ? transactions : [];
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return [];
    }
  }
}

module.exports = { createPaymentLink, generatePaymentLink };
