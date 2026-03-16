import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

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
    const response = await fetch(`${VPS_API_URL}/api/print/jobs`, {
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
      // Filter jobs untuk printer ini
      let printerJobs = data.jobs.filter((job) => job.printerId === printerId);

      // Filter berdasarkan tanggal jika ada
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        printerJobs = printerJobs.filter((job) => {
          const jobDate = new Date(job.createdAt);
          return jobDate >= start && jobDate <= end;
        });
      }

      // Urutkan dari terbaru
      printerJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Hitung total untuk pagination
      const total = printerJobs.length;

      // Ambil data sesuai page
      const paginatedJobs = printerJobs.slice(skip, skip + limit);

      return NextResponse.json({
        success: true,
        data: paginatedJobs,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + limit < total,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in /api/hub/printers/[printerId]/jobs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
