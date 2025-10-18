import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(request) {
  try {
    const { amount, orderId } = await request.json();

    // --- LOGGING #1: Payload dari Klien ---
    console.log("Payload received from client:", { amount, orderId });

    // Initialize Snap client
    let snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_ENVIRONMENT === "production",
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

    // --- LOGGING #2: Payload ke Midtrans ---
    console.log("Payload sent to Midtrans:", JSON.stringify(parameter));

    // Create transaction
    const transaction = await snap.createTransaction(parameter);

    // --- LOGGING #3: Respon dari Midtrans ---
    console.log("Response from Midtrans:", JSON.stringify(transaction));

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      qr_code: transaction.qr_code, // QRIS code URL
    });
  } catch (error) {
    // --- LOGGING #4: Error Detail ---
    console.error("Payment error detail:", error);
    // --------------------------------
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
