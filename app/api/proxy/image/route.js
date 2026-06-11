// app/api/proxy/image/route.js
import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("path");

  if (!imagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // Hanya izinkan path dari storage VPS
  if (!imagePath.startsWith("/storage/")) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  try {
    const vpsUrl = `${VPS_API_URL}${imagePath}`;
    const response = await fetch(vpsUrl);

    if (!response.ok) {
      return NextResponse.json({ error: "Image not found" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
