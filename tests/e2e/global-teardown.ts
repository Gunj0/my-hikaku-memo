import { cleanupTestUser } from "./support/test-user";

/**
 * 全テスト終了後にテストユーザーの行をローカル D1 から片付ける。
 *
 * setup 側でも消しているが、それだけだと「次の実行まで残る」ことになり、
 * テストが作った公開メモが開発中のホーム一覧や sitemap.xml に載ってしまう。
 *
 * プロジェクトの teardown ではなく globalTeardown にしているのは、
 * 前者が「そのプロジェクトと依存プロジェクト」の終了しか待たないため。
 * 未ログインのテスト（chromium）は setup に依存させていないので、
 * 実行中に公開メモを消してしまう可能性がある。
 */
export default function globalTeardown() {
  cleanupTestUser();
}
