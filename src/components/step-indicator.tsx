"use client";

import { STEPS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav className="max-w-6xl mx-auto" aria-label="進捗状況">
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-border/80 bg-card/72 scrollbar-hide">
        {STEPS.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                "flex w-xl items-center gap-1 rounded-md border px-1 py-1 whitespace-nowrap text-xs tracking-[0.08em] transition-colors",
                isCurrent && "border-primary/60 bg-primary/16 text-foreground",
                isComplete &&
                  "border-border/70 bg-secondary/82 text-secondary-foreground",
                !isCurrent &&
                  !isComplete &&
                  "border-transparent bg-muted/65 text-muted-foreground hover:border-border/65 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-6 min-w-6 items-center justify-center rounded-sm border px-1 text-[10px] font-medium",
                  isCurrent &&
                    "border-primary/60 bg-primary text-primary-foreground",
                  isComplete &&
                    "border-border/70 bg-secondary text-secondary-foreground",
                  !isCurrent &&
                    !isComplete &&
                    "border-border/50 bg-background/60 text-muted-foreground",
                )}
              >
                {step.id.toString().padStart(2, "0")}
              </span>
              <span className="text-left">
                <span className="block leading-none text-foreground">
                  {step.shortTitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
