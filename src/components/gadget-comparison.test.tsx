import { GadgetComparison } from "@/components/gadget-comparison";
import type { ComparisonMemo } from "@/lib/types";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

const mockRouterReplace = vi.fn();

type MockSessionState = {
  data: { user: { id: string } } | null;
  status: "authenticated" | "unauthenticated" | "loading";
};

const mockSessionState: MockSessionState = {
  data: null,
  status: "unauthenticated",
};

vi.mock("next-auth/react", () => ({
  useSession: () => mockSessionState,
  signIn: vi.fn(),
}));

const mockRouter = { replace: mockRouterReplace };
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/edit",
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

const NEW_DRAFT_LOCAL_KEY_PREFIX = "gadget-comparison-local-draft";

function guestLocalDraftKey(memoId: string | null = null) {
  return `${NEW_DRAFT_LOCAL_KEY_PREFIX}:guest:${memoId ?? "__new__"}`;
}

function userLocalDraftKey(userId: string, memoId: string | null = null) {
  return `${NEW_DRAFT_LOCAL_KEY_PREFIX}:user:${userId}:${memoId ?? "__new__"}`;
}

function readLocalDraft(key: string) {
  const raw = window.localStorage.getItem(key);

  return raw ? JSON.parse(raw) : null;
}

async function fillCategoryInput(value: string) {
  const input = await screen.findByLabelText("その他のカテゴリ");

  fireEvent.change(input, { target: { value } });

  return input;
}

const baseComparisonData = {
  category: "",
  categoryMemo: "",
  decisionPoints: [
    { id: "point-price", name: "価格", weight: 3, memo: "" },
    { id: "point-brand", name: "メーカー・ブランド", weight: 3, memo: "" },
  ],
  pointsMemo: "",
  products: [],
  productsMemo: "",
  scores: [],
  selectedProductId: null,
  decisionMemo: "",
};

describe("GadgetComparison", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockSessionState.data = null;
    mockSessionState.status = "unauthenticated";
    mockRouterReplace.mockClear();
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("ゲストがステップを進めると localStorage に draft を保存する", async () => {
    render(<GadgetComparison />);

    await fillCategoryInput("モバイルバッテリー");
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    await waitFor(() => {
      const draft = readLocalDraft(guestLocalDraftKey());

      expect(draft).toMatchObject({
        ownerScope: "guest",
        memoId: null,
        currentStep: 2,
        data: { category: "モバイルバッテリー" },
      });
    });
  });

  it("ゲストは保存済みメモ由来の draft でも元に戻すと初期状態にリセットされる", async () => {
    window.localStorage.setItem(
      guestLocalDraftKey(),
      JSON.stringify({
        ownerScope: "guest",
        memoId: "saved-memo",
        redirectTo: "/edit",
        currentStep: 1,
        data: { ...baseComparisonData, category: "編集中のカテゴリ" },
        savedSnapshot: { ...baseComparisonData, category: "保存済みカテゴリ" },
        activeMemo: {
          id: "saved-memo",
          title: "保存済みメモ",
          category: "保存済みカテゴリ",
          isPublic: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        memoTitle: "保存済みメモ",
        memoIsPublic: false,
      }),
    );

    render(<GadgetComparison />);

    await waitFor(() => {
      expect(screen.getByLabelText("その他のカテゴリ")).toHaveValue("");
    });
    expect(
      screen.getByRole("heading", { name: "何を比較する？" }),
    ).toBeInTheDocument();
  });

  it("認証済みユーザーは元に戻すと保存済みスナップショットの内容に戻る", async () => {
    mockSessionState.data = { user: { id: "user-1" } };
    mockSessionState.status = "authenticated";

    window.localStorage.setItem(
      userLocalDraftKey("user-1", "memo-1"),
      JSON.stringify({
        ownerScope: "user:user-1",
        memoId: "memo-1",
        redirectTo: "/edit",
        currentStep: 1,
        data: { ...baseComparisonData, category: "編集中のカテゴリ" },
        savedSnapshot: { ...baseComparisonData, category: "保存済みカテゴリ" },
        activeMemo: {
          id: "memo-1",
          title: "保存済みメモ",
          category: "保存済みカテゴリ",
          isPublic: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        memoTitle: "保存済みメモ",
        memoIsPublic: false,
      }),
    );

    render(<GadgetComparison initialMemoId="memo-1" />);

    const categoryInput = await screen.findByLabelText("その他のカテゴリ");
    await waitFor(() => expect(categoryInput).toHaveValue("編集中のカテゴリ"));

    // confirm() は beforeEach で true にモック済み
    fireEvent.click(screen.getByRole("button", { name: "元に戻す" }));

    // リセットで保存済みスナップショット（保存時点の内容）へ戻り、localStorage も同期される
    await waitFor(() => {
      const draft = readLocalDraft(userLocalDraftKey("user-1", "memo-1"));

      expect(draft?.data.category).toBe("保存済みカテゴリ");
    });
  });

  it("認証済みユーザーが新規保存すると POST し、旧ドラフトキーを削除する", async () => {
    mockSessionState.data = { user: { id: "user-1" } };
    mockSessionState.status = "authenticated";

    const savedMemo: ComparisonMemo = {
      id: "new-memo",
      title: "モバイルバッテリー の比較メモ",
      category: "モバイルバッテリー",
      isPublic: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      data: { ...baseComparisonData, category: "モバイルバッテリー" },
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ memo: savedMemo }),
    });

    render(<GadgetComparison />);

    await fillCategoryInput("モバイルバッテリー");
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    await waitFor(() => {
      expect(readLocalDraft(userLocalDraftKey("user-1"))).not.toBeNull();
    });

    // ヘッダーの保存ボタンで保存ダイアログを開く
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    const dialog = await screen.findByRole("dialog");

    fireEvent.click(within(dialog).getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/memos",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const [, requestInit] = (global.fetch as unknown as Mock).mock.calls[0];
    const body = JSON.parse(requestInit.body as string);

    expect(body).toMatchObject({
      title: "モバイルバッテリー の比較メモ",
      isPublic: false,
      data: { category: "モバイルバッテリー" },
    });

    // 新規作成時の __new__ ドラフトキーは保存成功後に削除される
    expect(readLocalDraft(userLocalDraftKey("user-1"))).toBeNull();
  });

  it("10秒ごとの自動保存タイマーで編集内容を localStorage へ保存する", async () => {
    // interval は render 時に登録されるため、fake timer は render 前に有効化する
    vi.useFakeTimers();

    render(<GadgetComparison />);

    const input = screen.getByLabelText("その他のカテゴリ");

    fireEvent.change(input, { target: { value: "モニター" } });

    expect(readLocalDraft(guestLocalDraftKey())).toBeNull();

    await vi.advanceTimersByTimeAsync(10_000);

    expect(readLocalDraft(guestLocalDraftKey())).toMatchObject({
      data: { category: "モニター" },
    });

    vi.useRealTimers();
  });

  it("pagehide イベントで編集内容を localStorage へ退避する", async () => {
    render(<GadgetComparison />);

    await fillCategoryInput("イヤホン");

    expect(readLocalDraft(guestLocalDraftKey())).toBeNull();

    fireEvent(window, new Event("pagehide"));

    expect(readLocalDraft(guestLocalDraftKey())).toMatchObject({
      data: { category: "イヤホン" },
    });
  });

  it("入力欄にフォーカスがないときは左右キーでステップを移動する", async () => {
    render(<GadgetComparison />);

    await fillCategoryInput("キーボード");
    screen.getByLabelText("その他のカテゴリ").blur();

    fireEvent.keyDown(document.body, { key: "ArrowRight" });

    await waitFor(() => {
      expect(readLocalDraft(guestLocalDraftKey())).toMatchObject({
        currentStep: 2,
      });
    });

    fireEvent.keyDown(document.body, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(readLocalDraft(guestLocalDraftKey())).toMatchObject({
        currentStep: 1,
      });
    });
  });

  it("入力欄にフォーカスがあるときは左右キーでステップを移動しない", async () => {
    render(<GadgetComparison />);

    const input = await screen.findByLabelText("その他のカテゴリ");

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });

    expect(readLocalDraft(guestLocalDraftKey())).toBeNull();
    expect(screen.getByLabelText("その他のカテゴリ")).toBeInTheDocument();
  });

  it("横スワイプでステップを移動する", async () => {
    const { container } = render(<GadgetComparison />);
    const main = container.querySelector("main");

    if (!main) {
      throw new Error("main 要素が見つかりません");
    }

    // 空の状態でステップ1に戻ると draft が破棄されるため、内容を入れておく
    await fillCategoryInput("スマートウォッチ");

    fireEvent.touchStart(main, {
      touches: [{ clientX: 240, clientY: 200 }],
    });
    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 60, clientY: 210 }],
    });

    await waitFor(() => {
      expect(readLocalDraft(guestLocalDraftKey())).toMatchObject({
        currentStep: 2,
      });
    });

    fireEvent.touchStart(main, {
      touches: [{ clientX: 60, clientY: 200 }],
    });
    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 240, clientY: 210 }],
    });

    await waitFor(() => {
      expect(readLocalDraft(guestLocalDraftKey())).toMatchObject({
        currentStep: 1,
      });
    });
  });

  it("縦方向の動きが大きいスワイプではステップを移動しない", () => {
    const { container } = render(<GadgetComparison />);
    const main = container.querySelector("main");

    if (!main) {
      throw new Error("main 要素が見つかりません");
    }

    fireEvent.touchStart(main, {
      touches: [{ clientX: 240, clientY: 100 }],
    });
    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 160, clientY: 400 }],
    });

    expect(readLocalDraft(guestLocalDraftKey())).toBeNull();
  });
});
