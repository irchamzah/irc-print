import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/admin/paper-refills - Get all refills with filters & pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Build VPS URL
    const vpsUrl = new URL(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/paper-refills`,
    );

    // Forward ALL query params to VPS
    // Ini akan meneruskan semua parameter yang ada di URL
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
    console.error("❌ Error fetching paper refills:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// POST /api/hub/admin/paper-refills - Create new refill (if needed)
export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/paper-refills`,
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
    console.error("❌ Error creating refill:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
