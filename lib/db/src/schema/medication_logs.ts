import { pgTable, serial, text, timestamp, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicationLogsTable = pgTable(
  "medication_logs",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    status: text("status", { enum: ["taken", "skipped"] }).notNull(),
    loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("medication_logs_date_unique").on(table.date)],
);

export const insertMedicationLogSchema = createInsertSchema(medicationLogsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogsTable.$inferSelect;
