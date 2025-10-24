import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function POST(request) {
  try {
    const { orderId, phoneNumber } = await request.json();

    const response = await fetch(`${VPS_API_URL}/api/transactions/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, phoneNumber }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
