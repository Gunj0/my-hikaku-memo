import { PATH } from "@/const/Path";
import Image from "next/image";
import Link from "next/link";

export default function Title() {
  return (
    <Link href={PATH.HOME} className="flex items-center">
      <Image
        src={PATH.ICON}
        className="mr-1"
        alt="サイトロゴ"
        width={40}
        height={40}
      />
      <h1 className="text-xl font-bold">オレの比較メモ</h1>
    </Link>
  );
}
