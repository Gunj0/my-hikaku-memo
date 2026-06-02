"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
  onScoreChange: (score: number) => void;
  onMemoChange: (memo: string) => void;
}

interface SortableMobileProductCardProps {
  product: Product;
  importantPoints: DecisionPoint[];
  pointSensors: ReturnType<typeof useSensors>;
  onPointDragEnd: (event: DragEndEvent) => void;
  getScore: (productId: string, pointId: string) => ProductScore | undefined;
  onScoreChange: (productId: string, pointId: string, score: number) => void;
  onMemoChange: (productId: string, pointId: string, memo: string) => void;
}

interface SortableProductHeaderProps {
  product: Product;
}

interface SortablePointRowProps {
  point: DecisionPoint;
  products: Product[];
  getScore: (productId: string, pointId: string) => ProductScore | undefined;
  onScoreChange: (productId: string, pointId: string, score: number) => void;
  onMemoChange: (productId: string, pointId: string, memo: string) => void;
}

function reorderImportantDecisionPoints(
  decisionPoints: DecisionPoint[],
  activeId: string,
  overId: string,
) {
  const importantPoints = decisionPoints.filter((point) => point.isImportant);
  const oldIndex = importantPoints.findIndex((point) => point.id === activeId);
  const newIndex = importantPoints.findIndex((point) => point.id === overId);

  if (oldIndex < 0 || newIndex < 0) {
    return decisionPoints;
  }

  const reorderedImportantPoints = arrayMove(
    importantPoints,
    oldIndex,
    newIndex,
  );
  let reorderedIndex = 0;

  return decisionPoints.map((point) => {
    if (!point.isImportant) {
      return point;
    }

    const nextPoint = reorderedImportantPoints[reorderedIndex];
    reorderedIndex += 1;

    return nextPoint ?? point;
  });
}

function SortableMobilePointSection({
  point,
  scoreData,
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
          <span className="text-sm font-medium truncate">{point.name}</span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          重要度: {point.weight}
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
        className="min-h-15 resize-none text-sm"
      />
    </div>
  );
}

function SortableMobileProductCard({
  product,
  importantPoints,
  pointSensors,
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
        <h3 className="font-medium">{product.name}</h3>
      </div>
      <DndContext
        sensors={pointSensors}
        collisionDetection={closestCenter}
        onDragEnd={onPointDragEnd}
      >
        <SortableContext
          items={importantPoints.map((point) => point.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-border">
            {importantPoints.map((point) => (
              <SortableMobilePointSection
                key={point.id}
                point={point}
                scoreData={getScore(product.id, point.id)}
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

function SortableProductHeader({ product }: SortableProductHeaderProps) {
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
      className={cn("min-w-50 text-center", isDragging && "bg-card")}
    >
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`${product.name}の列をドラッグして並び替え`}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="w-4 h-4 rotate-90" />
        </Button>
        <span>{product.name}</span>
      </div>
    </TableHead>
  );
}

function SortablePointRow({
  point,
  products,
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
      className={cn(isDragging && "bg-card opacity-80 shadow-lg")}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2 min-w-0">
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
          <span className="truncate">{point.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="inline-flex items-center gap-1 text-primary">
          <StarIcon className="w-4 h-4 fill-primary" />
          {point.weight}
        </span>
      </TableCell>
      {products.map((product) => {
        const scoreData = getScore(product.id, point.id);
        return (
          <TableCell key={product.id}>
            <div className="space-y-2">
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
  const importantPoints = decisionPoints.filter((point) => point.isImportant);
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
      reorderImportantDecisionPoints(
        decisionPoints,
        String(active.id),
        String(over.id),
      ),
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

  if (products.length === 0 || importantPoints.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">評価を入力</h2>
          <p className="text-muted-foreground text-sm">
            製品と重視ポイントを先に設定してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">評価を入力</h2>
        <p className="text-muted-foreground text-sm">
          各製品の重視ポイントに対する評価を入力してください
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
                  importantPoints={importantPoints}
                  pointSensors={pointSensors}
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
                  <TableHead className="min-w-37.5">ポイント</TableHead>
                  <TableHead className="text-center w-20">重要度</TableHead>
                  {products.map((product) => (
                    <SortableProductHeader key={product.id} product={product} />
                  ))}
                </TableRow>
              </SortableContext>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={importantPoints.map((point) => point.id)}
                strategy={verticalListSortingStrategy}
              >
                {importantPoints.map((point) => (
                  <SortablePointRow
                    key={point.id}
                    point={point}
                    products={products}
                    getScore={getScore}
                    onScoreChange={updateScore}
                    onMemoChange={updateMemo}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
