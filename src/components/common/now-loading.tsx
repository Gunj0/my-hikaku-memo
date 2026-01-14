import LoginHeader from "@/components/common/login-header";
import { Spinner } from "@/components/ui/spinner";

export default function NowLoading() {
  return (
    <>
      <LoginHeader />
      <main className="flex flex-1 flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <Spinner />
      </main>
    </>
  );
}
