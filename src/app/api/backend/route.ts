import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // バックエンドAPIにリクエストを送信
  try {
    const data = await fetch(`${process.env.API_URL}/memo`, {
      headers: {
        Authorization: `${request.headers.get("Authorization")}`,
      },
    });
    const dataJson = await data.json();
    return NextResponse.json(dataJson);
  } catch (error) {
    console.error("Error fetching backend API:", error);
    return NextResponse.json(
      { message: "Error fetching backend API" },
      { status: 500 }
    );
  }
}
