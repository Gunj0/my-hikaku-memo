"use client";

import { DecisionPointImportanceIcon } from "@/components/decision-point-importance-icon";
import { EditableItemName } from "@/components/editable-item-name";
import { LengthCounter } from "@/components/length-counter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPARISON_DECISION_POINTS_MAX_COUNT,
  COMPARISON_MEMO_TEXT_MAX_LENGTH,
  COMPARISON_SHORT_TEXT_MAX_LENGTH,
} from "@/lib/comparison-limits";
import { DECISION_POINT_IMPORTANCE_OPTIONS, DecisionPoint } from "@/lib/types";
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
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";

interface PointsStepProps {
  decisionPoints: DecisionPoint[];
  pointsMemo: string;
  onPointsChange: (points: DecisionPoint[]) => void;
  onMemoChange: (memo: string) => void;
}

interface SortablePointItemProps {
  point: DecisionPoint;
  onRemove: () => void;
  onUpdate: (updates: Partial<DecisionPoint>) => void;
}

function SortablePointItem({
  point,
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
        "rounded-lg border border-border bg-card space-y-3",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
    >
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

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:flex-nowrap">
          <div
            className="flex shrink-0 items-center gap-1 rounded-md border border-input bg-background p-1"
            role="group"
            aria-label={`${point.name}の重要度`}
          >
            {DECISION_POINT_IMPORTANCE_OPTIONS.map((option) => {
              const isSelected = option.value === point.weight;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onUpdate({ weight: option.value })}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  title={option.message}
                  aria-label={option.message}
                >
                  <DecisionPointImportanceIcon
                    weight={option.value}
                    className={cn(
                      "h-4 w-4",
                      isSelected && "text-primary-foreground",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <EditableItemName
              value={point.name}
              onCommit={(name) => onUpdate({ name })}
              aria-label="ポイント名を編集"
              maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
              className="h-9 bg-background text-sm font-medium sm:text-base"
            />
            <LengthCounter
              current={point.name.length}
              max={COMPARISON_SHORT_TEXT_MAX_LENGTH}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`${point.name}を削除`}
        >
          <XIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <Textarea
          placeholder="このポイントに関するメモ..."
          value={point.memo}
          onChange={(e) => onUpdate({ memo: e.target.value })}
          maxLength={COMPARISON_MEMO_TEXT_MAX_LENGTH}
          className="min-h-10 resize-none text-sm"
        />
        <LengthCounter
          current={point.memo.length}
          max={COMPARISON_MEMO_TEXT_MAX_LENGTH}
        />
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
  const isComposingRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const hasReachedPointLimit =
    decisionPoints.length >= COMPARISON_DECISION_POINTS_MAX_COUNT;

  const addPoint = () => {
    if (
      !newPointName.trim() ||
      isComposingRef.current ||
      hasReachedPointLimit
    ) {
      return;
    }

    const newPoint: DecisionPoint = {
      id: crypto.randomUUID(),
      name: newPointName.trim(),
      weight: 3,
      memo: "",
    };
    onPointsChange([...decisionPoints, newPoint]);
    setNewPointName("");
  };

  const removePoint = (id: string) => {
    onPointsChange(decisionPoints.filter((point) => point.id !== id));
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposingRef.current) {
      e.preventDefault();
      addPoint();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          あなたが重視するポイントは？
        </h2>
        <p className="text-muted-foreground text-sm">
          ヒント: 「カテゴリ名 選ぶポイント」で検索
        </p>
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
                onRemove={() => removePoint(point.id)}
                onUpdate={(updates) => updatePoint(point.id, updates)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="space-y-3">
        <Label htmlFor="new-point">ポイントを追加</Label>
        <p className="text-xs text-muted-foreground">
          {decisionPoints.length}/{COMPARISON_DECISION_POINTS_MAX_COUNT}件
        </p>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
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
              maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
              disabled={hasReachedPointLimit}
              className="flex-1 border-foreground/20"
            />
            <LengthCounter
              current={newPointName.length}
              max={COMPARISON_SHORT_TEXT_MAX_LENGTH}
            />
          </div>
          <Button
            onClick={addPoint}
            disabled={!newPointName.trim() || hasReachedPointLimit}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            追加
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="points-memo">全体メモ（任意）</Label>
        <div className="space-y-1">
          <Textarea
            id="points-memo"
            placeholder="比較ポイントに関する補足メモ..."
            value={pointsMemo}
            onChange={(e) => onMemoChange(e.target.value)}
            maxLength={COMPARISON_MEMO_TEXT_MAX_LENGTH}
            className="min-h-25 resize-none border-foreground/20"
          />
          <LengthCounter
            current={pointsMemo.length}
            max={COMPARISON_MEMO_TEXT_MAX_LENGTH}
          />
        </div>
      </div>
    </div>
  );
}
