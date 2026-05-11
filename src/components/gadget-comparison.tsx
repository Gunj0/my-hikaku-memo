"use client";

import { StepIndicator } from "@/components/step-indicator";
import { CategoryStep } from "@/components/steps/category-step";
import { DecisionStep } from "@/components/steps/decision-step";
import { EvaluationStep } from "@/components/steps/evaluation-step";
import { PointsStep } from "@/components/steps/points-step";
import { ProductsStep } from "@/components/steps/products-step";
import { SummaryStep } from "@/components/steps/summary-step";
import { Button } from "@/components/ui/button";
import { ComparisonData, DEFAULT_DECISION_POINTS, STEPS } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "react";

const initialData: ComparisonData = {
  category: "",
  categoryMemo: "",
  decisionPoints: DEFAULT_DECISION_POINTS.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
  })),
  pointsMemo: "",
  products: [],
  productsMemo: "",
  scores: [],
  selectedProductId: null,
  decisionMemo: "",
};

export function GadgetComparison() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ComparisonData>(initialData);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.category.trim().length > 0;
      case 2:
        return (
          data.decisionPoints.length > 0 &&
          data.decisionPoints.some((p) => p.isImportant)
        );
      case 3:
        return data.products.length >= 2;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleReset = () => {
    if (confirm("すべての入力内容がリセットされます。よろしいですか？")) {
      setData({
        ...initialData,
        decisionPoints: DEFAULT_DECISION_POINTS.map((p) => ({
          ...p,
          id: crypto.randomUUID(),
        })),
      });
      setCurrentStep(1);
    }
  };

  const updateData = <K extends keyof ComparisonData>(
    key: K,
    value: ComparisonData[K],
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CategoryStep
            category={data.category}
            categoryMemo={data.categoryMemo}
            onCategoryChange={(category) => updateData("category", category)}
            onMemoChange={(memo) => updateData("categoryMemo", memo)}
          />
        );
      case 2:
        return (
          <PointsStep
            decisionPoints={data.decisionPoints}
            pointsMemo={data.pointsMemo}
            onPointsChange={(points) => updateData("decisionPoints", points)}
            onMemoChange={(memo) => updateData("pointsMemo", memo)}
          />
        );
      case 3:
        return (
          <ProductsStep
            products={data.products}
            productsMemo={data.productsMemo}
            onProductsChange={(products) => updateData("products", products)}
            onMemoChange={(memo) => updateData("productsMemo", memo)}
          />
        );
      case 4:
        return (
          <EvaluationStep
            products={data.products}
            decisionPoints={data.decisionPoints}
            scores={data.scores}
            onScoresChange={(scores) => updateData("scores", scores)}
          />
        );
      case 5:
        return (
          <SummaryStep
            products={data.products}
            decisionPoints={data.decisionPoints}
            scores={data.scores}
          />
        );
      case 6:
        return (
          <DecisionStep
            products={data.products}
            decisionPoints={data.decisionPoints}
            scores={data.scores}
            selectedProductId={data.selectedProductId}
            decisionMemo={data.decisionMemo}
            onSelectProduct={(id) => updateData("selectedProductId", id)}
            onMemoChange={(memo) => updateData("decisionMemo", memo)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">
              オレの比較メモ
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <RotateCcwIcon className="w-4 h-4 mr-1" />
              リセット
            </Button>
          </div>
          <StepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">{renderStep()}</div>
      </main>

      {/* Footer navigation */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              戻る
            </Button>

            <div className="hidden sm:block text-sm text-muted-foreground">
              {currentStep} / {STEPS.length}
            </div>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 sm:flex-none"
              >
                次へ
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="default"
                className="flex-1 sm:flex-none"
                disabled={!data.selectedProductId}
              >
                完了
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
