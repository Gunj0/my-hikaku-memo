"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PATH from "@/const/Path";
import { formatDate } from "@/lib/format-date";
import type { HikakuMemo } from "@/types/memo";
import { Check, CircleCheck, Crown, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface MemoCardProps {
  memo: HikakuMemo;
}

export default function MemoCard({ memo }: MemoCardProps) {
  const selectedProduct = memo.products?.find(
    (p) => p.id === memo.selectedProductId
  );

  return (
    <Link href={PATH.MEMO.DETAIL + memo.id} className="h-full">
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* タイトル */}
              <CardTitle className="text-lg">{memo.title}</CardTitle>
              {/* 更新日付 */}
              <CardDescription className="mt-1">
                {memo.updatedAt && formatDate(memo.updatedAt)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
          {/* ポイント */}
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-gray-600 text-sm">
              <CircleCheck className="h-4 w-4" />
            </p>
            {/* 重要 */}
            {memo.points
              ?.filter((p) => p.isImportant)
              .map((p) => (
                <Badge key={p.id} variant="outline">
                  <Check className="h-3 w-3" />
                  {p.name}
                </Badge>
              ))}
            {/* 重要でない */}
            {memo.points
              ?.filter((p) => !p.isImportant)
              .map((p) => (
                <Badge key={p.id} variant="secondary">
                  {p.name}
                </Badge>
              ))}
          </div>

          {/* 製品 */}
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-gray-600 text-sm">
              <ShoppingCart className="h-4 w-4" />
            </p>
            {/* 購入した製品 */}
            {memo.products
              ?.filter((p) => p.id === memo.selectedProductId)
              .map((p) => (
                <Badge key={p.id} variant="outline">
                  <Crown className="h-3 w-3" />
                  {p.name}
                </Badge>
              ))}
            {/* 購入してない製品 */}
            {memo.products
              ?.filter((p) => p.id !== memo.selectedProductId)
              .map((p) => (
                <Badge key={p.id} variant="secondary">
                  {p.name}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
