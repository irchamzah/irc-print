// api/print/route.js (Frontend Next.js)
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const jsonData = await request.json();

      // ✅ PASTIKAN DATA YANG DIKIRIM LENGKAP
      const payload = {
        orderId: jsonData.orderId,
        printerId: jsonData.printerId,
        copies: jsonData.copies,
        colorPages: jsonData.colorPages,
        bwPages: jsonData.bwPages,
        totalCost: jsonData.totalCost,
        totalPages: jsonData.totalPages,
        pointsToAdd: jsonData.pointsToAdd,
        pointDivider: jsonData.pointDivider,
        phoneNumber: jsonData.phoneNumber,
        paperSize: jsonData.paperSize,
        quality: jsonData.quality,
        isRestored: true,
      };

      const response = await fetch(`${NEXT_PUBLIC_VPS_API_URL}/api/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      return NextResponse.json(result, { status: response.status });
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const pdfFile = formData.get("pdf");

      if (!pdfFile) {
        return NextResponse.json(
          { success: false, error: "PDF file is required" },
          { status: 400 },
        );
      }

      const vpsFormData = new FormData();
      vpsFormData.append("pdf", pdfFile);

      for (const [key, value] of formData.entries()) {
        if (key !== "pdf") {
          vpsFormData.append(key, value);
        }
      }

      const response = await fetch(`${NEXT_PUBLIC_VPS_API_URL}/api/print`, {
        method: "POST",
        body: vpsFormData,
      });

      const result = await response.json();
      return NextResponse.json(result, { status: response.status });
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported content type" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("❌ [PROXY] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details:
          "Pastikan VPS server sedang running dan endpoint /api/print tersedia",
      },
      { status: 500 },
    );
  }
}
