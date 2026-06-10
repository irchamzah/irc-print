import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/public/platform-config — tidak butuh auth
export async function GET() {
  try {
    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/public/platform-config`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `VPS API error: ${response.status}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error fetching public platform config:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
