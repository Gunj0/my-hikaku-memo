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
import { Switch } from "@/components/ui/switch";
import {
  clampComparisonShortText,
  COMPARISON_SHORT_TEXT_MAX_LENGTH,
  normalizeComparisonDataToLimits,
} from "@/lib/comparison-limits";
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
  ArrowLeftIcon,
  BookMarkedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogInIcon,
  RotateCcwIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type MemoListResponse = {
  memos: ComparisonMemoSummary[];
};

type MemoDetailResponse = {
  memo: ComparisonMemo;
};

type DraftOwnerScope = `user:${string}` | "guest";

type PersistedComparisonDraft = {
  ownerScope: DraftOwnerScope;
  memoId: string | null;
  redirectTo: string;
  currentStep: number;
  data: ComparisonData;
  savedSnapshot: ComparisonData | null;
  activeMemo: ComparisonMemoSummary | null;
  memoTitle: string;
  memoIsPublic: boolean;
};

type DraftState = {
  currentStep: number;
  data: ComparisonData;
  savedSnapshot: ComparisonData | null;
  activeMemo: ComparisonMemoSummary | null;
  memoTitle: string;
  memoIsPublic: boolean;
};

const PERSISTED_DRAFT_STORAGE_KEY = "gadget-comparison-auth-draft";
const LOCAL_DRAFT_STORAGE_KEY_PREFIX = "gadget-comparison-local-draft";
const NEW_COMPARISON_DRAFT_ID = "__new__";
const COMPARISON_AUTH_REDIRECT_EVENT = "gadget-comparison:before-sign-in";
const AUTO_SAVE_INTERVAL_MS = 10_000;
const GUEST_DRAFT_OWNER_SCOPE = "guest" satisfies DraftOwnerScope;

function cloneComparisonData(data: ComparisonData): ComparisonData {
  return structuredClone(data);
}

function getDraftOwnerScope(userId?: string | null): DraftOwnerScope {
  return userId ? `user:${userId}` : GUEST_DRAFT_OWNER_SCOPE;
}

function getLocalDraftStorageKey(
  memoId: string | null,
  ownerScope: DraftOwnerScope,
) {
  return `${LOCAL_DRAFT_STORAGE_KEY_PREFIX}:${ownerScope}:${memoId ?? NEW_COMPARISON_DRAFT_ID}`;
}

function sanitizeDraftForGuest(
  draft: PersistedComparisonDraft | null,
  redirectTo: string,
  ownerScope: DraftOwnerScope | null,
) {
  if (
    !draft ||
    ownerScope !== GUEST_DRAFT_OWNER_SCOPE ||
    (!draft.memoId && !draft.activeMemo && !draft.savedSnapshot)
  ) {
    return draft;
  }

  return {
    ...draft,
    memoId: null,
    redirectTo,
    savedSnapshot: null,
    activeMemo: null,
  } satisfies PersistedComparisonDraft;
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
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ComparisonData>(() =>
    createInitialComparisonData(),
  );
  const [savedSnapshot, setSavedSnapshot] = useState<ComparisonData | null>(
    null,
  );
  const [activeMemo, setActiveMemo] = useState<ComparisonMemoSummary | null>(
    null,
  );
  const [savedMemos, setSavedMemos] = useState<ComparisonMemoSummary[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isLoadingMemoId, setIsLoadingMemoId] = useState<string | null>(null);
  const [isDeletingMemoId, setIsDeletingMemoId] = useState<string | null>(null);
  const [hasResolvedDraftRestore, setHasResolvedDraftRestore] = useState(false);
  const latestDraftRef = useRef<PersistedComparisonDraft | null>(null);

  const isAuthenticated = status === "authenticated";
  const isAuthLoading = status === "loading";
  const importantPointsCount = data.decisionPoints.filter(
    (point) => point.isImportant,
  ).length;
  const progressPercent = Math.round((currentStep / STEPS.length) * 100);
  const redirectTo = (() => {
    const query = searchParams.toString();

    return query ? `${pathname}?${query}` : pathname;
  })();
  const hasValidSelectedProduct = data.products.some(
    (product) => product.id === data.selectedProductId,
  );

  const currentMemoId = activeMemo?.id ?? initialMemoId ?? null;
  const localDraftMemoId = currentMemoId;
  const currentDraftOwnerScope =
    status === "loading" ? null : getDraftOwnerScope(session?.user?.id);
  const localDraftStorageKey = currentDraftOwnerScope
    ? getLocalDraftStorageKey(localDraftMemoId, currentDraftOwnerScope)
    : null;

  const replaceEditorUrl = (memoId: string | null) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (memoId) {
      nextSearchParams.set("memoId", memoId);
    } else {
      nextSearchParams.delete("memoId");
    }

    const nextQuery = nextSearchParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  };

  const persistDraftForAuthRedirect = () => {
    if (typeof window === "undefined") {
      return;
    }

    const draft = buildDraft();

    if (!draft) {
      window.sessionStorage.removeItem(PERSISTED_DRAFT_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(
      PERSISTED_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  };

  const buildDraft = (
    overrides: Partial<DraftState> = {},
  ): PersistedComparisonDraft | null => {
    const nextMemoId = overrides.activeMemo?.id ?? currentMemoId;
    const nextCurrentStep = overrides.currentStep ?? currentStep;
    const nextData = normalizeComparisonDataToLimits(overrides.data ?? data);
    const nextSavedSnapshotSource = overrides.savedSnapshot ?? savedSnapshot;
    const nextSavedSnapshot = nextSavedSnapshotSource
      ? normalizeComparisonDataToLimits(nextSavedSnapshotSource)
      : null;
    const nextActiveMemo = overrides.activeMemo ?? activeMemo;
    const nextMemoTitle = clampComparisonShortText(
      overrides.memoTitle ?? memoTitle,
    );
    const nextMemoIsPublic = overrides.memoIsPublic ?? memoIsPublic;
    const hasDraftContent =
      nextCurrentStep !== 1 ||
      hasMeaningfulComparisonData(nextData) ||
      nextSavedSnapshot !== null ||
      nextActiveMemo !== null ||
      nextMemoTitle.trim().length > 0;

    if (!hasDraftContent) {
      return null;
    }

    return {
      ownerScope: currentDraftOwnerScope ?? GUEST_DRAFT_OWNER_SCOPE,
      memoId: nextMemoId,
      redirectTo,
      currentStep: nextCurrentStep,
      data: cloneComparisonData(nextData),
      savedSnapshot: nextSavedSnapshot
        ? cloneComparisonData(nextSavedSnapshot)
        : null,
      activeMemo: nextActiveMemo,
      memoTitle: nextMemoTitle,
      memoIsPublic: nextMemoIsPublic,
    };
  };

  const persistDraftToLocal = (
    draftOverride?: PersistedComparisonDraft | null,
  ) => {
    if (
      typeof window === "undefined" ||
      !currentDraftOwnerScope ||
      !localDraftStorageKey
    ) {
      return;
    }

    const draft = draftOverride ?? latestDraftRef.current;
    const storageKey = draft
      ? getLocalDraftStorageKey(draft.memoId, currentDraftOwnerScope)
      : localDraftStorageKey;

    if (!draft) {
      window.localStorage.removeItem(localDraftStorageKey);
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...draft,
        ownerScope: currentDraftOwnerScope,
      } satisfies PersistedComparisonDraft),
    );
  };

  const canProceed = () => {
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
    latestDraftRef.current = buildDraft();
  }, [
    activeMemo,
    currentStep,
    data,
    memoIsPublic,
    memoTitle,
    redirectTo,
    savedSnapshot,
  ]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      status === "loading" ||
      !currentDraftOwnerScope ||
      !localDraftStorageKey
    ) {
      return;
    }

    const rawSessionDraft = window.sessionStorage.getItem(
      PERSISTED_DRAFT_STORAGE_KEY,
    );
    const rawLocalDraft = window.localStorage.getItem(localDraftStorageKey);

    const parseDraft = (
      rawDraft: string | null,
      options?: {
        expectedMemoId?: string | null;
        expectedOwnerScope?: DraftOwnerScope;
        allowMissingOwnerScope?: boolean;
      },
    ): PersistedComparisonDraft | null => {
      if (!rawDraft) {
        return null;
      }

      try {
        const draft = JSON.parse(rawDraft) as Partial<PersistedComparisonDraft>;

        if (
          draft.redirectTo !== redirectTo ||
          !draft.data ||
          typeof draft.currentStep !== "number" ||
          (options?.expectedMemoId !== undefined &&
            (draft.memoId ?? null) !== options.expectedMemoId)
        ) {
          return null;
        }

        if (
          options?.expectedOwnerScope &&
          draft.ownerScope !== options.expectedOwnerScope &&
          !(options.allowMissingOwnerScope && draft.ownerScope === undefined)
        ) {
          return null;
        }

        return {
          ownerScope:
            draft.ownerScope === undefined
              ? GUEST_DRAFT_OWNER_SCOPE
              : draft.ownerScope,
          memoId: draft.memoId ?? null,
          redirectTo: draft.redirectTo,
          currentStep: draft.currentStep,
          data: draft.data,
          savedSnapshot: draft.savedSnapshot ?? null,
          activeMemo: draft.activeMemo ?? null,
          memoTitle: draft.memoTitle ?? "",
          memoIsPublic: Boolean(draft.memoIsPublic),
        };
      } catch {
        return null;
      }
    };

    const sessionDraft = sanitizeDraftForGuest(
      parseDraft(rawSessionDraft),
      redirectTo,
      currentDraftOwnerScope,
    );
    const localDraft = sanitizeDraftForGuest(
      parseDraft(rawLocalDraft, {
        expectedMemoId: initialMemoId ?? null,
        expectedOwnerScope: currentDraftOwnerScope,
      }),
      redirectTo,
      currentDraftOwnerScope,
    );
    const draft = sessionDraft ?? localDraft;

    if (!draft) {
      setHasResolvedDraftRestore(true);
      return;
    }

    try {
      const normalizedDraftData = normalizeComparisonDataToLimits(draft.data);
      const normalizedSavedSnapshot = draft.savedSnapshot
        ? normalizeComparisonDataToLimits(draft.savedSnapshot)
        : null;

      setData(cloneComparisonData(normalizedDraftData));
      setSavedSnapshot(
        normalizedSavedSnapshot
          ? cloneComparisonData(normalizedSavedSnapshot)
          : null,
      );
      setActiveMemo(draft.activeMemo ?? null);
      setCurrentStep(Math.min(Math.max(draft.currentStep, 1), STEPS.length));
      setMemoTitle(clampComparisonShortText(draft.memoTitle ?? ""));
      setMemoIsPublic(Boolean(draft.memoIsPublic));
      if (draft.memoId) {
        const nextSearchParams = new URLSearchParams(searchParams.toString());

        nextSearchParams.set("memoId", draft.memoId);

        const nextQuery = nextSearchParams.toString();
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        const currentQuery = searchParams.toString();
        const currentUrl = currentQuery
          ? `${pathname}?${currentQuery}`
          : pathname;

        if (nextUrl !== currentUrl) {
          router.replace(nextUrl, { scroll: false });
        }
      }
      if (sessionDraft) {
        window.sessionStorage.removeItem(PERSISTED_DRAFT_STORAGE_KEY);
        window.localStorage.setItem(
          getLocalDraftStorageKey(sessionDraft.memoId, currentDraftOwnerScope),
          JSON.stringify({
            ...sessionDraft,
            data: normalizedDraftData,
            ownerScope: currentDraftOwnerScope,
            savedSnapshot: normalizedSavedSnapshot,
            memoTitle: clampComparisonShortText(sessionDraft.memoTitle),
          } satisfies PersistedComparisonDraft),
        );
        toast.success("ログイン後に編集中の内容を復元しました。");
      } else {
        toast.success("自動保存した内容を復元しました。");
      }
    } catch {
      window.sessionStorage.removeItem(PERSISTED_DRAFT_STORAGE_KEY);
      window.localStorage.removeItem(localDraftStorageKey);
    } finally {
      setHasResolvedDraftRestore(true);
    }
  }, [
    currentDraftOwnerScope,
    initialMemoId,
    localDraftStorageKey,
    pathname,
    redirectTo,
    router,
    searchParams,
    status,
  ]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !currentDraftOwnerScope ||
      !localDraftStorageKey
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      persistDraftToLocal();
    }, AUTO_SAVE_INTERVAL_MS);

    const handlePageHide = () => {
      persistDraftToLocal();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [currentDraftOwnerScope, localDraftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePersistDraftRequest = () => {
      persistDraftForAuthRedirect();
    };

    window.addEventListener(
      COMPARISON_AUTH_REDIRECT_EVENT,
      handlePersistDraftRequest,
    );

    return () => {
      window.removeEventListener(
        COMPARISON_AUTH_REDIRECT_EVENT,
        handlePersistDraftRequest,
      );
    };
  }, [
    activeMemo,
    currentStep,
    data,
    memoIsPublic,
    memoTitle,
    redirectTo,
    savedSnapshot,
  ]);

  useEffect(() => {
    if (isLibraryDialogOpen && isAuthenticated) {
      void refreshSavedMemos();
    }
  }, [isAuthenticated, isLibraryDialogOpen]);

  useEffect(() => {
    if (!hasResolvedDraftRestore) {
      return;
    }

    if (!initialMemoId) {
      return;
    }

    if (status === "unauthenticated") {
      setIsAuthDialogOpen(true);
      return;
    }

    if (
      status === "authenticated" &&
      activeMemo?.id !== initialMemoId &&
      isLoadingMemoId !== initialMemoId
    ) {
      void loadMemoById(initialMemoId, { skipConfirm: true });
    }
  }, [
    activeMemo?.id,
    hasResolvedDraftRestore,
    initialMemoId,
    isLoadingMemoId,
    status,
  ]);

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed()) {
      const nextStep = currentStep + 1;

      persistDraftToLocal(buildDraft({ currentStep: nextStep }));
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const nextStep = currentStep - 1;

      persistDraftToLocal(buildDraft({ currentStep: nextStep }));
      setCurrentStep(nextStep);
    }
  };

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
      setMemoTitle("");
      setMemoIsPublic(false);
    }
  };

  const handleSignIn = async () => {
    persistDraftForAuthRedirect();
    await signIn("google", { redirectTo });
  };

  const loadMemoById = async (
    memoId: string,
    options?: {
      skipConfirm?: boolean;
      onLoaded?: () => void;
    },
  ) => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (
      !options?.skipConfirm &&
      activeMemo?.id !== memoId &&
      hasMeaningfulComparisonData(data) &&
      !confirm("現在の編集中内容を保存せずに置き換えます。よろしいですか？")
    ) {
      return;
    }

    setIsLoadingMemoId(memoId);

    try {
      const response = await fetch(`/api/memos/${memoId}`, {
        cache: "no-store",
      });
      const { memo } = await readResponse<MemoDetailResponse>(response);
      const summary = {
        id: memo.id,
        title: memo.title,
        category: memo.category,
        isPublic: memo.isPublic,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
      } satisfies ComparisonMemoSummary;
      const restoredData = cloneComparisonData(memo.data);
      const restoredStep = getInitialStepForComparisonData(memo.data);

      persistDraftToLocal(
        buildDraft({
          currentStep: restoredStep,
          data: restoredData,
          savedSnapshot: restoredData,
          activeMemo: summary,
          memoTitle: memo.title,
          memoIsPublic: memo.isPublic,
        }),
      );
      setData(restoredData);
      setSavedSnapshot(cloneComparisonData(memo.data));
      setCurrentStep(restoredStep);
      setActiveMemo(summary);
      setMemoTitle(memo.title);
      setMemoIsPublic(memo.isPublic);
      replaceEditorUrl(summary.id);
      options?.onLoaded?.();
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

    const previousLocalDraftStorageKey = localDraftStorageKey;
    const wasCreatingNewMemo = !activeMemo;

    setIsSaving(true);

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
    await loadMemoById(memoSummary.id, {
      onLoaded: () => setIsLibraryDialogOpen(false),
    });
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
        if (currentDraftOwnerScope) {
          window.localStorage.removeItem(
            getLocalDraftStorageKey(memoSummary.id, currentDraftOwnerScope),
          );
        }
        setActiveMemo(null);
        replaceEditorUrl(null);
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
    setData((prev) =>
      normalizeComparisonDataToLimits({ ...prev, [key]: value }),
    );
  };

  const updateProducts = (products: ComparisonData["products"]) => {
    setData((prev) => {
      const hasDeletion = products.length < prev.products.length;

      return normalizeComparisonDataToLimits({
        ...prev,
        products,
        selectedProductId:
          hasDeletion && prev.selectedProductId ? null : prev.selectedProductId,
      });
    });
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
                onChange={(event) =>
                  setMemoTitle(clampComparisonShortText(event.target.value))
                }
                placeholder="例: ノートPC買い替え比較"
                maxLength={COMPARISON_SHORT_TEXT_MAX_LENGTH}
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
                onCheckedChange={setMemoIsPublic}
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

      <Dialog open={isLibraryDialogOpen} onOpenChange={setIsLibraryDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>あなたの比較メモ一覧から複製する</DialogTitle>
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
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">
                              {memo.title}
                            </CardTitle>
                            <CardDescription>
                              カテゴリ: {memo.category || "未設定"} / 更新:{" "}
                              {new Date(memo.updatedAt).toLocaleString("ja-JP")}
                            </CardDescription>
                          </div>
                          <span className="rounded-full border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground">
                            {memo.isPublic ? "公開" : "非公開"}
                          </span>
                        </div>
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
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/82 backdrop-blur-md">
          <div className="mx-auto px-4 py-3">
            <div className="mb-3 grid gap-3 grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Link href="/memos" className="flex items-center">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    戻る
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
                  元に戻す
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenLibrary}
                  disabled={isAuthLoading}
                >
                  <BookMarkedIcon className="w-4 h-4 mr-1" />
                  複製する
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

        <main className="flex-1">
          <div className="mx-auto grid gap-4 px-4 py-4 lg:items-start">
            <section className="min-w-0 rounded-lg border border-border/80 bg-card/74 p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.02),0_20px_40px_rgb(0_0_0/0.2)] md:p-5">
              {renderStep()}
            </section>
          </div>
        </main>

        <footer className="sticky bottom-0 border-t border-border/80 bg-background/82 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-card/72 px-3 py-3">
              <Button
                variant="outline"
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
        </footer>
      </div>
    </>
  );
}
