import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/transactions/pending/sync
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // 1. Ambil pending transactions dari VPS
    const pendingResponse = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/pending?phoneNumber=${phoneNumber}`,
    );

    if (!pendingResponse.ok) {
      console.error(`❌ VPS pending API error: ${pendingResponse.status}`);
      // Jangan throw error, return empty array instead
      return NextResponse.json({
        success: true,
        pendingTransactions: [],
        updatedTransactions: [],
      });
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

    // 2. Untuk setiap pending transaction, cek status di Midtrans
    for (const transaction of pendingTransactions) {
      try {
        const orderId = transaction.orderId;
        const currentStatus =
          transaction.transactionStatus || transaction.status;

        // Skip jika sudah paid atau printed
        if (currentStatus === "paid" || currentStatus === "printed") {
          continue;
        }

        const statusResponse = await fetch(
          `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/check-status?orderId=${orderId}&phoneNumber=${phoneNumber}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();

          if (statusResult.success) {
            const midtransStatus =
              statusResult.midtransStatus || statusResult.status;

            // Jika status di Midtrans settlement/capture, update ke "paid"
            if (
              (midtransStatus === "settlement" ||
                midtransStatus === "capture") &&
              currentStatus === "pending"
            ) {
              const updateResponse = await fetch(
                `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/update-status`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: orderId,
                    phoneNumber: phoneNumber,
                    status: "paid",
                    midtransStatus: midtransStatus,
                  }),
                },
              );

              if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                  updatedTransactions.push({
                    orderId: orderId,
                    oldStatus: currentStatus,
                    newStatus: "paid",
                    transactionData: {
                      ...transaction,
                      transactionStatus: "paid",
                    },
                  });
                }
              }
            } else if (
              midtransStatus === "expire" &&
              currentStatus === "pending"
            ) {
              // Update ke expired
            } else if (
              midtransStatus === "cancel" &&
              currentStatus === "pending"
            ) {
              // Update ke cancelled
            }
          }
        } else {
          console.warn(`⚠️ [FRONTEND] Failed to check status for ${orderId}`);
        }
      } catch (error) {
        console.error(
          `❌ [FRONTEND] Error checking status for ${transaction.orderId}:`,
          error.message,
        );
      }
    }

    // 3. Ambil ulang data terbaru dari VPS setelah update
    const finalResponse = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/pending?phoneNumber=${phoneNumber}`,
    );

    let finalPendingTransactions = [];
    if (finalResponse.ok) {
      const finalResult = await finalResponse.json();
      finalPendingTransactions = finalResult.pendingTransactions || [];
    } else {
      finalPendingTransactions = pendingTransactions;
    }

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
    // ✅ JANGAN RETURN ERROR, return empty array
    return NextResponse.json(
      {
        success: true,
        pendingTransactions: [],
        updatedTransactions: [],
        error: error.message,
      },
      { status: 200 },
    );
  }
}
