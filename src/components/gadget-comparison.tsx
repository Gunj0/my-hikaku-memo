"use client";

import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { LengthCounter } from "@/components/length-counter";
import { StepIndicator } from "@/components/step-indicator";
import { CategoryStep } from "@/components/steps/category-step";
import { DecisionStep } from "@/components/steps/decision-step";
import { EvaluationStep } from "@/components/steps/evaluation-step";
import { PointsStep } from "@/components/steps/points-step";
import { ProductsStep } from "@/components/steps/products-step";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineNotice } from "@/components/ui/inline-notice";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useComparisonDraft } from "@/hooks/use-comparison-draft";
import { useStepGestureNavigation } from "@/hooks/use-step-gesture-navigation";
import {
  clampComparisonShortText,
  COMPARISON_SHORT_TEXT_MAX_LENGTH,
  normalizeComparisonDataToLimits,
} from "@/lib/comparison-limits";
import {
  buildComparisonMemoTitle,
  createInitialComparisonData,
  getInitialStepForComparisonData,
} from "@/lib/comparison-state";
import type {
  ComparisonData,
  ComparisonMemo,
  ComparisonMemoSummary,
} from "@/lib/types";
import { STEPS } from "@/lib/types";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useState } from "react";

type MemoDetailResponse = {
  memo: ComparisonMemo;
};

function cloneComparisonData(data: ComparisonData): ComparisonData {
  return structuredClone(data);
}

async function readResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : "リクエストに失敗しました。",
    );
  }

  return json as T;
}

type GadgetComparisonProps = {
  initialMemoId?: string;
};

export function GadgetComparison({ initialMemoId }: GadgetComparisonProps) {
  const { data: session } = useSession();
  // username はセッション経由で受け取る。未ログイン・取得前はホームへ逃がす。
  const memoListHref = session?.user?.username
    ? `/${session.user.username}`
    : "/";
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openAuthDialog = useCallback(() => {
    setIsAuthDialogOpen(true);
  }, []);

  const {
    currentStep,
    data,
    savedSnapshot,
    activeMemo,
    memoTitle,
    memoIsPublic,
    editorStatus,
    isAuthenticated,
    isAuthLoading,
    redirectTo,
    localDraftStorageKey,
    setCurrentStep,
    setData,
    setSavedSnapshot,
    setActiveMemo,
    setMemoTitle,
    setMemoIsPublic,
    setEditorStatus,
    buildDraft,
    persistDraftToLocal,
    persistDraftForAuthRedirect,
    replaceEditorUrl,
  } = useComparisonDraft({ initialMemoId, onRequireAuth: openAuthDialog });

  const hasValidSelectedProduct = data.products.some(
    (product) => product.id === data.selectedProductId,
  );

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length && canProceed()) {
      const nextStep = currentStep + 1;

      persistDraftToLocal(buildDraft({ currentStep: nextStep }));
      setCurrentStep(nextStep);
    }
  }, [
    buildDraft,
    canProceed,
    currentStep,
    persistDraftToLocal,
    setCurrentStep,
  ]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      const nextStep = currentStep - 1;

      persistDraftToLocal(buildDraft({ currentStep: nextStep }));
      setCurrentStep(nextStep);
    }
  }, [buildDraft, currentStep, persistDraftToLocal, setCurrentStep]);

  const stepGestureHandlers = useStepGestureNavigation({
    onPrev: handlePrev,
    onNext: handleNext,
    enabled: !isSaveDialogOpen && !isAuthDialogOpen,
  });

  const handleStepClick = (step: number) => {
    persistDraftToLocal(buildDraft({ currentStep: step }));
    setCurrentStep(step);
  };

  const handleReset = () => {
    if (confirm("最後に手動で保存した内容に戻ります。よろしいですか？")) {
      if (activeMemo && savedSnapshot) {
        const restoredData = cloneComparisonData(savedSnapshot);
        const restoredStep = getInitialStepForComparisonData(restoredData);

        persistDraftToLocal(
          buildDraft({
            currentStep: restoredStep,
            data: restoredData,
            savedSnapshot: restoredData,
            activeMemo,
            memoTitle: activeMemo.title,
            memoIsPublic: activeMemo.isPublic,
          }),
        );
        setData(restoredData);
        setCurrentStep(restoredStep);
        setMemoTitle(activeMemo.title);
        setMemoIsPublic(activeMemo.isPublic);
        return;
      }

      persistDraftToLocal(null);
      setData(createInitialComparisonData());
      setCurrentStep(1);
      setSavedSnapshot(null);
      setActiveMemo(null);
      setMemoTitle("");
      setMemoIsPublic(false);
      replaceEditorUrl(null);
    }
  };

  const handleSignIn = async () => {
    persistDraftForAuthRedirect();
    await signIn("google", { redirectTo });
  };

  const handleOpenSaveDialog = () => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    setMemoTitle(
      clampComparisonShortText(
        activeMemo?.title ?? buildComparisonMemoTitle(data),
      ),
    );
    setMemoIsPublic(activeMemo?.isPublic ?? false);
    setIsSaveDialogOpen(true);
  };

  const saveMemo = async (mode: "create" | "update") => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (mode === "update" && !activeMemo) {
      return saveMemo("create");
    }

    const previousLocalDraftStorageKey = localDraftStorageKey;
    const wasCreatingNewMemo = !activeMemo;

    setIsSaving(true);
    setEditorStatus(null);

    try {
      const normalizedData = normalizeComparisonDataToLimits(data);
      const title =
        clampComparisonShortText(memoTitle).trim() ||
        clampComparisonShortText(buildComparisonMemoTitle(normalizedData));
      const response = await fetch(
        mode === "update" && activeMemo
          ? `/api/memos/${activeMemo.id}`
          : "/api/memos",
        {
          method: mode === "update" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            data: normalizedData,
            isPublic: memoIsPublic,
          }),
        },
      );
      const { memo } = await readResponse<MemoDetailResponse>(response);
      const summary = {
        id: memo.id,
        title: memo.title,
        category: memo.category,
        isPublic: memo.isPublic,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      } satisfies ComparisonMemoSummary;
      const persistedDraft = buildDraft({
        data: memo.data,
        savedSnapshot: memo.data,
        activeMemo: summary,
        memoTitle: summary.title,
        memoIsPublic: summary.isPublic,
      });

      setActiveMemo(summary);
      setSavedSnapshot(cloneComparisonData(memo.data));
      setMemoTitle(summary.title);
      setMemoIsPublic(summary.isPublic);
      persistDraftToLocal(persistedDraft);
      replaceEditorUrl(summary.id);
      if (wasCreatingNewMemo && previousLocalDraftStorageKey) {
        window.localStorage.removeItem(previousLocalDraftStorageKey);
      }
      setIsSaveDialogOpen(false);
      setEditorStatus({
        tone: "success",
        message:
          mode === "update" ? "メモを更新しました。" : "メモを保存しました。",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "メモを保存できませんでした。";
      setEditorStatus({
        tone: "error",
        message,
      });

      if (message.includes("ログイン")) {
        setIsAuthDialogOpen(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const clearEditorStatus = () => {
    setEditorStatus(null);
  };

  const updateData = <K extends keyof ComparisonData>(
    key: K,
    value: ComparisonData[K],
  ) => {
    clearEditorStatus();
    setData((prev) =>
      normalizeComparisonDataToLimits({ ...prev, [key]: value }),
    );
  };

  const updateProducts = (products: ComparisonData["products"]) => {
    clearEditorStatus();
    setData((prev) => normalizeComparisonDataToLimits({ ...prev, products }));
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
            onProductsChange={updateProducts}
            onMemoChange={(memo) => updateData("productsMemo", memo)}
          />
        );
      case 4:
        return (
          <EvaluationStep
            products={data.products}
            decisionPoints={data.decisionPoints}
            scores={data.scores}
            onProductsChange={updateProducts}
            onDecisionPointsChange={(points) =>
              updateData("decisionPoints", points)
            }
            onScoresChange={(scores) => updateData("scores", scores)}
          />
        );
      case 5:
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
    <>
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存するためにはログインが必要です</DialogTitle>
            <DialogDescription>
              作成途中のメモ内容は、ログイン後に復元されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAuthDialogOpen(false)}
            >
              あとで
            </Button>
            <GoogleSignInButton
              onClick={() => void handleSignIn()}
              className="w-auto min-w-55"
            >
              Google でログイン
            </GoogleSignInButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>比較メモを保存</DialogTitle>
            <DialogDescription>
              現在の比較内容をあとから再開できるように保存します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="memo-title" className="text-sm font-medium">
                メモタイトル
              </label>
              <Input
                id="memo-title"
                value={memoTitle}
                onChange={(event) => {
                  clearEditorStatus();
                  setMemoTitle(clampComparisonShortText(event.target.value));
                }}
                placeholder="例: ノートPC買い替え比較"
                maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
              />
              <LengthCounter
                current={memoTitle.length}
                max={COMPARISON_SHORT_TEXT_MAX_LENGTH}
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 bg-background/40 p-3">
              <div className="space-y-1">
                <label
                  htmlFor="memo-visibility"
                  className="text-sm font-medium"
                >
                  公開設定
                </label>
                <p className="text-sm text-muted-foreground">
                  非公開のメモは自分のみ閲覧できます
                </p>
                <p className="text-xs text-muted-foreground">
                  現在: {memoIsPublic ? "公開" : "非公開"}
                </p>
              </div>
              <Switch
                id="memo-visibility"
                checked={memoIsPublic}
                onCheckedChange={(checked) => {
                  clearEditorStatus();
                  setMemoIsPublic(checked);
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              カテゴリ: {data.category.trim() || "未設定"}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              キャンセル
            </Button>
            {activeMemo ? (
              <Button
                variant="success"
                onClick={() => void saveMemo("create")}
                disabled={isSaving}
              >
                {isSaving ? <Spinner /> : <SaveIcon className="w-4 h-4" />}
                新規保存
              </Button>
            ) : null}
            <Button
              variant="success"
              onClick={() => void saveMemo(activeMemo ? "update" : "create")}
              disabled={isSaving}
            >
              {isSaving ? <Spinner /> : <SaveIcon className="w-4 h-4" />}
              {activeMemo ? "上書き保存" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-dvh flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/82 backdrop-blur-md mx-4">
          <div className="max-w-6xl mx-auto py-3">
            <div className="mb-3 grid gap-3 grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Link href={memoListHref} className="flex items-center">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    メモ一覧
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground"
                >
                  <RotateCcwIcon className="w-4 h-4 mr-1" />
                  <p className="hidden sm:block">元に戻す</p>
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleOpenSaveDialog}
                  disabled={isAuthLoading}
                >
                  <SaveIcon className="w-4 h-4 mr-1" />
                  保存
                </Button>
              </div>
            </div>

            <StepIndicator
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>
        </header>

        <main className="flex-1" {...stepGestureHandlers}>
          <div className="mx-auto grid gap-4 px-4 py-4 lg:items-start">
            <section className="min-w-0 rounded-lg bg-card/74 p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.02),0_20px_40px_rgb(0_0_0/0.2)] md:p-5">
              {renderStep()}
            </section>
          </div>
        </main>

        <footer className="sticky bottom-0 bg-background/82 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="space-y-3">
              {editorStatus ? (
                <InlineNotice
                  tone={editorStatus.tone}
                  message={editorStatus.message}
                  onDismiss={() => setEditorStatus(null)}
                />
              ) : null}
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-card/72 px-3 py-3">
                <Button
                  variant="secondary"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  戻る
                </Button>

                <div className="hidden text-xs tracking-[0.16em] text-muted-foreground uppercase sm:block">
                  {currentStep.toString().padStart(2, "0")} /{" "}
                  {STEPS.length.toString().padStart(2, "0")}
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
                    onClick={handleOpenSaveDialog}
                    variant="default"
                    className="flex-1 sm:flex-none"
                    disabled={!hasValidSelectedProduct || isAuthLoading}
                  >
                    保存
                  </Button>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
