import { PATH } from "@/const/Path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // バックエンドAPIにPOSTリクエスト
    const res = await fetch(new URL(process.env.API_URL + PATH.BACKEND.MEMO), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${request.headers.get("Authorization")}`,
      },
      body: await request.text(),
    });
    // レスポンスをJSON変換
    const resJson = await res.json();
    // bodyにJSONをセットして返却
    return NextResponse.json(resJson);
  } catch (error) {
    console.error("Error posting to backend API:", error);
    return NextResponse.json(
      { message: "Error posting to backend API" },
      { status: 500 }
    );
  }
}
