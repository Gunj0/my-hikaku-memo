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
      {/* Mobile: horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:hidden scrollbar-hide">
        {STEPS.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(step.id)}
              disabled={step.id > currentStep}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-colors",
                isCurrent && "bg-primary text-primary-foreground",
                isComplete && "bg-secondary text-secondary-foreground",
                !isCurrent && !isComplete && "bg-muted text-muted-foreground",
                step.id > currentStep && "opacity-50 cursor-not-allowed",
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

      {/* Desktop: full width steps */}
      <div className="hidden md:flex items-center gap-2">
        {STEPS.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => onStepClick?.(step.id)}
                disabled={step.id > currentStep}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all",
                  isCurrent && "bg-primary/10 ring-1 ring-primary",
                  isComplete && "bg-secondary hover:bg-secondary/80",
                  !isCurrent && !isComplete && "bg-muted",
                  step.id > currentStep && "opacity-50 cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                    isCurrent && "bg-primary text-primary-foreground",
                    isComplete && "bg-primary text-primary-foreground",
                    !isCurrent &&
                      !isComplete &&
                      "bg-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {isComplete ? <CheckIcon className="w-5 h-5" /> : step.id}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-foreground",
                    isComplete && "text-secondary-foreground",
                    !isCurrent && !isComplete && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-1",
                    currentStep > step.id ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
