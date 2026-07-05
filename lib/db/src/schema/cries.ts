import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const criesTable = pgTable("cries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  intensity: integer("intensity").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes"),
  reason: text("reason"),
  location: text("location"),
  wasAlone: boolean("was_alone"),
  cryType: text("cry_type"),
  trigger: text("trigger"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCrySchema = createInsertSchema(criesTable).omit({ id: true, createdAt: true });
export type InsertCry = z.infer<typeof insertCrySchema>;
export type Cry = typeof criesTable.$inferSelect;
