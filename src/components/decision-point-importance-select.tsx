"use client";

import { DecisionPointImportanceIcon } from "@/components/decision-point-importance-icon";
import {
  DECISION_POINT_IMPORTANCE_OPTIONS,
  getDecisionPointImportanceOption,
  normalizeDecisionPointWeight,
  type DecisionPointWeight,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DecisionPointImportanceSelectProps {
  weight: number;
  onChange: (weight: DecisionPointWeight) => void;
  /** 開閉ボタンの aria-label。 */
  label: string;
  className?: string;
}

export function DecisionPointImportanceSelect({
  weight,
  onChange,
  label,
  className,
}: DecisionPointImportanceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedWeight = normalizeDecisionPointWeight(weight);
  const selectedOption = getDecisionPointImportanceOption(selectedWeight);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selected = listRef.current?.querySelector<HTMLButtonElement>(
      '[aria-selected="true"]',
    );
    (selected ?? listRef.current?.querySelector("button"))?.focus();
  }, [isOpen]);

  const moveFocus = (current: HTMLElement, offset: number) => {
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    const nextIndex = items.indexOf(current as HTMLButtonElement) + offset;
    items[(nextIndex + items.length) % items.length]?.focus();
  };

  const select = (value: DecisionPointWeight) => {
    onChange(value);
    setIsOpen(false);
    containerRef.current
      ?.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]')
      ?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative shrink-0", className)}
      onBlur={(event) => {
        // Tab でフォーカスが外へ出た場合も閉じる
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}（現在: ${selectedOption?.message ?? ""}）`}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className="flex h-9 w-full items-center justify-between gap-1 rounded-md border border-input bg-background px-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <DecisionPointImportanceIcon weight={selectedWeight} />
        <ChevronDownIcon
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          ref={listRef}
          role="listbox"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setIsOpen(false);
              return;
            }

            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(
                event.target as HTMLElement,
                event.key === "ArrowDown" ? 1 : -1,
              );
            }
          }}
          className="absolute left-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {DECISION_POINT_IMPORTANCE_OPTIONS.map((option) => {
            const isSelected = option.value === selectedWeight;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                // 選択肢は Tab 順に載せず、開いている間だけ矢印キーで移動する
                tabIndex={-1}
                onClick={() => select(option.value)}
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors focus-visible:outline-none",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted focus-visible:bg-muted",
                )}
              >
                <DecisionPointImportanceIcon
                  weight={option.value}
                  labelClassName="text-xs"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
