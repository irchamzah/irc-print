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

    // Initialize Snap client
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Check transaction status
    const statusResponse = await snap.transaction.status(orderId);

    console.log("📊 Payment status check:", {
      orderId: orderId,
      status: statusResponse.transaction_status,
    });

    return NextResponse.json({
      success: true,
      status: statusResponse.transaction_status,
      orderId: orderId,
      paymentType: statusResponse.payment_type,
      settlementTime: statusResponse.settlement_time,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
