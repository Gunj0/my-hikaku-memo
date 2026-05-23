import { D1Adapter } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { ensureDatabaseSetup } from "@/lib/server/database";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = getCloudflareContext();
  const authEnv = env as CloudflareEnv & {
    DB: D1Database;
    AUTH_SECRET?: string;
    AUTH_GOOGLE_ID?: string;
    AUTH_GOOGLE_SECRET?: string;
  };
  const database = authEnv.DB;
  const isProduction = process.env.NODE_ENV === "production";
  const secret =
    authEnv.AUTH_SECRET || (isProduction ? undefined : "development-auth-secret");
  const googleClientId = authEnv.AUTH_GOOGLE_ID?.trim();
  const googleClientSecret = authEnv.AUTH_GOOGLE_SECRET?.trim();

  await ensureDatabaseSetup(database);

  return {
    trustHost: true,
    secret,
    adapter: D1Adapter(database),
    session: {
      strategy: "database",
    },
    providers:
      googleClientId && googleClientSecret
        ? [
            Google({
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            }),
          ]
        : [],
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }

        return session;
      },
    },
  };
});
