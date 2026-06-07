"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteMemoButtonProps {
  memoId: string;
  memoTitle: string;
}

export function DeleteMemoButton({ memoId, memoTitle }: DeleteMemoButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    if (!confirm(`「${memoTitle}」を削除します。よろしいですか？`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/memos/${memoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(
          result?.message || "保存済みメモを削除できませんでした。",
        );
      }

      router.refresh();
      toast.success("保存済みメモを削除しました。");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "保存済みメモを削除できませんでした。",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={() => {
        void handleDelete();
      }}
      disabled={isDeleting}
      aria-label={`${memoTitle}を削除`}
    >
      {isDeleting ? <Spinner /> : <Trash2Icon className="h-4 w-4" />}
      削除
    </Button>
  );
}
