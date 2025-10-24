import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(request) {
  try {
    const { amount, orderId, phoneNumber } = await request.json(); // ← TAMBAH phoneNumber

    // --- LOGGING #1: Payload dari Klien ---
    console.log("Payload received from client:", {
      amount,
      orderId,
      phoneNumber,
    });

    // Determine environment and keys
    const isProduction = process.env.MIDTRANS_ENVIRONMENT === "production";
    const serverKey = isProduction
      ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
      : process.env.MIDTRANS_SERVER_KEY_SANDBOX;

    const clientKey = isProduction
      ? process.env.MIDTRANS_CLIENT_KEY_PRODUCTION
      : process.env.MIDTRANS_CLIENT_KEY_SANDBOX;

    console.log(`🔧 Midtrans Environment: ${process.env.MIDTRANS_ENVIRONMENT}`);
    console.log(`🔧 Is Production: ${isProduction}`);

    // Initialize Snap client
    let snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: clientKey,
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
    };

    // ✅ TAMBAHKAN CUSTOMER DETAILS JIKA ADA PHONE NUMBER
    if (phoneNumber) {
      parameter.customer_details = {
        first_name: `Customer ${phoneNumber}`,
        phone: phoneNumber,
        billing_address: {
          phone: phoneNumber,
        },
        shipping_address: {
          phone: phoneNumber,
        },
      };

      console.log(`📱 Customer phone added to Midtrans: ${phoneNumber}`);
    }

    // --- LOGGING #2: Payload ke Midtrans ---
    console.log(
      "Payload sent to Midtrans:",
      JSON.stringify(parameter, null, 2)
    );

    // Create transaction
    const transaction = await snap.createTransaction(parameter);

    // --- LOGGING #3: Respon dari Midtrans ---
    console.log("Response from Midtrans:", JSON.stringify(transaction));

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      qr_code: transaction.qr_code, // QRIS code URL
      environment: process.env.MIDTRANS_ENVIRONMENT,
    });
  } catch (error) {
    // --- LOGGING #4: Error Detail ---
    console.error("Payment error detail:", error);
    console.error("Environment:", process.env.MIDTRANS_ENVIRONMENT);
    // --------------------------------
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
