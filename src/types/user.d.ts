interface User {
  userId: string; // アカウント登録時に採番する一意のID
  userName: string; // ユーザが変更可能な表示名
}

export type { User };
