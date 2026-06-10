// app/api/hub/printers/[printerId]/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// 🌐GET /app/api/hub/printers/[printerId]/route.js TERPAKAI
export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const { printerId } = await params;

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/printers/${printerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in /api/hub/printers/[printerId]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
