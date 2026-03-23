// DI FRONTEND: Proxy API untuk printers
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// 🌐 GET /app/api/printers/route.js TERPAKAI
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const printerId = searchParams.get("id");

    let apiUrl = `${NEXT_PUBLIC_VPS_API_URL}/api/printers`;

    // Jika ada printerId, get detail printer spesifik
    if (printerId) {
      apiUrl += `/${printerId}`;
    }

    // Jika ada location params, get nearby printers
    // const lat = searchParams.get("lat");
    // const lng = searchParams.get("lng");
    // if (lat && lng) {
    //   apiUrl = `${NEXT_PUBLIC_VPS_API_URL}/api/printers/nearby/location?lat=${lat}&lng=${lng}`;
    // }

    const response = await fetch(apiUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Printers API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch printers" },
      { status: 500 },
    );
  }
}
