import { User } from "@/types/user";

export async function getUserByUserId(userId: string): Promise<User | null> {
  return dummyUsers.find((user) => user.userId === userId) || null;
}

const dummyUsers: User[] = [
  { userId: "user1", userName: "ユーザー1" },
  { userId: "user2", userName: "ユーザー2" },
  { userId: "user3", userName: "ユーザー3" },
];
