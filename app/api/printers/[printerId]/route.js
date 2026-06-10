// /app/api/printers/[printerId]/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// 🌐GET /app/api/printers/[printerId]/route.js TERPAKAI
export async function GET(request, { params }) {
  try {
    // AWAIT params sebelum digunakan
    const { printerId } = await params;

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/printers/${printerId}`,
    );

    if (!response.ok) {
      throw new Error(`VPS API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Printer detail API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch printer details",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
