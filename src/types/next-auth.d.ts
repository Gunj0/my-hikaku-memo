import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      /** URL ハンドル。`/{username}` への導線に用いる。 */
      username?: string;
    };
  }
}