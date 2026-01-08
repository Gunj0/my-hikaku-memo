import { SITE } from "@/const/Site";

export default function Footer() {
  return (
    <footer className="w-full text-center py-4 border-t">
      <p className="text-sm text-gray-500">
        &copy; {SITE.YEAR} {SITE.AUTHOR}. All rights reserved.
      </p>
    </footer>
  );
}
