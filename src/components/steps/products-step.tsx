"use client";

import { EditableItemName } from "@/components/editable-item-name";
import { LengthCounter } from "@/components/length-counter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPARISON_MEMO_TEXT_MAX_LENGTH,
  COMPARISON_PRODUCTS_MAX_COUNT,
  COMPARISON_SHORT_TEXT_MAX_LENGTH,
} from "@/lib/comparison-limits";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, PackageIcon, PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";

interface ProductsStepProps {
  products: Product[];
  productsMemo: string;
  onProductsChange: (products: Product[]) => void;
  onMemoChange: (memo: string) => void;
}

interface SortableProductItemProps {
  product: Product;
  onNameChange: (name: string) => void;
  onRemove: () => void;
  onMemoChange: (memo: string) => void;
}

function SortableProductItem({
  product,
  onNameChange,
  onRemove,
  onMemoChange,
}: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "bg-card border border-border rounded-lg space-y-3",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`${product.name}をドラッグして並び替え`}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="w-4 h-4" />
        </Button>
        <div className="min-w-0 flex-1 space-y-1">
          <EditableItemName
            value={product.name}
            onCommit={onNameChange}
            aria-label="候補名を編集"
            maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
            className="h-9 bg-background font-medium"
          />
          <LengthCounter
            current={product.name.length}
            max={COMPARISON_SHORT_TEXT_MAX_LENGTH}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRemove}
          aria-label={`${product.name}を削除`}
        >
          <XIcon className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
      <div className="space-y-1">
        <Textarea
          placeholder="この製品に関するメモ（URL、有力候補など）..."
          value={product.memo}
          onChange={(e) => onMemoChange(e.target.value)}
          maxLength={COMPARISON_MEMO_TEXT_MAX_LENGTH}
          className="min-h-10 resize-none text-sm"
        />
        <LengthCounter
          current={product.memo.length}
          max={COMPARISON_MEMO_TEXT_MAX_LENGTH}
        />
      </div>
    </div>
  );
}

export function ProductsStep({
  products,
  productsMemo,
  onProductsChange,
  onMemoChange,
}: ProductsStepProps) {
  const [newProductName, setNewProductName] = useState("");
  const isComposingRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const hasReachedProductLimit =
    products.length >= COMPARISON_PRODUCTS_MAX_COUNT;

  const addProduct = () => {
    if (
      !newProductName.trim() ||
      isComposingRef.current ||
      hasReachedProductLimit
    ) {
      return;
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: newProductName.trim(),
      memo: "",
    };
    onProductsChange([...products, newProduct]);
    setNewProductName("");
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter((product) => product.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    onProductsChange(
      products.map((product) =>
        product.id === id ? { ...product, ...updates } : product,
      ),
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = products.findIndex((product) => product.id === active.id);
    const newIndex = products.findIndex((product) => product.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onProductsChange(arrayMove(products, oldIndex, newIndex));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposingRef.current) {
      e.preventDefault();
      addProduct();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold mb-2">気になる候補は？</h2>
        <p className="text-muted-foreground text-sm">
          ヒント: 「カテゴリ名 ランキング」で検索
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <PackageIcon className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm">まだ製品が追加されていません</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={products.map((product) => product.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {products.map((product) => (
                <SortableProductItem
                  key={product.id}
                  product={product}
                  onNameChange={(name) => updateProduct(product.id, { name })}
                  onRemove={() => removeProduct(product.id)}
                  onMemoChange={(memo) => updateProduct(product.id, { memo })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="space-y-3">
        <Label htmlFor="new-product">候補を追加</Label>
        <p className="text-xs text-muted-foreground">
          {products.length}/{COMPARISON_PRODUCTS_MAX_COUNT}件
        </p>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Input
              id="new-product"
              placeholder="候補を入力..."
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
              disabled={hasReachedProductLimit}
              className="flex-1 border-foreground/20"
            />
            <LengthCounter
              current={newProductName.length}
              max={COMPARISON_SHORT_TEXT_MAX_LENGTH}
            />
          </div>
          <Button
            onClick={addProduct}
            disabled={!newProductName.trim() || hasReachedProductLimit}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            追加
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="products-memo">全体メモ（任意）</Label>
        <div className="space-y-1">
          <Textarea
            id="products-memo"
            placeholder="候補に関する補足メモ..."
            value={productsMemo}
            onChange={(e) => onMemoChange(e.target.value)}
            maxLength={COMPARISON_MEMO_TEXT_MAX_LENGTH}
            className="min-h-25 resize-none border-foreground/20"
          />
          <LengthCounter
            current={productsMemo.length}
            max={COMPARISON_MEMO_TEXT_MAX_LENGTH}
          />
        </div>
      </div>
    </div>
  );
}
