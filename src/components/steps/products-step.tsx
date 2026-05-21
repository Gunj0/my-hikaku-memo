"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/lib/types";
import { PackageIcon, PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";

interface ProductsStepProps {
  products: Product[];
  productsMemo: string;
  onProductsChange: (products: Product[]) => void;
  onMemoChange: (memo: string) => void;
}

export function ProductsStep({
  products,
  productsMemo,
  onProductsChange,
  onMemoChange,
}: ProductsStepProps) {
  const [newProductName, setNewProductName] = useState("");
  const isComposingRef = useRef(false);

  const addProduct = () => {
    if (!newProductName.trim() || isComposingRef.current) return;
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: newProductName.trim(),
      memo: "",
    };
    onProductsChange([...products, newProduct]);
    setNewProductName("");
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter((p) => p.id !== id));
  };

  const updateProductMemo = (id: string, memo: string) => {
    onProductsChange(products.map((p) => (p.id === id ? { ...p, memo } : p)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposingRef.current) {
      e.preventDefault();
      addProduct();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">候補製品を洗い出す</h2>
        <p className="text-muted-foreground text-sm">
          比較したい製品を追加してください（2件以上）
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="new-product">製品を追加</Label>
        <div className="flex gap-2">
          <Input
            id="new-product"
            placeholder="製品名を入力..."
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            className="flex-1"
          />
          <Button onClick={addProduct} disabled={!newProductName.trim()}>
            <PlusIcon className="w-4 h-4 mr-1" />
            追加
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <PackageIcon className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm">まだ製品が追加されていません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="p-4 bg-card border border-border rounded-lg space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium">{product.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeProduct(product.id)}
                  aria-label={`${product.name}を削除`}
                >
                  <XIcon className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
              <Textarea
                placeholder="この製品に関するメモ（価格、購入先など）..."
                value={product.memo}
                onChange={(e) => updateProductMemo(product.id, e.target.value)}
                className="min-h-20 resize-none text-sm"
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <Label htmlFor="products-memo">全体メモ（任意）</Label>
        <Textarea
          id="products-memo"
          placeholder="候補製品に関する補足メモ..."
          value={productsMemo}
          onChange={(e) => onMemoChange(e.target.value)}
          className="min-h-25 resize-none"
        />
      </div>
    </div>
  );
}
