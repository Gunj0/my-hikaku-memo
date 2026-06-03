import Link from "next/link";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LegalPageLayoutProps = {
  title: string;
  description: string;
  updatedAt: string;
  jsonLd: Record<string, unknown>;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  description,
  updatedAt,
  jsonLd,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Card className="border-border/80 bg-card/76">
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <CardTitle className="text-2xl leading-tight md:text-3xl">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          <p className="text-xs text-muted-foreground">
            最終更新日: {updatedAt}
          </p>
        </CardHeader>
      </Card>

      <Card className="border-border/80 bg-card/72">
        <CardContent className="space-y-8 pt-6 text-sm leading-7 text-foreground/90 [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_h2]:text-base [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-2 [&_ul]:space-y-2">
          {children}

          <div className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
            <Link href="/">ホームへ戻る</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
