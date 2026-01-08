"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function Home() {
  const [responseMessage, setResponseMessage] = useState("");

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const callBackend = async () => {
    // 1. Better-authのエンドポイントから直接JWTを取得
    const { data, error } = await authClient.token();

    if (error || !data) {
      setResponseMessage(
        "トークンの取得に失敗しました。ログインしてください。"
      );
      return;
    }

    // 2. ASP.NET バックエンドへ送信
    try {
      const res = await fetch("https://localhost:7078/memo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setResponseMessage(`成功: ${JSON.stringify(json)}`);
      } else {
        setResponseMessage(`エラー: ステータス ${res.status}`);
      }
    } catch (err) {
      setResponseMessage(`バックエンドへの接続に失敗しました。${data.token}`);
    }
  };

  return (
    <div>
      <h2>Google Auth & ASP.NET Bridge</h2>
      <button onClick={handleGoogleLogin}>Googleでログイン</button>
      <button onClick={() => authClient.signOut()}>ログアウト</button>

      <hr style={{ margin: "20px 0" }} />

      <button onClick={callBackend}>ASP.NETへデータをリクエスト</button>
      <p>結果: {responseMessage}</p>
    </div>
  );
}
