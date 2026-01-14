import { User } from "@/types/user";
import { dummyUsers } from "./dummy-data";

export async function getUserByUserId(userId: string): Promise<User | null> {
  return dummyUsers.find((user) => user.userId === userId) || null;
}
