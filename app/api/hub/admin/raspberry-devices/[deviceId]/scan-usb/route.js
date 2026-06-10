// app/api/hub/admin/raspberry-devices/[deviceId]/scan-usb/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// POST /api/hub/admin/raspberry-devices/:deviceId/scan-usb
export async function POST(request, { params }) {
  try {
    // ✅ AWAIT params (wajib di Next.js 15)
    const { deviceId } = await params;

    // Forward request ke VPS
    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/raspberry-devices/${deviceId}/scan-usb`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization"),
        },
      },
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Error in scan-usb proxy:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
