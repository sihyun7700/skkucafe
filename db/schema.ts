import { sql } from "drizzle-orm";
import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const recommendations = sqliteTable("recommendations", {
  cafeId: text("cafe_id").notNull(),
  voterId: text("voter_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [
  primaryKey({columns:[table.cafeId,table.voterId]}),
  index("idx_recommendations_cafe_id").on(table.cafeId),
]);
