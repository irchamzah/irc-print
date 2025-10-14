import { NextResponse } from "next/server";

// GUNAKAN HTTP, BUKAN HTTPS
const VPS_API_URL = process.env.VPS_API_URL || "http://103.150.90.67:3001";

export async function GET(request, { params }) {
  try {
    const { phone } = await params;
    console.log("🔍 [FRONTEND] Checking points for phone:", phone);

    // Validate phone number
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Nomor HP tidak valid",
        },
        { status: 400 }
      );
    }

    console.log(
      "🌐 [FRONTEND] Calling VPS API:",
      `${VPS_API_URL}/api/users/${phone}/points`
    );

    // Test 1: Coba GET user points dulu
    const getResponse = await fetch(
      `${VPS_API_URL}/api/users/${phone}/points`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );

    console.log("📡 [FRONTEND] VPS GET response status:", getResponse.status);

    if (getResponse.ok) {
      const result = await getResponse.json();
      console.log("📊 [FRONTEND] VPS GET success:", result);

      if (result.success) {
        if (result.user) {
          // User ditemukan
          return NextResponse.json({
            success: true,
            points: result.points || 0,
            user: {
              phone: result.user.phone,
              name: result.user.name || `User ${phone}`,
              points: result.points || 0,
            },
            isNewUser: false,
          });
        } else {
          // User tidak ditemukan, buat user baru
          console.log("📝 [FRONTEND] User not found, creating new user...");
          return await createNewUser(phone);
        }
      }
    }

    // Jika GET gagal, coba buat user baru langsung
    console.log("🔄 [FRONTEND] GET failed, trying to create new user...");
    return await createNewUser(phone);
  } catch (error) {
    console.error(
      "❌ [FRONTEND] Error in /api/users/[phone]/points:",
      error.message
    );

    return NextResponse.json(
      {
        success: false,
        error: "Service sedang tidak tersedia",
        details: "Silakan coba beberapa saat lagi",
      },
      { status: 503 }
    );
  }
}

// Helper function untuk create new user
async function createNewUser(phone) {
  try {
    console.log("👤 [FRONTEND] Creating new user for:", phone);

    const createResponse = await fetch(`${VPS_API_URL}/api/users/points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        points: 0,
        amount: 0,
        orderId: `init-${Date.now()}`,
        fileName: "user-initialization.pdf",
      }),
    });

    console.log(
      "📡 [FRONTEND] Create user response status:",
      createResponse.status
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("❌ [FRONTEND] Create user failed:", errorText);
      throw new Error(`Create user failed: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();
    console.log("📝 [FRONTEND] Create user result:", createResult);

    if (createResult.success) {
      return NextResponse.json({
        success: true,
        points: 0,
        user: {
          phone: createResult.user?.phone || phone,
          name: createResult.user?.name || `User ${phone}`,
          points: createResult.currentPoints || 0,
        },
        isNewUser: true,
        message: "User baru berhasil dibuat dengan 0 poin",
      });
    } else {
      throw new Error(createResult.error || "Gagal membuat user");
    }
  } catch (error) {
    console.error("❌ [FRONTEND] Create new user error:", error.message);
    throw error;
  }
}
