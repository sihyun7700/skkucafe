import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<unknown> | null = null;

function connectionString() {
  const value = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!value) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  return value;
}

async function getSql() {
  const sql = neon(connectionString());
  schemaReady ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS recommendations (
      cafe_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (cafe_id, voter_id)
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recommendations_cafe_id ON recommendations (cafe_id)`;
  })();
  await schemaReady;
  return sql;
}

export async function getRecommendationStatus(cafe: string, voterId: string | null) {
  const sql = await getSql();
  const totals = (await sql`SELECT COUNT(*)::int AS count FROM recommendations WHERE cafe_id = ${cafe}`) as Array<{ count: number }>;
  const votes = voterId
    ? (await sql`SELECT 1 AS found FROM recommendations WHERE cafe_id = ${cafe} AND voter_id = ${voterId} LIMIT 1`) as Array<{ found: number }>
    : [];
  return {
    count: Number(totals[0]?.count ?? 0),
    recommended: Boolean(votes[0]?.found),
  };
}

export async function addRecommendation(cafe: string, voterId: string) {
  const sql = await getSql();
  await sql`INSERT INTO recommendations (cafe_id, voter_id) VALUES (${cafe}, ${voterId}) ON CONFLICT DO NOTHING`;
}

export async function removeRecommendation(cafe: string, voterId: string) {
  const sql = await getSql();
  await sql`DELETE FROM recommendations WHERE cafe_id = ${cafe} AND voter_id = ${voterId}`;
}
