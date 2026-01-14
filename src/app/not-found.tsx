import SimpleHeader from "@/components/common/simple-header";
import { Button } from "@/components/ui/button";
import PATH from "@/const/Path";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <SimpleHeader />
      <main className="flex flex-1 flex-col items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
        <p className="mb-10">ページが見つかりませんでした。</p>
        <Button asChild variant={"outline"}>
          <Link href={PATH.HOME}>ホームに戻る</Link>
        </Button>
      </main>
    </>
  );
}
