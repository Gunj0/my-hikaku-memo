"use client";

import { PencilLineIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim().replace(/\s+/g, " ");

    if (!trimmedName) {
      toast.error("ユーザー名を入力してください。");
      return;
    }

    if (trimmedName.length > maxLength) {
      toast.error(`ユーザー名は${maxLength}文字以内で入力してください。`);
      return;
    }

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
      toast.success("ユーザー名を更新しました。");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "ユーザー名を更新できませんでした。",
      );
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
                  onChange={(event) => setName(event.target.value)}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground"></p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={isSaving}>
                  <PencilLineIcon className="h-4 w-4" />
                  {isSaving ? "保存中..." : "ユーザー名を変更"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
