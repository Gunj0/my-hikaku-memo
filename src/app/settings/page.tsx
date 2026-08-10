import Link from "next/link";

import { getSession } from "@/lib/server/request-scope";
import { ProfileSettingsCard } from "@/components/profile-settings-card";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildMetadata, getRequestSiteUrl } from "@/lib/seo";
import {
  USER_PROFILE_NAME_MAX_LENGTH,
  ensureUserProfile,
} from "@/lib/server/user-profiles";
import { ArrowRightIcon, LogOutIcon } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title: "アカウント設定 | オレの比較メモ",
    description: "表示ユーザー名とユーザーIDを変更する設定画面です。",
    path: "/settings",
    noIndex: true,
    siteUrl,
  });
}

export default async function SettingsPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <Card className="border-border/80 bg-card/78">
          <CardHeader>
            <CardTitle className="text-2xl">アカウント設定</CardTitle>
            <CardDescription>
              設定を変更するには Google ログインが必要です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/">
                ホームへ戻る
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const profile = await ensureUserProfile(userId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <section className="flex flex-row items-end justify-between gap-3">
        <h1 className="text-xl font-semibold">アカウント設定</h1>
        <SignOutButton variant="secondary" size="default">
          <LogOutIcon className="h-4 w-4" />
          ログアウト
        </SignOutButton>
      </section>

      {profile ? (
        <ProfileSettingsCard
          initialName={profile.name}
          initialUsername={profile.username}
          image={profile.image}
          maxLength={USER_PROFILE_NAME_MAX_LENGTH}
        />
      ) : (
        <Card className="border-border/80 bg-card/78">
          <CardHeader>
            <CardTitle className="text-lg">
              プロフィールを読み込めませんでした
            </CardTitle>
            <CardDescription>
              時間をおいて再度お試しください。
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
