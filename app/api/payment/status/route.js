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

    // Determine environment and keys
    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = isProduction
      ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
      : process.env.MIDTRANS_SERVER_KEY_SANDBOX;

    console.log(
      `🔧 Midtrans Status Check - Environment: ${process.env.MIDTRANS_ENVIRONMENT}`
    );
    console.log(`🔧 Order ID: ${orderId}`);

    // Initialize Snap client
    let snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
    });

    // Check transaction status
    const statusResponse = await snap.transaction.status(orderId);

    console.log("📊 Payment status check:", {
      orderId: orderId,
      status: statusResponse.transaction_status,
      environment: process.env.MIDTRANS_ENVIRONMENT,
    });

    return NextResponse.json({
      success: true,
      status: statusResponse.transaction_status,
      orderId: orderId,
      paymentType: statusResponse.payment_type,
      settlementTime: statusResponse.settlement_time,
      environment: process.env.MIDTRANS_ENVIRONMENT,
      // Include additional useful fields
      fraudStatus: statusResponse.fraud_status,
      grossAmount: statusResponse.gross_amount,
      currency: statusResponse.currency,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    console.error("Environment:", process.env.MIDTRANS_ENVIRONMENT);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        environment: process.env.MIDTRANS_ENVIRONMENT,
      },
      { status: 500 }
    );
  }
}
