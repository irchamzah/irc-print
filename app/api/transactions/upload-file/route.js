import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// POST /api/transactions/upload-file — forward multipart ke VPS
export async function POST(request) {
  try {
    const formData = await request.formData();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/transactions/upload-file`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Error uploading file to VPS:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
