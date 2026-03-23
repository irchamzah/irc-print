// import { NextResponse } from "next/server";

// const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// export async function GET(request, { params }) {
//   console.log("🌐GET /app/api/printers/[printerId]/point-divider/route.js");
//   try {
//     const { printerId } = await params;

//     const response = await fetch(
//       `${NEXT_PUBLIC_VPS_API_URL}/api/printers/${printerId}/point-divider`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`VPS API error: ${response.status}`);
//     }

//     const data = await response.json();

//     return NextResponse.json({
//       success: true,
//       pointDivider: data.pointDivider,
//     });
//   } catch (error) {
//     console.error("❌ Error getting point divider:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to get point divider",
//         pointDivider: null,
//       },
//       { status: 500 },
//     );
//   }
// }
