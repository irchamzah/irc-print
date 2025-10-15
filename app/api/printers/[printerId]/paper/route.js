import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function POST(request, { params }) {
  try {
    const { printerId } = params;
    const { pagesUsed } = await request.json();

    if (!pagesUsed || pagesUsed <= 0) {
      return NextResponse.json(
        { success: false, error: "Pages used must be greater than 0" },
        { status: 400 }
      );
    }

    // Kirim request ke VPS untuk update paper count
    const response = await fetch(
      `${VPS_API_URL}/api/printers/${printerId}/paper`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pagesUsed }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating paper count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update paper count" },
      { status: 500 }
    );
  }
}
