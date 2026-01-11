"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PATH } from "@/const/Path";
import { formatDate } from "@/lib/format-date";
import type { HikakuMemo } from "@/types/memo";
import { Edit, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

interface MemoCardProps {
  memo: HikakuMemo;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isEditable?: boolean;
}

export function MemoCard({
  memo,
  onEdit,
  onDelete,
  isEditable = false,
}: MemoCardProps) {
  const selectedProduct = memo.products?.find(
    (p) => p.id === memo.selectedProductId
  );
  const formattedDate = formatDate(memo.updatedAt);

  return (
    <Link href={PATH.MEMO.DETAIL + memo.id} className="h-full">
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg">{memo.title}</CardTitle>
              <CardDescription className="mt-1">
                {formattedDate}
              </CardDescription>
            </div>
            {isEditable && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(memo.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(memo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
          <div className="flex flex-wrap gap-2">
            {memo.products?.map((product) => (
              <Badge
                key={product.id}
                variant={
                  product.id === memo.selectedProductId
                    ? "default"
                    : "secondary"
                }
              >
                {product.id === memo.selectedProductId && (
                  <ShoppingCart className="mr-1 h-3 w-3" />
                )}
                {product.name}
              </Badge>
            ))}
          </div>
          {selectedProduct && memo.finalDecisionReason && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium">
                購入決定: {selectedProduct.name}
              </div>
              <div className="mt-1 text-muted-foreground line-clamp-2">
                {memo.finalDecisionReason}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
