// app/api/users/[phone]/points/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/users/[phone]/points/route.js TERPAKAI
export async function GET(request, { params }) {
  try {
    const { phone } = await params;
    const { searchParams } = new URL(request.url);
    const printerId = searchParams.get("printerId"); // Ambil printerId dari query

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const getResponse = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/users/${phone}/points`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (getResponse.ok) {
      const result = await getResponse.json();

      if (result.success) {
        if (result.user) {
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
          // User tidak ditemukan, buat user baru dengan printerId
          return await createNewUser(phone, printerId);
        }
      }
    }

    // Jika GET gagal, coba buat user baru langsung
    return await createNewUser(phone, printerId);
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("⏰ Request timeout");
      return NextResponse.json(
        { success: false, error: "Request timeout" },
        { status: 408 },
      );
    }
    console.error(
      "❌ [FRONTEND] Error in /api/users/[phone]/points:",
      error.message,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Service sedang tidak tersedia",
        details: "Silakan coba beberapa saat lagi",
      },
      { status: 503 },
    );
  }
}

// export async function POST(request) {
//   console.log("🌐POST /app/api/users/[phone]/points/route.js");
//   try {
//     const body = await request.json();

//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 8000);

//     const response = await fetch(
//       `${NEXT_PUBLIC_VPS_API_URL}/api/users/points`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//         signal: controller.signal,
//       },
//     );

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ [FRONTEND] VPS POST failed:", errorText);
//       throw new Error(`VPS API error: ${response.status}`);
//     }

//     const result = await response.json();

//     return NextResponse.json(result);
//   } catch (error) {
//     if (error.name === "AbortError") {
//       console.error("⏰ Request timeout");
//       return NextResponse.json(
//         { success: false, error: "Request timeout" },
//         { status: 408 },
//       );
//     }

//     console.error(
//       "❌ [FRONTEND] Error in POST /api/users/points:",
//       error.message,
//     );
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Service sedang tidak tersedia",
//         details: error.message,
//       },
//       { status: 503 },
//     );
//   }
// }

// 🌐createNewUser /app/api/users/[phone]/points/route.js TERPAKAI
async function createNewUser(phone, printerId) {
  try {
    // Dapatkan point divider dari printer
    let pointDivider;
    if (printerId) {
      try {
        const printerResponse = await fetch(
          `${NEXT_PUBLIC_VPS_API_URL}/api/hub/printers/${printerId}/point-divider`,
        );
        if (printerResponse.ok) {
          const printerData = await printerResponse.json();
          pointDivider = printerData.pointDivider;
        }
      } catch (error) {
        console.error("Error fetching printer point divider:", error);
      }
    }

    const createResponse = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/users/points`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone,
          points: 0,
          amount: 0,
          orderId: `init-${Date.now()}`,
          pointDivider: pointDivider,
          fileName: "user-initialization.pdf",
        }),
      },
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("❌ [FRONTEND] Create user failed:", errorText);
      throw new Error(`Create user failed: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();

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
