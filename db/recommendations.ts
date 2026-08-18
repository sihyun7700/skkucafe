import { env } from "cloudflare:workers";

let schemaReady: Promise<unknown> | null = null;

export async function getRecommendationsDb() {
  if (!env.DB) throw new Error("추천 저장소를 사용할 수 없습니다.");

  schemaReady ??= env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS recommendations (
      cafe_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (cafe_id, voter_id)
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_recommendations_cafe_id ON recommendations (cafe_id)"),
  ]);

  await schemaReady;
  return env.DB;
}
