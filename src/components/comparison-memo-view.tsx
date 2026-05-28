import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DecisionPoint, Product, PublicComparisonMemo } from "@/lib/types";
import { BadgeCheckIcon, StarIcon, TrophyIcon } from "lucide-react";

type ComparisonMemoViewProps = {
  memo: PublicComparisonMemo;
};

type ProductTotal = {
  product: Product;
  totalScore: number;
  maxPossible: number;
  percentage: number;
};

function getAuthorLabel(name: string | null) {
  return name?.trim() || "匿名ユーザー";
}

function getInitials(name: string | null) {
  return getAuthorLabel(name).slice(0, 2).toUpperCase();
}

function getScore(
  memo: PublicComparisonMemo,
  productId: string,
  pointId: string,
) {
  return (
    memo.data.scores.find(
      (score) => score.productId === productId && score.pointId === pointId,
    )?.score || 0
  );
}

function getProductTotals(
  products: Product[],
  decisionPoints: DecisionPoint[],
  memo: PublicComparisonMemo,
) {
  const importantPoints = decisionPoints.filter((point) => point.isImportant);

  return products
    .map((product) => {
      let totalScore = 0;
      let maxPossible = 0;

      importantPoints.forEach((point) => {
        totalScore += getScore(memo, product.id, point.id) * point.weight;
        maxPossible += 5 * point.weight;
      });

      return {
        product,
        totalScore,
        maxPossible,
        percentage: maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0,
      } satisfies ProductTotal;
    })
    .sort((left, right) => right.totalScore - left.totalScore);
}

export function ComparisonMemoView({ memo }: ComparisonMemoViewProps) {
  const importantPoints = memo.data.decisionPoints.filter(
    (point) => point.isImportant,
  );
  const productTotals = getProductTotals(
    memo.data.products,
    memo.data.decisionPoints,
    memo,
  );
  const topScore = productTotals[0]?.totalScore ?? 0;
  const selectedProduct = memo.data.products.find(
    (product) => product.id === memo.data.selectedProductId,
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/76">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="rounded-full border border-border/70 px-2 py-0.5">
                read only
              </span>
              <span className="rounded-full border border-border/70 px-2 py-0.5 text-foreground">
                {memo.isPublic ? "公開" : "非公開"}
              </span>
              {memo.isOwner ? (
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-foreground">
                  your memo
                </span>
              ) : null}
            </div>
            <div>
              <CardTitle className="text-2xl leading-tight">
                {memo.title}
              </CardTitle>
              <CardDescription className="mt-2 text-sm">
                カテゴリ: {memo.category || "未設定"}
              </CardDescription>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border/70 bg-background/45 px-3 py-2">
            <Avatar className="size-10 border border-border/70">
              <AvatarImage
                src={memo.author.image ?? undefined}
                alt={getAuthorLabel(memo.author.name)}
              />
              <AvatarFallback>{getInitials(memo.author.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">
                {getAuthorLabel(memo.author.name)}
              </p>
              <p className="text-xs text-muted-foreground">
                更新: {new Date(memo.updatedAt).toLocaleString("ja-JP")}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedProduct ? (
        <Card className="border-success/35 bg-success/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BadgeCheckIcon className="h-5 w-5 text-success" />
              このメモの結論
            </CardTitle>
            <CardDescription>
              選択された製品: {selectedProduct.name}
            </CardDescription>
          </CardHeader>
          {memo.data.decisionMemo.trim() ? (
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {memo.data.decisionMemo}
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,1fr)]">
        <Card className="border-border/80 bg-card/72">
          <CardHeader>
            <CardTitle className="text-xl">比較結果</CardTitle>
            <CardDescription>
              重要な比較ポイントに対する加重スコアです。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {productTotals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                比較対象がまだ入力されていません。
              </p>
            ) : (
              productTotals.map((item, index) => (
                <div
                  key={item.product.id}
                  className="rounded-lg border border-border/70 bg-background/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                        {index === 0 && topScore > 0 ? (
                          <TrophyIcon className="h-4 w-4 text-success" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.totalScore} / {item.maxPossible} pt
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/72">
          <CardHeader>
            <CardTitle className="text-xl">メモ概要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              重要ポイント数: {importantPoints.length}
            </div>
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              比較候補数: {memo.data.products.length}
            </div>
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              評価入力数: {memo.data.scores.length}
            </div>
            {memo.data.categoryMemo.trim() ? (
              <div className="rounded-lg border border-border/70 bg-background/40 p-3 leading-6">
                カテゴリメモ: {memo.data.categoryMemo}
              </div>
            ) : null}
            {memo.data.pointsMemo.trim() ? (
              <div className="rounded-lg border border-border/70 bg-background/40 p-3 leading-6">
                ポイントメモ: {memo.data.pointsMemo}
              </div>
            ) : null}
            {memo.data.productsMemo.trim() ? (
              <div className="rounded-lg border border-border/70 bg-background/40 p-3 leading-6">
                候補メモ: {memo.data.productsMemo}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80 bg-card/72">
        <CardHeader>
          <CardTitle className="text-xl">比較ポイント一覧</CardTitle>
          <CardDescription>
            重要ポイントには重みが設定されています。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {memo.data.decisionPoints.map((point) => (
            <div
              key={point.id}
              className="rounded-lg border border-border/70 bg-background/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{point.name}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  <StarIcon className="h-4 w-4 fill-primary" />
                  {point.weight}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {point.isImportant ? "重要ポイント" : "参考ポイント"}
              </p>
              {point.memo.trim() ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {point.memo}
                </p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/72">
        <CardHeader>
          <CardTitle className="text-xl">候補製品と評価表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {memo.data.products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-border/70 bg-background/40 p-4"
              >
                <p className="font-medium">{product.name}</p>
                {product.memo.trim() ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {product.memo}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">メモなし</p>
                )}
              </div>
            ))}
          </div>

          {importantPoints.length > 0 && memo.data.products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">
                      比較ポイント
                    </TableHead>
                    {memo.data.products.map((product) => (
                      <TableHead
                        key={product.id}
                        className="min-w-[110px] text-center"
                      >
                        {product.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importantPoints.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell className="font-medium">
                        {point.name}
                      </TableCell>
                      {memo.data.products.map((product) => (
                        <TableCell key={product.id} className="text-center">
                          {getScore(memo, product.id, point.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
