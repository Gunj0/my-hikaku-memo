import {
  createFakeD1Database,
  findStatement,
} from "@/lib/server/test-support/fake-d1";
import {
  USERNAME_TAKEN,
  updateUserProfileRecord,
} from "@/lib/server/user-profiles";
import { describe, expect, it } from "vitest";

const USER_ID = "11111111-2222-3333-4444-555555555555";

const USER_ROW = {
  id: USER_ID,
  name: "たろう",
  username: "taro-yamada",
  profile_initialized: 1,
};

function isUpdate(sql: string) {
  return sql.includes("UPDATE users");
}

describe("updateUserProfileRecord", () => {
  it("表示名と username を 1 本の UPDATE で適用する", async () => {
    const { database, executed } = createFakeD1Database((sql) =>
      isUpdate(sql) ? { changes: 1 } : { first: USER_ROW },
    );

    const profile = await updateUserProfileRecord(database, USER_ID, {
      name: "たろう",
      username: "taro-yamada",
    });

    const updates = executed.filter((statement) => isUpdate(statement.sql));

    // 2 本に分けると片方だけ適用される中途半端な状態が生まれる。
    expect(updates).toHaveLength(1);
    expect(updates[0].sql).toContain("name = ?");
    expect(updates[0].sql).toContain("username = ?");
    expect(profile).toMatchObject({ id: USER_ID, username: "taro-yamada" });
  });

  it("username を変える場合は重複チェックを同じ文の条件に含める", async () => {
    const { database, executed } = createFakeD1Database((sql) =>
      isUpdate(sql) ? { changes: 1 } : { first: USER_ROW },
    );

    await updateUserProfileRecord(database, USER_ID, {
      username: "taro-yamada",
    });

    const update = findStatement(executed, "UPDATE users");

    expect(update?.sql).toContain("NOT EXISTS");
    expect(update?.sql).toContain("COLLATE NOCASE");
  });

  it("表示名だけの更新では username に触れない", async () => {
    const { database, executed } = createFakeD1Database((sql) =>
      isUpdate(sql) ? { changes: 1 } : { first: USER_ROW },
    );

    await updateUserProfileRecord(database, USER_ID, { name: "じろう" });

    const update = findStatement(executed, "UPDATE users");

    expect(update?.sql).toContain("name = ?");
    expect(update?.sql).not.toContain("username = ?");
    // username を変えないので重複チェックも不要。
    expect(update?.sql).not.toContain("NOT EXISTS");
  });

  it("username が他ユーザーに使われていれば USERNAME_TAKEN を返す", async () => {
    // UPDATE は 0 行、ユーザー行自体は存在する。
    const { database } = createFakeD1Database((sql) =>
      isUpdate(sql) ? { changes: 0 } : { first: USER_ROW },
    );

    const result = await updateUserProfileRecord(database, USER_ID, {
      username: "taken-name",
    });

    expect(result).toBe(USERNAME_TAKEN);
  });

  it("対象ユーザーが存在しなければ null を返す", async () => {
    // UPDATE は 0 行、ユーザー行も無い。
    const { database } = createFakeD1Database((sql) =>
      isUpdate(sql) ? { changes: 0 } : { first: null },
    );

    const result = await updateUserProfileRecord(database, USER_ID, {
      username: "taro-yamada",
    });

    expect(result).toBeNull();
  });
});
