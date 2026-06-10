import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// GET /app/api/payment/status/route.js
export async function GET(request) {
  // ✅ Deklarasikan orderId di luar try-catch agar bisa diakses di catch
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  try {
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // VALIDASI ENVIRONMENT VARIABLES
    const midtransEnvironment = process.env.NEXT_PUBLIC_MIDTRANS_ENVIRONMENT;
    const isProduction = midtransEnvironment === "production";

    const serverKey = isProduction
      ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
      : process.env.MIDTRANS_SERVER_KEY_SANDBOX;

    if (!serverKey) {
      console.error("❌ Midtrans server key is missing");
      return NextResponse.json(
        {
          success: false,
          error: "Midtrans configuration error",
          environment: midtransEnvironment,
        },
        { status: 500 },
      );
    }

    // Initialize Snap client
    let snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
    });

    // Check transaction status dengan timeout
    const statusResponse = await Promise.race([
      snap.transaction.status(orderId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Midtrans timeout")), 10000),
      ),
    ]);

    return NextResponse.json({
      success: true,
      status: statusResponse.transaction_status,
      orderId: orderId,
      paymentType: statusResponse.payment_type,
      settlementTime: statusResponse.settlement_time,
      environment: midtransEnvironment,
      fraudStatus: statusResponse.fraud_status,
      grossAmount: statusResponse.gross_amount,
      currency: statusResponse.currency,
    });
  } catch (error) {
    console.error("❌ Payment status check error:", error.message);

    // ✅ Handle "Transaction doesn't exist" dengan response yang ramah
    if (
      error.message?.includes("Transaction doesn't exist") ||
      error.message?.includes("404")
    ) {
      return NextResponse.json(
        {
          success: false,
          status: "pending",
          orderId: orderId,
          message: "Transaction not yet created in Midtrans",
          friendlyMessage:
            "Transaksi belum dibuat. Silakan lanjutkan pembayaran.",
        },
        { status: 200 },
      );
    }

    // Handle timeout
    if (error.message?.includes("timeout")) {
      return NextResponse.json(
        {
          success: false,
          status: "pending",
          orderId: orderId,
          message: "Midtrans timeout",
          friendlyMessage:
            "Waktu habis saat menghubungi server pembayaran. Silakan coba lagi.",
        },
        { status: 200 },
      );
    }

    // Error lainnya
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        orderId: orderId,
        environment: process.env.NEXT_PUBLIC_MIDTRANS_ENVIRONMENT,
      },
      { status: 500 },
    );
  }
}
