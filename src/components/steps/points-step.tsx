"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DecisionPoint, DEFAULT_DECISION_POINTS } from "@/lib/types";
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
import {
  ChevronDownIcon,
  GripVerticalIcon,
  PlusIcon,
  RotateCcwIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState } from "react";

interface PointsStepProps {
  decisionPoints: DecisionPoint[];
  pointsMemo: string;
  onPointsChange: (points: DecisionPoint[]) => void;
  onMemoChange: (memo: string) => void;
}

interface SortablePointItemProps {
  point: DecisionPoint;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<DecisionPoint>) => void;
}

function SortablePointItem({
  point,
  isExpanded,
  onToggleExpanded,
  onRemove,
  onUpdate,
}: SortablePointItemProps) {
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
        "rounded-lg border transition-colors",
        point.isImportant
          ? "border-primary bg-primary/5"
          : "border-border bg-card",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
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
          <Checkbox
            id={`important-${point.id}`}
            checked={point.isImportant}
            onCheckedChange={(checked) => onUpdate({ isImportant: !!checked })}
          />
          <Label
            htmlFor={`important-${point.id}`}
            className="flex-1 text-sm sm:text-base font-medium cursor-pointer"
          >
            {point.name}
          </Label>

          {point.isImportant && (
            <div className="hidden sm:flex gap-0.5">
              {[1, 2, 3, 4, 5].map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => onUpdate({ weight })}
                  className="p-0.5 transition-colors"
                  aria-label={`重要度 ${weight}`}
                >
                  <StarIcon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      weight <= point.weight
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30",
                    )}
                  />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleExpanded}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isExpanded ? "閉じる" : "詳細を開く"}
          >
            <ChevronDownIcon
              className={cn(
                "w-5 h-5 transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4 pl-10">
            {point.isImportant && (
              <div className="sm:hidden space-y-2">
                <span className="text-xs text-muted-foreground">重要度</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((weight) => (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => onUpdate({ weight })}
                      className="p-1 transition-colors"
                      aria-label={`重要度 ${weight}`}
                    >
                      <StarIcon
                        className={cn(
                          "w-6 h-6 transition-colors",
                          weight <= point.weight
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                メモ（任意）
              </Label>
              <Textarea
                placeholder="このポイントに関するメモ..."
                value={point.memo}
                onChange={(e) => onUpdate({ memo: e.target.value })}
                className="min-h-20 resize-none text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PointsStep({
  decisionPoints,
  pointsMemo,
  onPointsChange,
  onMemoChange,
}: PointsStepProps) {
  const [newPointName, setNewPointName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isComposingRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const addPoint = () => {
    if (!newPointName.trim() || isComposingRef.current) return;
    const newPoint: DecisionPoint = {
      id: crypto.randomUUID(),
      name: newPointName.trim(),
      isImportant: false,
      weight: 2,
      memo: "",
    };
    onPointsChange([...decisionPoints, newPoint]);
    setNewPointName("");
  };

  const removePoint = (id: string) => {
    onPointsChange(decisionPoints.filter((point) => point.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const updatePoint = (id: string, updates: Partial<DecisionPoint>) => {
    onPointsChange(
      decisionPoints.map((point) =>
        point.id === id ? { ...point, ...updates } : point,
      ),
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = decisionPoints.findIndex(
      (point) => point.id === active.id,
    );
    const newIndex = decisionPoints.findIndex((point) => point.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onPointsChange(arrayMove(decisionPoints, oldIndex, newIndex));
  };

  const resetToDefault = () => {
    onPointsChange(
      DEFAULT_DECISION_POINTS.map((point) => ({
        ...point,
        id: crypto.randomUUID(),
      })),
    );
    setExpandedId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposingRef.current) {
      e.preventDefault();
      addPoint();
    }
  };

  const importantCount = decisionPoints.filter(
    (point) => point.isImportant,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">比較ポイントと優先度</h2>
        <p className="text-muted-foreground text-sm">
          製品を選ぶ際に重要なポイントを全て洗い出し、その中であなたが重視するポイントにチェックを入れてください
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{decisionPoints.length} 件のポイント</span>
          <span className="text-primary">{importantCount} 件を重視</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefault}
          className="text-xs"
        >
          <RotateCcwIcon className="w-3 h-3 mr-1" />
          初期値に戻す
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={decisionPoints.map((point) => point.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {decisionPoints.map((point) => (
              <SortablePointItem
                key={point.id}
                point={point}
                isExpanded={expandedId === point.id}
                onToggleExpanded={() =>
                  setExpandedId((current) =>
                    current === point.id ? null : point.id,
                  )
                }
                onRemove={() => removePoint(point.id)}
                onUpdate={(updates) => updatePoint(point.id, updates)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="space-y-3">
        <Label htmlFor="new-point">ポイントを追加</Label>
        <div className="flex gap-2">
          <Input
            id="new-point"
            placeholder="例: カラーバリエーション、拡張性..."
            value={newPointName}
            onChange={(e) => setNewPointName(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            className="flex-1"
          />
          <Button onClick={addPoint} disabled={!newPointName.trim()}>
            <PlusIcon className="w-4 h-4 mr-1" />
            追加
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="points-memo">全体メモ（任意）</Label>
        <Textarea
          id="points-memo"
          placeholder="比較ポイントに関する補足メモ..."
          value={pointsMemo}
          onChange={(e) => onMemoChange(e.target.value)}
          className="min-h-25 resize-none"
        />
      </div>
    </div>
  );
}
