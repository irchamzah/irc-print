import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// 🌐POST /app/api/transaction/cancel/route.js TERPAKAI
export async function POST(request) {
  try {
    const { orderId, phoneNumber } = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phoneNumber }),
      },
    );

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
