// app/api/print/route.js (FRONTEND Next.js)
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle restored transaction - forward as JSON
      const jsonData = await request.json();

      const response = await fetch(`${NEXT_PUBLIC_VPS_API_URL}/api/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...jsonData, isRestored: true }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ VPS error response:", errorText);
        throw new Error(
          `VPS returned ${response.status}: ${response.statusText}`,
        );
      }

      return NextResponse.json(await response.json());
    } else if (contentType.includes("multipart/form-data")) {
      // Handle normal file upload
      const formData = await request.formData();
      const pdfFile = formData.get("pdf");

      if (!pdfFile) {
        return NextResponse.json(
          { success: false, error: "PDF file is required" },
          { status: 400 },
        );
      }

      // ✅ Rebuild FormData untuk dikirim ke VPS
      // Next.js FormData tidak bisa langsung di-forward,
      // harus rebuild dengan field yang sama
      const vpsFormData = new FormData();
      vpsFormData.append("pdf", pdfFile); // File object langsung

      // Forward semua field lain kecuali "pdf"
      for (const [key, value] of formData.entries()) {
        if (key !== "pdf") {
          vpsFormData.append(key, value);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${NEXT_PUBLIC_VPS_API_URL}/api/print`, {
        method: "POST",
        // ✅ JANGAN set Content-Type - biarkan fetch set multipart boundary otomatis
        body: vpsFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ VPS error response:", errorText);
        throw new Error(
          `VPS returned ${response.status}: ${response.statusText}`,
        );
      }

      return NextResponse.json(await response.json());
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported content type" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("❌ Print API error:", error);

    let errorMessage = error.message;
    if (error.name === "AbortError") {
      errorMessage = "VPS timeout - server tidak merespons";
    } else if (error.message.includes("fetch failed")) {
      errorMessage = "Tidak dapat terhubung ke server print";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          "Pastikan VPS server sedang running dan endpoint /api/print tersedia",
      },
      { status: 500 },
    );
  }
}
