import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * ローカル D1（miniflare の SQLite）へ直接 SQL を流すヘルパー。
 *
 * E2E のログイン状態は Google OAuth を経由せずに作る。Auth.js は
 * `session.strategy: "database"` なので、sessions テーブルの行と
 * それを指すセッション Cookie さえあればログイン済みとして扱われる。
 */

// wrangler は cwd の wrangler.jsonc を読むため、リポジトリルートで実行する。
// Playwright はテストファイルを CJS へ変換するので __dirname を使える。
const repositoryRoot = path.resolve(__dirname, "../../..");

/** wrangler.jsonc の d1_databases[].database_name と一致させること。 */
const DATABASE_NAME = "my-hikaku-memo-db";

export function executeLocalD1(statements: string[]) {
  // wrangler は `;` 区切りの複数文をまとめて実行できる。
  // 1 文ずつ呼ぶと wrangler の起動コストがそのまま積み上がるため、まとめて渡す。
  const sql = statements.map((statement) => statement.trim()).join(";\n");

  try {
    execFileSync(
      "pnpm",
      [
        "exec",
        "wrangler",
        "d1",
        "execute",
        DATABASE_NAME,
        "--local",
        "--command",
        sql,
      ],
      {
        cwd: repositoryRoot,
        stdio: "pipe",
        env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
      },
    );
  } catch (error) {
    const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
    const stdout = (error as { stdout?: Buffer }).stdout?.toString() ?? "";

    throw new Error(
      `ローカル D1 への SQL 実行に失敗しました。\n--- SQL ---\n${sql}\n--- stdout ---\n${stdout}\n--- stderr ---\n${stderr}`,
    );
  }
}

/** SQL リテラル用のエスケープ。テストデータに `'` が混ざっても壊れないようにする。 */
export function toSqlText(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}
