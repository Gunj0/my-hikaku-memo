import { COMPARISON_MEMOS_MAX_COUNT_PER_USER } from "@/lib/comparison-limits";
import {
  createFakeD1Database,
  findStatement,
  type ExecutedStatement,
} from "@/lib/server/test-support/fake-d1";
import { beforeEach, describe, expect, it, vi } from "vitest";

let database: D1Database;
let executed: ExecutedStatement[];

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({ env: { DB: database } }),
}));

// プロフィール採番は本テストの対象外。DB を共有すると SQL の記録が混ざるため差し替える。
vi.mock("@/lib/server/user-profiles", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/user-profiles")>()),
  ensureUserProfile: vi.fn(async () => null),
}));

const { MEMO_LIMIT_REACHED, createComparisonMemo } = await import(
  "@/lib/server/comparison-memos"
);

const USER_ID = "11111111-2222-3333-4444-555555555555";

const PAYLOAD = {
  title: "イヤホン比較",
  isPublic: false,
  data: {
    category: "イヤホン",
    categoryMemo: "",
    decisionPoints: [],
    pointsMemo: "",
    products: [],
    productsMemo: "",
    scores: [],
    selectedProductId: null,
    decisionMemo: "",
  },
};

function isInsert(sql: string) {
  return sql.includes("INSERT INTO comparison_memos");
}

function setupDatabase(insertChanges: number) {
  const fake = createFakeD1Database((sql) => {
    if (isInsert(sql)) {
      return { changes: insertChanges, lastRowId: 7 };
    }

    // 作成後の再取得。
    return {
      first: {
        id: "memo-uuid",
        user_id: USER_ID,
        title: PAYLOAD.title,
        category: PAYLOAD.data.category,
        data: JSON.stringify(PAYLOAD.data),
        is_public: 0,
        public_id: 7,
        created_at: 1_700_000_000_000,
        updated_at: 1_700_000_000_000,
      },
    };
  });

  database = fake.database;
  executed = fake.executed;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createComparisonMemo の件数上限", () => {
  it("上限に達していなければ保存し、採番結果を last_row_id から取る", async () => {
    setupDatabase(1);

    const memo = await createComparisonMemo(USER_ID, PAYLOAD);

    expect(memo).toMatchObject({ id: "7", title: "イヤホン比較" });
  });

  it("上限判定を SQL の条件に埋め込み、上限値をバインドする", async () => {
    setupDatabase(1);

    await createComparisonMemo(USER_ID, PAYLOAD);

    const insert = findStatement(executed, "INSERT INTO comparison_memos");

    // 先に COUNT して分岐すると同時作成で上限を超えられるため、条件は SQL 側に置く。
    expect(insert?.sql).toContain("COUNT(*)");
    expect(insert?.bindings).toContain(COMPARISON_MEMOS_MAX_COUNT_PER_USER);
  });

  it("public_id を明示せず SQLite の採番に委ねる", async () => {
    setupDatabase(1);

    await createComparisonMemo(USER_ID, PAYLOAD);

    const insert = findStatement(executed, "INSERT INTO comparison_memos");

    // アプリ側で MAX(public_id)+1 を評価すると同時 INSERT で採番が衝突する。
    expect(insert?.sql).not.toContain("MAX(public_id)");
    expect(insert?.sql).not.toContain("public_id");
  });

  it("上限に達していれば MEMO_LIMIT_REACHED を返し、行を作らない", async () => {
    setupDatabase(0);

    const result = await createComparisonMemo(USER_ID, PAYLOAD);

    expect(result).toBe(MEMO_LIMIT_REACHED);
  });
});
