import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 [FRONTEND] Syncing pending transactions for: ${phoneNumber}`
    );

    // 1. Ambil pending transactions dari VPS
    const pendingResponse = await fetch(
      `${VPS_API_URL}/api/transactions/pending?phoneNumber=${phoneNumber}`
    );

    if (!pendingResponse.ok) {
      throw new Error("Failed to fetch pending transactions from VPS");
    }

    const pendingResult = await pendingResponse.json();

    if (!pendingResult.success || !pendingResult.pendingTransactions) {
      return NextResponse.json({
        success: true,
        pendingTransactions: [],
        updatedTransactions: [],
      });
    }

    const pendingTransactions = pendingResult.pendingTransactions;
    const updatedTransactions = [];

    console.log(
      `📦 [FRONTEND] Found ${pendingTransactions.length} pending transactions to sync`
    );

    // 2. Untuk setiap pending transaction, cek status di Midtrans
    for (const transaction of pendingTransactions) {
      try {
        console.log(
          `🔍 [FRONTEND] Checking Midtrans status for: ${transaction.orderId}`
        );

        // Gunakan endpoint payment status yang sudah ada
        const statusResponse = await fetch(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/payment/status?orderId=${transaction.orderId}`
        );

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();

          if (statusResult.success) {
            const midtransStatus = statusResult.status;
            const currentStatus = transaction.status;

            console.log(
              `📊 [FRONTEND] Transaction ${transaction.orderId}: VPS=${currentStatus}, Midtrans=${midtransStatus}`
            );

            // Jika status di Midtrans berbeda dengan di VPS, update di VPS
            if (
              (midtransStatus === "settlement" ||
                midtransStatus === "capture") &&
              currentStatus === "pending"
            ) {
              console.log(
                `🔄 [FRONTEND] Updating transaction ${transaction.orderId} to settlement`
              );

              // Update status di VPS
              const updateResponse = await fetch(
                `${VPS_API_URL}/api/transactions/update-status`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: transaction.orderId,
                    phoneNumber: phoneNumber,
                    status: "settlement",
                    midtransStatus: midtransStatus,
                  }),
                }
              );

              if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                // Di dalam loop update transaction, tambahkan:
                if (updateResult.success) {
                  updatedTransactions.push({
                    orderId: transaction.orderId,
                    oldStatus: currentStatus,
                    newStatus: "settlement",
                    transactionData: {
                      // Tambahkan data lengkap
                      ...transaction,
                      status: "settlement",
                      midtransStatus: midtransStatus,
                    },
                  });
                }
              }
            } else if (
              midtransStatus === "expire" &&
              currentStatus === "pending"
            ) {
              console.log(
                `🔄 [FRONTEND] Updating transaction ${transaction.orderId} to expired`
              );

              // Update status expired di VPS
              const updateResponse = await fetch(
                `${VPS_API_URL}/api/transactions/update-status`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: transaction.orderId,
                    phoneNumber: phoneNumber,
                    status: "expired",
                    midtransStatus: midtransStatus,
                  }),
                }
              );

              if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                  updatedTransactions.push({
                    orderId: transaction.orderId,
                    oldStatus: currentStatus,
                    newStatus: "expired",
                  });
                }
              }
            } else if (
              midtransStatus === "cancel" &&
              currentStatus === "pending"
            ) {
              console.log(
                `🔄 [FRONTEND] Updating transaction ${transaction.orderId} to cancelled`
              );

              // Update status cancelled di VPS
              const updateResponse = await fetch(
                `${VPS_API_URL}/api/transactions/update-status`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: transaction.orderId,
                    phoneNumber: phoneNumber,
                    status: "cancelled",
                    midtransStatus: midtransStatus,
                  }),
                }
              );

              if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                  updatedTransactions.push({
                    orderId: transaction.orderId,
                    oldStatus: currentStatus,
                    newStatus: "cancelled",
                  });
                }
              }
            }
          }
        } else {
          console.warn(
            `⚠️ [FRONTEND] Failed to check Midtrans status for ${transaction.orderId}`
          );
        }
      } catch (error) {
        console.error(
          `❌ [FRONTEND] Error checking Midtrans for ${transaction.orderId}:`,
          error.message
        );
        // Continue dengan transaction berikutnya
      }
    }

    // 3. Ambil ulang data terbaru dari VPS setelah update
    const finalResponse = await fetch(
      `${VPS_API_URL}/api/transactions/pending?phoneNumber=${phoneNumber}`
    );

    let finalPendingTransactions = [];
    if (finalResponse.ok) {
      const finalResult = await finalResponse.json();
      finalPendingTransactions = finalResult.pendingTransactions || [];
    } else {
      // Jika gagal ambil data terbaru, gunakan data awal
      finalPendingTransactions = pendingTransactions;
    }

    console.log(
      `✅ [FRONTEND] Sync completed: ${updatedTransactions.length} transactions updated`
    );

    return NextResponse.json({
      success: true,
      pendingTransactions: finalPendingTransactions,
      updatedTransactions: updatedTransactions,
      syncSummary: {
        checked: pendingTransactions.length,
        updated: updatedTransactions.length,
      },
    });
  } catch (error) {
    console.error("❌ [FRONTEND] Error syncing pending transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        pendingTransactions: [],
      },
      { status: 500 }
    );
  }
}
