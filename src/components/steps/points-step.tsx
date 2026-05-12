"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DecisionPoint, DEFAULT_DECISION_POINTS } from "@/lib/types";
import {
  PlusIcon,
  XIcon,
  RotateCcwIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface PointsStepProps {
  decisionPoints: DecisionPoint[];
  pointsMemo: string;
  onPointsChange: (points: DecisionPoint[]) => void;
  onMemoChange: (memo: string) => void;
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
    onPointsChange(decisionPoints.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updatePoint = (id: string, updates: Partial<DecisionPoint>) => {
    onPointsChange(
      decisionPoints.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const resetToDefault = () => {
    const defaultPoints = DEFAULT_DECISION_POINTS.map((p) => ({
      ...p,
      id: crypto.randomUUID(),
    }));
    onPointsChange(defaultPoints);
    setExpandedId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposingRef.current) {
      e.preventDefault();
      addPoint();
    }
  };

  const importantCount = decisionPoints.filter((p) => p.isImportant).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">比較ポイントと優先度</h2>
        <p className="text-muted-foreground text-sm">
          製品を選ぶ際に重要な項目を設定し、重視するポイントにチェックを入れてください
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

      <div className="space-y-2">
        {decisionPoints.map((point) => {
          const isExpanded = expandedId === point.id;

          return (
            <div
              key={point.id}
              className={cn(
                "rounded-lg border transition-colors",
                point.isImportant
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`important-${point.id}`}
                    checked={point.isImportant}
                    onCheckedChange={(checked) =>
                      updatePoint(point.id, { isImportant: !!checked })
                    }
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
                          onClick={() => updatePoint(point.id, { weight })}
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
                    onClick={() => setExpandedId(isExpanded ? null : point.id)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={isExpanded ? "閉じる" : "詳細を開く"}
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removePoint(point.id)}
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 pl-7">
                    {point.isImportant && (
                      <div className="sm:hidden space-y-2">
                        <span className="text-xs text-muted-foreground">
                          重要度
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((weight) => (
                            <button
                              key={weight}
                              onClick={() => updatePoint(point.id, { weight })}
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
                        onChange={(e) =>
                          updatePoint(point.id, { memo: e.target.value })
                        }
                        className="min-h-20 resize-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
