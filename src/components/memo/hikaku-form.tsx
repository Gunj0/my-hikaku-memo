"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Point, Product } from "@/types/memo";
import { Plus, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface HikakuFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  categories: string[];
  onCategoriesChange: (value: string[]) => void;
  points: Point[];
  onPointsChange: (points: Point[]) => void;
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  isAILoading: boolean;
  onAISuggestPoints: () => void;
  onAISuggestProducts: () => void;
}

export function HikakuForm({
  categories,
  onCategoriesChange,
  points,
  onPointsChange,
  products,
  onProductsChange,
  onAISuggestPoints,
  onAISuggestProducts,
  isAILoading,
}: HikakuFormProps) {
  const [newPointName, setNewPointName] = useState("");
  const [newProductName, setNewProductName] = useState("");

  const addComparisonPoint = () => {
    if (!newPointName.trim()) return;
    const newPoint: Point = {
      id: crypto.randomUUID(),
      name: newPointName,
      isImportant: false,
    };
    onPointsChange([...points, newPoint]);
    setNewPointName("");
  };

  const removeComparisonPoint = (id: string) => {
    onPointsChange(points.filter((p) => p.id !== id));
  };

  const updatePointImportance = (id: string, isImportant: boolean) => {
    onPointsChange(
      points.map((p) => (p.id === id ? { ...p, isImportant } : p))
    );
  };

  const updatePointConstraint = (id: string, constraint: string) => {
    onPointsChange(points.map((p) => (p.id === id ? { ...p, constraint } : p)));
  };

  const addProduct = () => {
    if (!newProductName.trim()) return;
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: newProductName,
      isSelected: false,
    };
    onProductsChange([...products, newProduct]);
    setNewProductName("");
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Category */}
      <Card>
        <CardContent className="">
          <Label htmlFor="category" className="text-base font-semibold">
            1. 製品ジャンルを入力
          </Label>
          <Input
            id="category"
            placeholder="例: スマホ、PC、モニター、洗濯機、冷蔵庫"
            value={categories}
            onChange={(e) => onCategoriesChange([e.target.value])}
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Step 2: Comparison Points */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              2. 比較ポイントを設定
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={onAISuggestPoints}
              disabled={!categories || isAILoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI提案
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="例: 価格、サイズ、メーカー"
              value={newPointName}
              onChange={(e) => setNewPointName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComparisonPoint()}
            />
            <Button onClick={addComparisonPoint} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {points && points.length > 0 && (
            <div className="space-y-3">
              {points.map((point) => (
                <div
                  key={point.id}
                  className="rounded-lg border bg-muted/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`important-${point.id}`}
                        checked={point.isImportant}
                        onCheckedChange={(checked) =>
                          updatePointImportance(
                            point.id ?? "",
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={`important-${point.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {point.name}
                      </label>
                      {point.isImportant && (
                        <Badge variant="default" className="text-xs">
                          重視
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeComparisonPoint(point.id ?? "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {point.isImportant && (
                    <Input
                      placeholder="例: 〜10万円、50cm〜120cm"
                      value={point.constraint || ""}
                      onChange={(e) =>
                        updatePointConstraint(point.id ?? "", e.target.value)
                      }
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Products */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">3. 候補製品を追加</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={onAISuggestProducts}
              disabled={!categories || isAILoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI提案
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="例: iPhone Air、Pixel 10"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addProduct()}
            />
            <Button onClick={addProduct} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {products && products.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <Badge
                  key={product.id}
                  variant="secondary"
                  className="px-3 py-1.5"
                >
                  {product.name}
                  <button
                    onClick={() => removeProduct(product.id ?? "")}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
