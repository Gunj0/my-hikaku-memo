import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // バックエンドAPIにGETリクエストを送信
  try {
    const res = await fetch(`${process.env.API_URL}/memo`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${request.headers.get("Authorization")}`,
      },
    });
    const resJson = await res.json();
    return NextResponse.json(resJson);
  } catch (error) {
    console.error("Error fetching backend API:", error);
    return NextResponse.json(
      { message: "Error fetching backend API" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // バックエンドAPIにPOSTリクエストを送信
    const res = await fetch(`${process.env.API_URL}/memo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${request.headers.get("Authorization")}`,
      },
      body: await request.text(),
    });
    const resJson = await res.json();
    return NextResponse.json(resJson);
  } catch (error) {
    console.error("Error posting to backend API:", error);
    return NextResponse.json(
      { message: "Error posting to backend API" },
      { status: 500 }
    );
  }
}
