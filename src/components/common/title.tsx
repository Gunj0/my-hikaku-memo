import { NotebookPen } from "lucide-react";
import Link from "next/link";

export default function Title() {
  return (
    <Link href={"/"} className="flex items-center">
      <NotebookPen className="mr-1" size={24} aria-hidden />
      <h1 className="text-xl font-bold">オレの比較メモ</h1>
    </Link>
  );
}
