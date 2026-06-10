// app/api/transactions/complete/route.js tidak perlu diupdate
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// 🌐POST /app/api/transactions/complete/route.js TERPAKAI
export async function POST(request) {
  try {
    const { orderId, phoneNumber } = await request.json();

    if (!orderId || !phoneNumber) {
      return NextResponse.json(
        { error: "Order ID and phone number are required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phoneNumber }),
      },
    );

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
