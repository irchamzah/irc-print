import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /app/api/hub/printers/[printerId]/jobs
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

    // ✅ UPDATE: Gunakan endpoint baru di VPS
    let url = `${NEXT_PUBLIC_VPS_API_URL}/api/hub/printers/${printerId}/jobs?skip=${skip}&limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`VPS API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: data.pagination || {
          page,
          limit,
          total: data.data.length,
          hasMore:
            skip + data.data.length <
            (data.pagination?.total || data.data.length),
        },
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in /api/hub/printers/[printerId]/jobs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
