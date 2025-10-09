// DI FRONTEND: Dynamic route untuk printer detail
import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL || "http://103.150.90.67:3001";

export async function GET(request, { params }) {
  try {
    const { printerId } = params;

    const response = await fetch(`${VPS_API_URL}/api/printers/${printerId}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Printer detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch printer details" },
      { status: 500 }
    );
  }
}
