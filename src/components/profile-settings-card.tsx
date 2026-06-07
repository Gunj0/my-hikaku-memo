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

type ProfileSettingsCardProps = {
  initialName: string;
  image: string;
  maxLength: number;
};

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "HM";
}

export function ProfileSettingsCard({
  initialName,
  image,
  maxLength,
}: ProfileSettingsCardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
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

    setNameError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const result = (await response.json().catch(() => null)) as {
        name?: string;
        image?: string;
        message?: string;
      } | null;

      if (!response.ok || !result?.name || !result.image) {
        throw new Error(
          result?.message || "ユーザー名を更新できませんでした。",
        );
      }

      setName(result.name);
      await update({ name: result.name, image: result.image });
      router.refresh();
      setStatusMessage({
        tone: "success",
        message: "ユーザー名を更新しました。",
      });
    } catch (error) {
      setStatusMessage({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "ユーザー名を更新できませんでした。",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/72">
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border border-border/70">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[11px] tracking-[0.22em] text-primary">
              公開ユーザー名 (12文字以内)
            </p>
            <form className="flex my-2" onSubmit={handleSubmit}>
              <div>
                <Input
                  id="profile-name"
                  value={name}
                  maxLength={maxLength}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(null);
                  }}
                  disabled={isSaving}
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
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={isSaving}>
                  <PencilLineIcon className="h-4 w-4" />
                  {isSaving ? "保存中..." : "ユーザー名を変更"}
                </Button>
              </div>
            </form>
            {statusMessage ? (
              <InlineNotice
                tone={statusMessage.tone}
                message={statusMessage.message}
                onDismiss={() => setStatusMessage(null)}
                className="mt-2 text-xs leading-5"
              />
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
