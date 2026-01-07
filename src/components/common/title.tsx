import Link from "next/link";

export default function Title() {
  return (
    <Link href={"/"}>
      <h1 className="text-xl font-bold">オレの比較メモ</h1>
    </Link>
  );
}
