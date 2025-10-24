import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${VPS_API_URL}/api/transactions/pending?phoneNumber=${phoneNumber}`
    );
    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(`${VPS_API_URL}/api/transactions/pending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating pending transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
