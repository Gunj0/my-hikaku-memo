"use client";

import { PencilLineIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InlineNotice } from "@/components/ui/inline-notice";
import { Input } from "@/components/ui/input";
import { getUserInitials } from "@/lib/user-display";
import { USERNAME_MAX_LENGTH, validateUsername } from "@/lib/username";

type ProfileSettingsCardProps = {
  initialName: string;
  initialUsername: string;
  image: string;
  maxLength: number;
};

type ProfileResponse = {
  name?: string;
  username?: string;
  image?: string;
  message?: string;
};

const PROFILE_INITIALS_FALLBACK = "HM";

export function ProfileSettingsCard({
  initialName,
  initialUsername,
  image,
  maxLength,
}: ProfileSettingsCardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim().replace(/\s+/g, " ");
    setStatusMessage(null);

    if (!trimmedName) {
      setNameError("ユーザー名を入力してください。");
      return;
    }

    if (trimmedName.length > maxLength) {
      setNameError(`ユーザー名は${maxLength}文字以内で入力してください。`);
      return;
    }

    const usernameValidation = validateUsername(username);

    if (!usernameValidation.ok) {
      setNameError(null);
      setUsernameError(usernameValidation.message);
      return;
    }

    setNameError(null);
    setUsernameError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          username: usernameValidation.username,
        }),
      });

      const result = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;

      if (!response.ok || !result?.name || !result.username || !result.image) {
        throw new Error(result?.message || "プロフィールを更新できませんでした。");
      }

      setName(result.name);
      setUsername(result.username);
      await update({
        name: result.name,
        username: result.username,
        image: result.image,
      });
      router.refresh();
      setStatusMessage({
        tone: "success",
        message: "プロフィールを更新しました。",
      });
    } catch (error) {
      setStatusMessage({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "プロフィールを更新できませんでした。",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-border/80 bg-card/72">
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border border-border/70">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback>
                {getUserInitials(name, PROFILE_INITIALS_FALLBACK)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <label
                htmlFor="profile-name"
                className="text-[11px] tracking-[0.22em] text-foreground"
              >
                公開ユーザー名 ({maxLength}文字以内)
              </label>
              <Input
                id="profile-name"
                value={name}
                maxLength={maxLength}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(null);
                }}
                disabled={isSaving}
                className="mt-2 border border-foreground/20"
              />
              {nameError ? (
                <InlineNotice
                  tone="error"
                  message={nameError}
                  onDismiss={() => setNameError(null)}
                  className="mt-2 px-2 py-1 text-xs leading-5"
                />
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-username"
              className="text-[11px] tracking-[0.22em] text-foreground"
            >
              ユーザーID (半角英数字と - _ 、{USERNAME_MAX_LENGTH}文字以内)
            </label>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-sm text-muted-foreground">/</span>
              <Input
                id="profile-username"
                value={username}
                maxLength={USERNAME_MAX_LENGTH}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setUsernameError(null);
                }}
                disabled={isSaving}
                className="border border-foreground/20"
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              メモ一覧ページの URL に使われます。変更すると以前の URL は使えなくなります。
            </p>
            {usernameError ? (
              <InlineNotice
                tone="error"
                message={usernameError}
                onDismiss={() => setUsernameError(null)}
                className="mt-2 px-2 py-1 text-xs leading-5"
              />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isSaving} variant="default">
              <PencilLineIcon className="h-4 w-4" />
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>

          {statusMessage ? (
            <InlineNotice
              tone={statusMessage.tone}
              message={statusMessage.message}
              onDismiss={() => setStatusMessage(null)}
              className="text-xs leading-5"
            />
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
