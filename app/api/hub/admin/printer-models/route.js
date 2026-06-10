import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/admin/printer-models
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vpsUrl = new URL(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printer-models`,
    );

    searchParams.forEach((value, key) => {
      vpsUrl.searchParams.set(key, value);
    });

    const response = await fetch(vpsUrl.toString(), {
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
    console.error("❌ Error fetching printer models:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/hub/admin/printer-models
export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printer-models`,
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
    console.error("❌ Error creating printer model:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
