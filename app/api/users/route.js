import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, name } = body;

    console.log("📝 Creating new user in VPS:", phone);

    // Validate input
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Nomor HP diperlukan" },
        { status: 400 }
      );
    }

    if (phone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Nomor HP harus minimal 10 digit" },
        { status: 400 }
      );
    }

    // Create user melalui VPS API dengan initial points 0
    const response = await fetch(`${VPS_API_URL}/api/users/points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        points: 0,
        amount: 0,
        orderId: `create-${Date.now()}`,
        fileName: "user-creation.pdf",
      }),
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          user: {
            phone: result.user?.phone || phone,
            name: result.user?.name || name || `User ${phone}`,
            points: result.currentPoints || 0,
          },
          message: "User berhasil dibuat dengan 0 poin",
        },
        { status: 201 }
      );
    } else {
      // Jika user sudah ada, anggap berhasil
      if (result.error && result.error.includes("already exists")) {
        return NextResponse.json(
          {
            success: false,
            error: "User sudah terdaftar",
            user: result.user,
          },
          { status: 409 }
        );
      }
      throw new Error(result.error || "Gagal membuat user di VPS");
    }
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (phone) {
      // Get specific user by phone from VPS
      const response = await fetch(`${VPS_API_URL}/api/users/${phone}/points`);

      if (!response.ok) {
        throw new Error(`VPS API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.user) {
        return NextResponse.json({
          success: true,
          user: {
            phone: result.user.phone,
            name: result.user.name || `User ${phone}`,
            points: result.points || 0,
          },
        });
      } else {
        return NextResponse.json(
          { success: false, error: "User tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    // Untuk get all users, kita tidak implement karena tidak ada endpoint di VPS
    return NextResponse.json(
      {
        success: false,
        error:
          "Endpoint tidak tersedia. Gunakan /api/users/[phone]/points untuk user spesifik",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("❌ Error getting users:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
