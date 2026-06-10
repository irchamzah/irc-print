import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function POST(request, { params }) {
  try {
    const { withdrawalId } = await params;
    const contentType = request.headers.get("content-type") || "";
    const token = request.headers.get("authorization");

    let body;
    let headers = {
      Authorization: token,
    };

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/partner-withdrawals/${withdrawalId}/process`,
      {
        method: "POST",
        headers,
        body,
      },
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
