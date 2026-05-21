"use client";

import { StepIndicator } from "@/components/step-indicator";
import { CategoryStep } from "@/components/steps/category-step";
import { DecisionStep } from "@/components/steps/decision-step";
import { EvaluationStep } from "@/components/steps/evaluation-step";
import { PointsStep } from "@/components/steps/points-step";
import { ProductsStep } from "@/components/steps/products-step";
import { SummaryStep } from "@/components/steps/summary-step";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  buildComparisonMemoTitle,
  createInitialComparisonData,
  getInitialStepForComparisonData,
  hasMeaningfulComparisonData,
} from "@/lib/comparison-state";
import type {
  ComparisonData,
  ComparisonMemo,
  ComparisonMemoSummary,
} from "@/lib/types";
import { STEPS } from "@/lib/types";
import {
  BookMarkedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogInIcon,
  RotateCcwIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MemoListResponse = {
  memos: ComparisonMemoSummary[];
};

type MemoDetailResponse = {
  memo: ComparisonMemo;
};

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

export function GadgetComparison() {
  const { status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ComparisonData>(() =>
    createInitialComparisonData(),
  );
  const [activeMemo, setActiveMemo] = useState<ComparisonMemoSummary | null>(
    null,
  );
  const [savedMemos, setSavedMemos] = useState<ComparisonMemoSummary[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isLoadingMemoId, setIsLoadingMemoId] = useState<string | null>(null);
  const [isDeletingMemoId, setIsDeletingMemoId] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated";
  const isAuthLoading = status === "loading";

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

  const refreshSavedMemos = async () => {
    if (!isAuthenticated) {
      setSavedMemos([]);
      return;
    }

    setIsLibraryLoading(true);

    try {
      const response = await fetch("/api/memos", { cache: "no-store" });
      const { memos } = await readResponse<MemoListResponse>(response);
      setSavedMemos(memos);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "保存済みメモを取得できませんでした。";

      toast.error(message);

      if (message.includes("ログイン")) {
        setIsAuthDialogOpen(true);
      }
    } finally {
      setIsLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (isLibraryDialogOpen && isAuthenticated) {
      void refreshSavedMemos();
    }
  }, [isAuthenticated, isLibraryDialogOpen]);

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
    setCurrentStep(step);
  };

  const handleReset = () => {
    if (confirm("すべての入力内容がリセットされます。よろしいですか？")) {
      setData(createInitialComparisonData());
      setCurrentStep(1);
      setActiveMemo(null);
    }
  };

  const handleSignIn = async () => {
    await signIn("google", { redirectTo: "/" });
  };

  const handleOpenSaveDialog = () => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    setMemoTitle(activeMemo?.title ?? buildComparisonMemoTitle(data));
    setIsSaveDialogOpen(true);
  };

  const handleOpenLibrary = () => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    setIsLibraryDialogOpen(true);
  };

  const saveMemo = async (mode: "create" | "update") => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (mode === "update" && !activeMemo) {
      return saveMemo("create");
    }

    setIsSaving(true);

    try {
      const title = memoTitle.trim() || buildComparisonMemoTitle(data);
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
            data,
          }),
        },
      );
      const { memo } = await readResponse<MemoDetailResponse>(response);
      const summary = {
        id: memo.id,
        title: memo.title,
        category: memo.category,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      } satisfies ComparisonMemoSummary;

      setActiveMemo(summary);
      setMemoTitle(summary.title);
      setIsSaveDialogOpen(false);
      await refreshSavedMemos();
      toast.success(
        mode === "update" ? "メモを更新しました。" : "メモを保存しました。",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "メモを保存できませんでした。";
      toast.error(message);

      if (message.includes("ログイン")) {
        setIsAuthDialogOpen(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadMemo = async (memoSummary: ComparisonMemoSummary) => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (
      activeMemo?.id !== memoSummary.id &&
      hasMeaningfulComparisonData(data) &&
      !confirm("現在の編集中内容を保存せずに置き換えます。よろしいですか？")
    ) {
      return;
    }

    setIsLoadingMemoId(memoSummary.id);

    try {
      const response = await fetch(`/api/memos/${memoSummary.id}`, {
        cache: "no-store",
      });
      const { memo } = await readResponse<MemoDetailResponse>(response);

      setData(memo.data);
      setCurrentStep(getInitialStepForComparisonData(memo.data));
      setActiveMemo({
        id: memo.id,
        title: memo.title,
        category: memo.category,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      });
      setIsLibraryDialogOpen(false);
      toast.success("保存済みメモを読み込みました。");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "保存済みメモを読み込めませんでした。";
      toast.error(message);

      if (message.includes("ログイン")) {
        setIsAuthDialogOpen(true);
      }
    } finally {
      setIsLoadingMemoId(null);
    }
  };

  const handleDeleteMemo = async (memoSummary: ComparisonMemoSummary) => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (!confirm(`「${memoSummary.title}」を削除します。よろしいですか？`)) {
      return;
    }

    setIsDeletingMemoId(memoSummary.id);

    try {
      const response = await fetch(`/api/memos/${memoSummary.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        await readResponse(response);
      }

      setSavedMemos((prev) =>
        prev.filter((memo) => memo.id !== memoSummary.id),
      );

      if (activeMemo?.id === memoSummary.id) {
        setActiveMemo(null);
      }

      toast.success("保存済みメモを削除しました。");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "保存済みメモを削除できませんでした。";
      toast.error(message);

      if (message.includes("ログイン")) {
        setIsAuthDialogOpen(true);
      }
    } finally {
      setIsDeletingMemoId(null);
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
    <>
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存機能の利用にはログインが必要です</DialogTitle>
            <DialogDescription>
              比較フローの閲覧と編集はそのまま続けられます。保存済みメモの作成、読込、削除を利用するときだけ
              Google ログインしてください。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAuthDialogOpen(false)}
            >
              あとで
            </Button>
            <Button onClick={() => void handleSignIn()}>
              <LogInIcon className="w-4 h-4" />
              Googleでログイン
            </Button>
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
                onChange={(event) => setMemoTitle(event.target.value)}
                placeholder="例: ノートPC買い替え比較"
                maxLength={120}
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
                variant="outline"
                onClick={() => void saveMemo("create")}
                disabled={isSaving}
              >
                {isSaving ? <Spinner /> : <SaveIcon className="w-4 h-4" />}
                新規保存
              </Button>
            ) : null}
            <Button
              onClick={() => void saveMemo(activeMemo ? "update" : "create")}
              disabled={isSaving}
            >
              {isSaving ? <Spinner /> : <SaveIcon className="w-4 h-4" />}
              {activeMemo ? "上書き保存" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLibraryDialogOpen} onOpenChange={setIsLibraryDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>保存済みメモ</DialogTitle>
            <DialogDescription>
              ログイン中のアカウントに保存された比較メモを管理します。
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {isLibraryLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Spinner className="mr-2" />
                読み込み中...
              </div>
            ) : savedMemos.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>保存済みメモはまだありません</CardTitle>
                  <CardDescription>
                    比較内容を保存すると、ここからいつでも再開できます。
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedMemos.map((memo) => {
                  const isLoading = isLoadingMemoId === memo.id;
                  const isDeleting = isDeletingMemoId === memo.id;

                  return (
                    <Card key={memo.id}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {memo.title}
                        </CardTitle>
                        <CardDescription>
                          カテゴリ: {memo.category || "未設定"} / 更新:{" "}
                          {new Date(memo.updatedAt).toLocaleString("ja-JP")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => void handleLoadMemo(memo)}
                          disabled={isLoading || isDeleting}
                        >
                          {isLoading ? (
                            <Spinner />
                          ) : (
                            <BookMarkedIcon className="w-4 h-4" />
                          )}
                          読み込む
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => void handleDeleteMemo(memo)}
                          disabled={isLoading || isDeleting}
                        >
                          {isDeleting ? (
                            <Spinner />
                          ) : (
                            <Trash2Icon className="w-4 h-4" />
                          )}
                          削除
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-dvh flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {activeMemo
                      ? `編集中: ${activeMemo.title}`
                      : "比較フローはログインなしで使えます。保存するときだけ Google ログインが必要です。"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSaveDialog}
                    disabled={isAuthLoading}
                  >
                    <SaveIcon className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenLibrary}
                    disabled={isAuthLoading}
                  >
                    <BookMarkedIcon className="w-4 h-4 mr-1" />
                    保存済みメモ
                  </Button>
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
              </div>
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
    </>
  );
}
