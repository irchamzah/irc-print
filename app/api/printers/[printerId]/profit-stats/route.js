import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/printers/:printerId/profit-stats - Get profit statistics
export async function GET(request, { params }) {
  try {
    const { printerId } = await params;

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/printers/${printerId}/profit-stats`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization") && {
            Authorization: request.headers.get("authorization"),
          }),
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ VPS API error:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: `VPS API error: ${response.status}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error fetching profit stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
