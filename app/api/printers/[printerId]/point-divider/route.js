import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function GET(request, { params }) {
  try {
    const { printerId } = await params;

    const response = await fetch(
      `${VPS_API_URL}/api/printers/${printerId}/point-divider`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`VPS API error: ${response.status}`);
    }

    const data = await response.json();

    console.log(
      "app/api/printers/[printerId]/point-divider/route.js - GET point divider:",
      data.pointDivider,
    );

    return NextResponse.json({
      success: true,
      pointDivider: data.pointDivider,
    });
  } catch (error) {
    console.error("❌ Error getting point divider:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get point divider",
        pointDivider: null,
      },
      { status: 500 },
    );
  }
}
