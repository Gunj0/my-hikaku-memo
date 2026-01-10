import { PATH } from "@/const/Path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // バックエンドAPIにGETリクエスト
    const res = await fetch(new URL(process.env.API_URL + PATH.BACKEND.MEMO), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${request.headers.get("Authorization")}`,
      },
    });
    // レスポンスをJSON変換
    const resJson = await res.json();
    // bodyにJSONをセットして返却
    return NextResponse.json(resJson);
  } catch (error) {
    console.error("Error fetching backend API:", error);
    return NextResponse.json(
      { message: "Error fetching backend API" },
      { status: 500 }
    );
  }
}
