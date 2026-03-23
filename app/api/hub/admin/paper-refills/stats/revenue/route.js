import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/admin/paper-refills/stats/revenue - Get revenue statistics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const vpsUrl = new URL(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/paper-refills/stats/revenue`,
    );

    // Forward all query params
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
    console.error("❌ Error fetching revenue stats:", error);
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
