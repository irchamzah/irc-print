// /app/api/hub/admin/printers/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/admin/printers - Get all printers with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Forward all query params to VPS
    const vpsUrl = new URL(`${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printers`);

    // Copy all search params
    searchParams.forEach((value, key) => {
      vpsUrl.searchParams.set(key, value);
    });

    const response = await fetch(vpsUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization"),
        }),
      },
    });

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
    console.error("❌ Error fetching printers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/hub/admin/printers - Create new printer
export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization"),
        },
        body: JSON.stringify(body),
      },
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Error creating printer:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
