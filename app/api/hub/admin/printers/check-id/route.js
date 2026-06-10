import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const printerId = searchParams.get("printerId");

    if (!printerId) {
      return NextResponse.json(
        { success: false, error: "Printer ID is required" },
        { status: 400 },
      );
    }

    const vpsUrl = new URL(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printers/check-id`,
    );
    vpsUrl.searchParams.set("printerId", printerId);

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
      console.error("❌ VPS proxy error:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: `VPS API error: ${response.status}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Error proxying printer ID check:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
