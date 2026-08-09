"use client";

import {
  clampComparisonShortText,
  normalizeComparisonDataToLimits,
} from "@/lib/comparison-limits";
import {
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
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

export type EditorStatus = {
  tone: "success" | "error";
  message: string;
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

type UseComparisonDraftOptions = {
  initialMemoId?: string;
  onRequireAuth: () => void;
};

export function useComparisonDraft({
  initialMemoId,
  onRequireAuth,
}: UseComparisonDraftOptions) {
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
  const [memoTitle, setMemoTitle] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [hasResolvedDraftRestore, setHasResolvedDraftRestore] = useState(false);
  const [editorStatus, setEditorStatus] = useState<EditorStatus | null>(null);

  const latestDraftRef = useRef<PersistedComparisonDraft | null>(null);
  const autoLoadAttemptedForRef = useRef<string | null>(null);

  const isAuthenticated = status === "authenticated";
  const isAuthLoading = status === "loading";
  const redirectTo = (() => {
    const query = searchParams.toString();

    return query ? `${pathname}?${query}` : pathname;
  })();

  const currentMemoId = activeMemo?.id ?? initialMemoId ?? null;
  const currentDraftOwnerScope =
    status === "loading" ? null : getDraftOwnerScope(session?.user?.id);
  const localDraftStorageKey = currentDraftOwnerScope
    ? getLocalDraftStorageKey(currentMemoId, currentDraftOwnerScope)
    : null;

  // 最新の state / 依存値を ref にミラーし、永続化系の関数を安定化させる。
  // これにより effect 依存に関数をそのまま列挙でき、再登録の暴発を防げる。
  const snapshotRef = useRef({
    currentStep,
    data,
    savedSnapshot,
    activeMemo,
    memoTitle,
    memoIsPublic,
    currentMemoId,
    redirectTo,
    currentDraftOwnerScope,
    localDraftStorageKey,
    isAuthenticated,
    pathname,
    router,
    searchParams,
  });
  useEffect(() => {
    snapshotRef.current = {
      currentStep,
      data,
      savedSnapshot,
      activeMemo,
      memoTitle,
      memoIsPublic,
      currentMemoId,
      redirectTo,
      currentDraftOwnerScope,
      localDraftStorageKey,
      isAuthenticated,
      pathname,
      router,
      searchParams,
    };
  });

  const buildDraft = useCallback(
    (overrides: Partial<DraftState> = {}): PersistedComparisonDraft | null => {
      const snapshot = snapshotRef.current;
      const nextMemoId = overrides.activeMemo?.id ?? snapshot.currentMemoId;
      const nextCurrentStep = overrides.currentStep ?? snapshot.currentStep;
      const nextData = normalizeComparisonDataToLimits(
        overrides.data ?? snapshot.data,
      );
      const nextSavedSnapshotSource =
        overrides.savedSnapshot ?? snapshot.savedSnapshot;
      const nextSavedSnapshot = nextSavedSnapshotSource
        ? normalizeComparisonDataToLimits(nextSavedSnapshotSource)
        : null;
      const nextActiveMemo = overrides.activeMemo ?? snapshot.activeMemo;
      const nextMemoTitle = clampComparisonShortText(
        overrides.memoTitle ?? snapshot.memoTitle,
      );
      const nextMemoIsPublic = overrides.memoIsPublic ?? snapshot.memoIsPublic;
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
        ownerScope: snapshot.currentDraftOwnerScope ?? GUEST_DRAFT_OWNER_SCOPE,
        memoId: nextMemoId,
        redirectTo: snapshot.redirectTo,
        currentStep: nextCurrentStep,
        data: cloneComparisonData(nextData),
        savedSnapshot: nextSavedSnapshot
          ? cloneComparisonData(nextSavedSnapshot)
          : null,
        activeMemo: nextActiveMemo,
        memoTitle: nextMemoTitle,
        memoIsPublic: nextMemoIsPublic,
      };
    },
    [],
  );

  const persistDraftToLocal = useCallback(
    (draftOverride?: PersistedComparisonDraft | null) => {
      const snapshot = snapshotRef.current;

      if (
        typeof window === "undefined" ||
        !snapshot.currentDraftOwnerScope ||
        !snapshot.localDraftStorageKey
      ) {
        return;
      }

      const draft = draftOverride ?? latestDraftRef.current;
      const storageKey = draft
        ? getLocalDraftStorageKey(
            draft.memoId,
            snapshot.currentDraftOwnerScope,
          )
        : snapshot.localDraftStorageKey;

      if (!draft) {
        window.localStorage.removeItem(snapshot.localDraftStorageKey);
        return;
      }

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...draft,
          ownerScope: snapshot.currentDraftOwnerScope,
        } satisfies PersistedComparisonDraft),
      );
    },
    [],
  );

  const persistDraftForAuthRedirect = useCallback(() => {
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
  }, [buildDraft]);

  const replaceEditorUrl = useCallback((memoId: string | null) => {
    const { pathname, router, searchParams } = snapshotRef.current;
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
  }, []);

  useEffect(() => {
    latestDraftRef.current = buildDraft();
  }, [
    activeMemo,
    buildDraft,
    currentStep,
    data,
    memoIsPublic,
    memoTitle,
    redirectTo,
    savedSnapshot,
  ]);

  /* eslint-disable react-hooks/set-state-in-effect -- localStorage からの復元はハイドレーション後にしか実行できない */
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
        setEditorStatus({
          tone: "success",
          message: "ログイン後に編集中の内容を復元しました。",
        });
      } else {
        setEditorStatus({
          tone: "success",
          message: "自動保存した内容を復元しました。",
        });
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
  /* eslint-enable react-hooks/set-state-in-effect */

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
  }, [currentDraftOwnerScope, localDraftStorageKey, persistDraftToLocal]);

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
  }, [persistDraftForAuthRedirect]);

  const loadMemoById = useCallback(
    async (
      memoId: string,
      options?: {
        skipConfirm?: boolean;
      },
    ) => {
      const snapshot = snapshotRef.current;

      if (!snapshot.isAuthenticated) {
        onRequireAuth();
        return;
      }

      if (
        !options?.skipConfirm &&
        snapshot.activeMemo?.id !== memoId &&
        hasMeaningfulComparisonData(snapshot.data) &&
        !confirm("現在の編集中内容を保存せずに置き換えます。よろしいですか？")
      ) {
        return;
      }

      setEditorStatus(null);

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
        setEditorStatus({
          tone: "success",
          message: "保存済みメモを読み込みました。",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "保存済みメモを読み込めませんでした。";
        setEditorStatus({
          tone: "error",
          message,
        });

        if (message.includes("ログイン")) {
          onRequireAuth();
        }
      }
    },
    [buildDraft, onRequireAuth, persistDraftToLocal, replaceEditorUrl],
  );

  useEffect(() => {
    if (!hasResolvedDraftRestore) {
      return;
    }

    if (!initialMemoId) {
      return;
    }

    if (status === "unauthenticated") {
      onRequireAuth();
      return;
    }

    if (
      status === "authenticated" &&
      activeMemo?.id !== initialMemoId &&
      autoLoadAttemptedForRef.current !== initialMemoId
    ) {
      autoLoadAttemptedForRef.current = initialMemoId;
      void loadMemoById(initialMemoId, { skipConfirm: true });
    }
  }, [
    activeMemo?.id,
    hasResolvedDraftRestore,
    initialMemoId,
    loadMemoById,
    onRequireAuth,
    status,
  ]);

  return {
    // state
    currentStep,
    data,
    savedSnapshot,
    activeMemo,
    memoTitle,
    memoIsPublic,
    editorStatus,
    // derived
    isAuthenticated,
    isAuthLoading,
    redirectTo,
    localDraftStorageKey,
    // setters
    setCurrentStep,
    setData,
    setSavedSnapshot,
    setActiveMemo,
    setMemoTitle,
    setMemoIsPublic,
    setEditorStatus,
    // operations
    buildDraft,
    persistDraftToLocal,
    persistDraftForAuthRedirect,
    replaceEditorUrl,
  };
}
