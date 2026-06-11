// app/api/public/printers/[printerId]/images/route.js
import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function GET(request, { params }) {
  try {
    const { printerId } = await params;

    const response = await fetch(
      `${VPS_API_URL}/api/public/printer-images/${printerId}`,
    );

    if (!response.ok) {
      return NextResponse.json({ success: true, images: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: true, images: [] });
  }
}
