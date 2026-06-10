// app/api/hub/printers/[printerId]/refills/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// 🌐GET /app/api/hub/printers/[printerId]/refills/route.js TERPAKAI
export async function GET(request, { params }) {
  try {
    const { printerId } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    // Fetch dari VPS API
    let url = `${NEXT_PUBLIC_VPS_API_URL}/api/hub/printers/${printerId}/refills?skip=${skip}&limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // ✅ TAMBAHKAN FIELD TOTAL
    if (data.success) {
      // Hitung total dari response atau dari header
      // Asumsikan VPS mengembalikan total di response
      const total = data.pagination?.total || data.data.length;

      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + data.data.length < total,
        },
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in /api/hub/printers/[printerId]/refills:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 🌐POST /app/api/hub/printers/[printerId]/refills/route.js TERPAKAI
export async function POST(request, { params }) {
  try {
    const { printerId } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/printers/${printerId}/refills`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(
      "❌ Error in POST /api/hub/printers/[printerId]/refills:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
