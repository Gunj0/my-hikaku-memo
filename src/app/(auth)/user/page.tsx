import { SignOut } from "@/components/auth/sign-out";
import SimpleHeader from "@/components/common/simple-header";

export default function UserPage() {
  return (
    <>
      <SimpleHeader />
      <div className="text-center mt-32">
        <h1 className="mb-10">ユーザーページ</h1>
        <SignOut />
      </div>
    </>
  );
}
