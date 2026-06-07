"use client";

import { DecisionPointImportanceIcon } from "@/components/decision-point-importance-icon";
import { EditableItemName } from "@/components/editable-item-name";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPARISON_MEMO_TEXT_MAX_LENGTH,
  COMPARISON_SHORT_TEXT_MAX_LENGTH,
} from "@/lib/comparison-limits";
import { DecisionPoint, Product, ProductScore } from "@/lib/types";
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
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, StarIcon } from "lucide-react";

interface EvaluationStepProps {
  products: Product[];
  decisionPoints: DecisionPoint[];
  scores: ProductScore[];
  onProductsChange: (products: Product[]) => void;
  onDecisionPointsChange: (points: DecisionPoint[]) => void;
  onScoresChange: (scores: ProductScore[]) => void;
}

interface SortableMobilePointSectionProps {
  point: DecisionPoint;
  scoreData?: ProductScore;
  onNameChange: (name: string) => void;
  onScoreChange: (score: number) => void;
  onMemoChange: (memo: string) => void;
}

interface SortableMobileProductCardProps {
  product: Product;
  decisionPoints: DecisionPoint[];
  pointSensors: ReturnType<typeof useSensors>;
  onProductNameChange: (productId: string, name: string) => void;
  onPointNameChange: (pointId: string, name: string) => void;
  onPointDragEnd: (event: DragEndEvent) => void;
  getScore: (productId: string, pointId: string) => ProductScore | undefined;
  onScoreChange: (productId: string, pointId: string, score: number) => void;
  onMemoChange: (productId: string, pointId: string, memo: string) => void;
}

interface SortableProductHeaderProps {
  product: Product;
  onNameChange: (name: string) => void;
}

interface SortablePointRowProps {
  point: DecisionPoint;
  products: Product[];
  onNameChange: (name: string) => void;
  getScore: (productId: string, pointId: string) => ProductScore | undefined;
  onScoreChange: (productId: string, pointId: string, score: number) => void;
  onMemoChange: (productId: string, pointId: string, memo: string) => void;
}

function reorderDecisionPoints(
  decisionPoints: DecisionPoint[],
  activeId: string,
  overId: string,
) {
  const oldIndex = decisionPoints.findIndex((point) => point.id === activeId);
  const newIndex = decisionPoints.findIndex((point) => point.id === overId);

  if (oldIndex < 0 || newIndex < 0) {
    return decisionPoints;
  }

  return arrayMove(decisionPoints, oldIndex, newIndex);
}

function SortableMobilePointSection({
  point,
  scoreData,
  onNameChange,
  onScoreChange,
  onMemoChange,
}: SortableMobilePointSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: point.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "p-4 space-y-3 bg-card",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
            aria-label={`${point.name}をドラッグして並び替え`}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="w-4 h-4" />
          </Button>
          <EditableItemName
            value={point.name}
            onCommit={onNameChange}
            aria-label="ポイント名を編集"
            maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
            className="h-8 border-0 bg-transparent px-0 text-sm font-medium shadow-none"
          />
        </div>
        <span className="inline-flex shrink-0 items-center text-muted-foreground">
          <DecisionPointImportanceIcon weight={point.weight} />
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onScoreChange(score)}
            className="p-1"
          >
            <StarIcon
              className={cn(
                "w-7 h-7 transition-colors",
                score <= (scoreData?.score || 0)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="メモ..."
        value={scoreData?.memo || ""}
        onChange={(e) => onMemoChange(e.target.value)}
        maxLength={COMPARISON_MEMO_TEXT_MAX_LENGTH}
        className="min-h-15 resize-none text-sm"
      />
    </div>
  );
}

function SortableMobileProductCard({
  product,
  decisionPoints,
  pointSensors,
  onProductNameChange,
  onPointNameChange,
  onPointDragEnd,
  getScore,
  onScoreChange,
  onMemoChange,
}: SortableMobileProductCardProps) {
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
        "bg-card border border-border rounded-lg overflow-hidden",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
    >
      <div className="bg-secondary p-4 flex items-center gap-2">
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
        <EditableItemName
          value={product.name}
          onCommit={(name) => onProductNameChange(product.id, name)}
          aria-label="候補名を編集"
          maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
          className="h-8 border-0 bg-transparent px-0 font-medium shadow-none"
        />
      </div>
      <DndContext
        sensors={pointSensors}
        collisionDetection={closestCenter}
        onDragEnd={onPointDragEnd}
      >
        <SortableContext
          items={decisionPoints.map((point) => point.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-border">
            {decisionPoints.map((point) => (
              <SortableMobilePointSection
                key={point.id}
                point={point}
                scoreData={getScore(product.id, point.id)}
                onNameChange={(name) => onPointNameChange(point.id, name)}
                onScoreChange={(score) =>
                  onScoreChange(product.id, point.id, score)
                }
                onMemoChange={(memo) =>
                  onMemoChange(product.id, point.id, memo)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableProductHeader({
  product,
  onNameChange,
}: SortableProductHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
    data: { sortableType: "product" },
  });

  return (
    <TableHead
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "w-56 min-w-50 max-w-56 align-top text-center whitespace-normal",
        isDragging && "bg-card",
      )}
    >
      <div className="flex h-8 items-start justify-center gap-2 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing h-8"
          aria-label={`${product.name}の列をドラッグして並び替え`}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="w-4 h-4 rotate-90" />
        </Button>
        <EditableItemName
          value={product.name}
          onCommit={onNameChange}
          aria-label="候補名を編集"
          maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
          className="h-8 bg-background text-left"
        />
      </div>
    </TableHead>
  );
}

function SortablePointRow({
  point,
  products,
  onNameChange,
  getScore,
  onScoreChange,
  onMemoChange,
}: SortablePointRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: point.id,
    data: { sortableType: "point" },
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn("group", isDragging && "bg-card opacity-80 shadow-lg")}
    >
      <TableCell
        className={cn(
          "sticky left-0 z-20 w-56 min-w-37.5 max-w-56 border-r bg-background font-medium whitespace-normal group-hover:bg-muted/50",
          isDragging && "bg-card",
        )}
      >
        <div className="flex items-start gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
            aria-label={`${point.name}の行をドラッグして並び替え`}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="w-4 h-4" />
          </Button>
          <EditableItemName
            value={point.name}
            onCommit={onNameChange}
            aria-label="ポイント名を編集"
            maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
            className="h-auto min-h-8 bg-background leading-5"
          />
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-1 text-primary">
          <DecisionPointImportanceIcon
            weight={point.weight}
            className="h-4 w-4"
          />
        </span>
      </TableCell>
      {products.map((product) => {
        const scoreData = getScore(product.id, point.id);
        return (
          <TableCell
            key={product.id}
            className="w-56 min-w-50 max-w-56 align-top whitespace-normal"
          >
            <div className="min-w-0 space-y-2">
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => onScoreChange(product.id, point.id, score)}
                    className="p-0.5"
                  >
                    <StarIcon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        score <= (scoreData?.score || 0)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30",
                      )}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="メモ..."
                value={scoreData?.memo || ""}
                onChange={(e) =>
                  onMemoChange(product.id, point.id, e.target.value)
                }
                maxLength={COMPARISON_MEMO_TEXT_MAX_LENGTH}
                className="min-h-12.5 resize-none text-xs"
              />
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export function EvaluationStep({
  products,
  decisionPoints,
  scores,
  onProductsChange,
  onDecisionPointsChange,
  onScoresChange,
}: EvaluationStepProps) {
  const productSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const pointSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const getScore = (
    productId: string,
    pointId: string,
  ): ProductScore | undefined => {
    return scores.find(
      (score) => score.productId === productId && score.pointId === pointId,
    );
  };

  const getProductTotalScore = (productId: string): number => {
    return decisionPoints.reduce((total, point) => {
      const score = getScore(productId, point.id)?.score || 0;
      return total + score * point.weight;
    }, 0);
  };

  const updateScore = (productId: string, pointId: string, score: number) => {
    const existingIndex = scores.findIndex(
      (item) => item.productId === productId && item.pointId === pointId,
    );

    if (existingIndex >= 0) {
      const nextScores = [...scores];
      nextScores[existingIndex] = { ...nextScores[existingIndex], score };
      onScoresChange(nextScores);
      return;
    }

    onScoresChange([...scores, { productId, pointId, score, memo: "" }]);
  };

  const updateMemo = (productId: string, pointId: string, memo: string) => {
    const existingIndex = scores.findIndex(
      (item) => item.productId === productId && item.pointId === pointId,
    );

    if (existingIndex >= 0) {
      const nextScores = [...scores];
      nextScores[existingIndex] = { ...nextScores[existingIndex], memo };
      onScoresChange(nextScores);
      return;
    }

    onScoresChange([...scores, { productId, pointId, score: 0, memo }]);
  };

  const updateProductName = (productId: string, name: string) => {
    onProductsChange(
      products.map((product) =>
        product.id === productId ? { ...product, name } : product,
      ),
    );
  };

  const updatePointName = (pointId: string, name: string) => {
    onDecisionPointsChange(
      decisionPoints.map((point) =>
        point.id === pointId ? { ...point, name } : point,
      ),
    );
  };

  const handleProductsDragEnd = ({ active, over }: DragEndEvent) => {
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

  const handlePointsDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    onDecisionPointsChange(
      reorderDecisionPoints(decisionPoints, String(active.id), String(over.id)),
    );
  };

  const handleDesktopDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeType = active.data.current?.sortableType;
    const overType = over.data.current?.sortableType;

    if (activeType !== overType) {
      return;
    }

    if (activeType === "product") {
      handleProductsDragEnd(event);
      return;
    }

    if (activeType === "point") {
      handlePointsDragEnd(event);
    }
  };

  if (products.length === 0 || decisionPoints.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">評価を入力</h2>
          <p className="text-muted-foreground text-sm">
            候補と比較ポイントを先に入力してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">情報を整理して評価する</h2>
        <p className="text-muted-foreground text-sm">
          気になる全ての情報をここにまとめましょう
        </p>
      </div>

      <div className="md:hidden">
        <DndContext
          sensors={productSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleProductsDragEnd}
        >
          <SortableContext
            items={products.map((product) => product.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {products.map((product) => (
                <SortableMobileProductCard
                  key={product.id}
                  product={product}
                  decisionPoints={decisionPoints}
                  pointSensors={pointSensors}
                  onProductNameChange={updateProductName}
                  onPointNameChange={updatePointName}
                  onPointDragEnd={handlePointsDragEnd}
                  getScore={getScore}
                  onScoreChange={updateScore}
                  onMemoChange={updateMemo}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="hidden md:block">
        <DndContext
          sensors={productSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDesktopDragEnd}
        >
          <Table>
            <TableHeader>
              <SortableContext
                items={products.map((product) => product.id)}
                strategy={horizontalListSortingStrategy}
              >
                <TableRow>
                  <TableHead className="sticky left-0 z-30 w-56 min-w-37.5 max-w-56 border-r bg-background whitespace-normal">
                    ポイント
                  </TableHead>
                  <TableHead className="text-center w-20">重要度</TableHead>
                  {products.map((product) => (
                    <SortableProductHeader
                      key={product.id}
                      product={product}
                      onNameChange={(name) =>
                        updateProductName(product.id, name)
                      }
                    />
                  ))}
                </TableRow>
              </SortableContext>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={decisionPoints.map((point) => point.id)}
                strategy={verticalListSortingStrategy}
              >
                {decisionPoints.map((point) => (
                  <SortablePointRow
                    key={point.id}
                    point={point}
                    products={products}
                    onNameChange={(name) => updatePointName(point.id, name)}
                    getScore={getScore}
                    onScoreChange={updateScore}
                    onMemoChange={updateMemo}
                  />
                ))}
              </SortableContext>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="sticky left-0 z-20 w-56 min-w-37.5 max-w-56 border-r bg-background font-semibold whitespace-normal">
                  合計点
                </TableCell>
                <TableCell className="bg-background" />
                {products.map((product) => (
                  <TableCell
                    key={product.id}
                    className="w-56 min-w-50 max-w-56 bg-background text-center font-semibold"
                  >
                    {getProductTotalScore(product.id)}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
