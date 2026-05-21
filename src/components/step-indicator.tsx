"use client";

import { STEPS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav className="w-full" aria-label="進捗状況">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-colors",
                isCurrent && "bg-primary text-primary-foreground",
                isComplete && "bg-secondary text-secondary-foreground",
                !isCurrent && !isComplete && "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                  isCurrent && "bg-primary-foreground text-primary",
                  isComplete && "bg-primary text-primary-foreground",
                  !isCurrent &&
                    !isComplete &&
                    "bg-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isComplete ? <CheckIcon className="w-4 h-4" /> : step.id}
              </span>
              {step.shortTitle}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
