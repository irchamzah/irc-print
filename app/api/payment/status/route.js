import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // VALIDASI ENVIRONMENT VARIABLES
    const midtransEnvironment = process.env.MIDTRANS_ENVIRONMENT || "sandbox";
    const isProduction = midtransEnvironment === "production";

    const serverKey = isProduction
      ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
      : process.env.MIDTRANS_SERVER_KEY_SANDBOX;

    // VALIDASI SERVER KEY
    if (!serverKey) {
      console.error("❌ Midtrans server key is missing");
      return NextResponse.json(
        {
          success: false,
          error: "Midtrans configuration error: Server key is missing",
          environment: midtransEnvironment,
        },
        { status: 500 }
      );
    }

    console.log(
      `🔧 Midtrans Status Check - Environment: ${midtransEnvironment}`
    );
    console.log(`🔧 Order ID: ${orderId}`);
    console.log(`🔧 Server Key Available: ${!!serverKey}`);

    // Initialize Snap client
    let snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
    });

    // Check transaction status dengan timeout
    const statusResponse = await Promise.race([
      snap.transaction.status(orderId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Midtrans timeout")), 10000)
      ),
    ]);

    console.log("📊 Payment status check success:", {
      orderId: orderId,
      status: statusResponse.transaction_status,
      environment: midtransEnvironment,
    });

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
    console.error("❌ Payment status check error:", error);
    console.error("Environment:", process.env.MIDTRANS_ENVIRONMENT);

    // Berikan error message yang lebih spesifik
    let errorMessage = error.message;
    if (error.message.includes("timeout")) {
      errorMessage = "Midtrans server timeout. Please try again.";
    } else if (error.message.includes("not found")) {
      errorMessage = "Transaction not found in Midtrans.";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        environment: process.env.MIDTRANS_ENVIRONMENT || "unknown",
      },
      { status: 500 }
    );
  }
}
