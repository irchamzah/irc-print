// app/api/transactions/update-status/route.js (FRONTEND Next.js)
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/update-status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating transaction status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
