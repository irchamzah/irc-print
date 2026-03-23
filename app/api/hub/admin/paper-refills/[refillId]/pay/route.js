import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// POST /api/hub/admin/paper-refills/:refillId/pay - Mark refill as paid
export async function POST(request, { params }) {
  try {
    const { refillId } = await params;

    // Forward request to VPS
    const vpsUrl = `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/paper-refills/${refillId}/pay`;

    // Get the form data (including file upload)
    const formData = await request.formData();

    const response = await fetch(vpsUrl, {
      method: "POST",
      headers: {
        // Don't set Content-Type, let fetch handle it with FormData
        Authorization: request.headers.get("authorization"),
      },
      body: formData,
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Error marking refill as paid:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
