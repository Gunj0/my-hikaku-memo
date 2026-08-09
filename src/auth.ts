import { D1Adapter } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { ensureUserProfileRecord } from "@/lib/server/user-profiles";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = getCloudflareContext();
  const authEnv = env as CloudflareEnv & {
    DB: D1Database;
    AUTH_SECRET: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
  };
  const database = authEnv.DB;

  const adapter = D1Adapter(database);
  const createUser = adapter.createUser;
  const updateUser = adapter.updateUser;

  if (!createUser || !updateUser) {
    throw new Error("Auth adapter is missing required user methods.");
  }

  type AuthAdapter = typeof adapter;
  type CreateUserInput = Parameters<NonNullable<AuthAdapter["createUser"]>>[0];
  type UpdateUserInput = Parameters<NonNullable<AuthAdapter["updateUser"]>>[0];

  return {
    trustHost: true,
    secret: authEnv.AUTH_SECRET,
    adapter: {
      ...adapter,
      async createUser(user: CreateUserInput) {
        const created = await createUser(user);
        const profile = await ensureUserProfileRecord(database, created.id);

        if (!profile) {
          return {
            ...created,
            image: null,
          };
        }

        return updateUser({
          ...created,
          name: profile.name,
          image: null,
        });
      },
      async updateUser(user: UpdateUserInput) {
        const updated = await updateUser({
          ...user,
          image: null,
        });

        if (!updated) {
          return updated;
        }

        const profile = await ensureUserProfileRecord(database, updated.id);

        if (!profile) {
          return {
            ...updated,
            image: null,
          };
        }

        return updateUser({
          ...updated,
          name: profile.name,
          image: null,
        });
      },
    },
    session: {
      strategy: "database",
    },
    providers: [
      Google({
        clientId: authEnv.AUTH_GOOGLE_ID,
        clientSecret: authEnv.AUTH_GOOGLE_SECRET,
      }),
    ],
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          const profile = await ensureUserProfileRecord(database, user.id);

          session.user.id = user.id;
          session.user.name = profile?.name ?? session.user.name;
          session.user.username = profile?.username ?? session.user.username;
          session.user.image = profile?.image ?? session.user.image;
        }

        return session;
      },
    },
  };
});