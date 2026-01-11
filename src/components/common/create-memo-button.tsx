import { Button } from "@/components/ui/button";
import { PATH } from "@/const/Path";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateMemoButton() {
  return (
    <Button className="font-bold" asChild>
      <Link href={PATH.MEMO.NEW}>
        <Plus className="h-4 w-4" />
        <p>比較メモを作る</p>
      </Link>
    </Button>
  );
}
