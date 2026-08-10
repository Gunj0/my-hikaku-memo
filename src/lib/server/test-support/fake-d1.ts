/**
 * ユニットテスト用の最小 D1 スタブ。
 *
 * 実行された SQL とバインド値を記録し、応答は呼び出し側が SQL の内容で決める。
 * 「どの文が発行されたか」を検証したいテスト向けで、SQL の意味は解釈しない。
 */

export type ExecutedStatement = {
  sql: string;
  bindings: unknown[];
};

export type FakeD1Response = {
  /** run() が返す meta.changes。 */
  changes?: number;
  /** run() が返す meta.last_row_id。 */
  lastRowId?: number;
  /** first() が返す行。 */
  first?: unknown;
  /** all() が返す results。 */
  all?: unknown[];
};

export function createFakeD1Database(
  respond: (sql: string, bindings: unknown[]) => FakeD1Response,
) {
  const executed: ExecutedStatement[] = [];

  function buildStatement(sql: string, bindings: unknown[]) {
    const response = respond(sql, bindings);

    return {
      run: async () => ({
        meta: {
          changes: response.changes ?? 0,
          last_row_id: response.lastRowId ?? 0,
        },
      }),
      first: async () => response.first ?? null,
      all: async () => ({ results: response.all ?? [] }),
    };
  }

  const database = {
    prepare(sql: string) {
      return {
        bind(...bindings: unknown[]) {
          executed.push({ sql, bindings });

          return buildStatement(sql, bindings);
        },
        // bind せずに実行する経路。
        run: async () => {
          executed.push({ sql, bindings: [] });

          return buildStatement(sql, []).run();
        },
        first: async () => {
          executed.push({ sql, bindings: [] });

          return buildStatement(sql, []).first();
        },
        all: async () => {
          executed.push({ sql, bindings: [] });

          return buildStatement(sql, []).all();
        },
      };
    },
  } as unknown as D1Database;

  return { database, executed };
}

/** 記録された文のうち、指定した語をすべて含む最初のものを返す。 */
export function findStatement(
  executed: ExecutedStatement[],
  ...fragments: string[]
) {
  return executed.find((statement) =>
    fragments.every((fragment) => statement.sql.includes(fragment)),
  );
}
