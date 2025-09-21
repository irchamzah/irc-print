import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(request) {
  try {
    const { amount, orderId } = await request.json();

    // Initialize Snap client
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // Create transaction parameters
    let parameter = {
      transaction_details: {
        order_id: orderId || `order-${Date.now()}`,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      enabled_payments: ["qris"], // Hanya QRIS
    };

    // Create transaction
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      qr_code: transaction.qr_code, // QRIS code URL
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
