import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function POST(request) {
  try {
    const formData = await request.formData();

    console.log("📤 Forwarding to VPS:", VPS_API_URL);

    // Forward ke VPS dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout

    const response = await fetch(`${VPS_API_URL}/api/print`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `VPS returned ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("✅ VPS response:", result);

    return NextResponse.json(result);
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
        details: "Pastikan VPS server sedang running di port 3001",
      },
      { status: 500 }
    );
  }
}
