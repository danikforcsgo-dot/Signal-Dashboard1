import { pgTable, serial, text, real, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signalsTable = pgTable("signals", {
  id: serial("id").primaryKey(),
  instId: text("inst_id").notNull(),
  symbol: text("symbol").notNull(),
  signalType: text("signal_type").notNull(),
  adrPct: real("adr_pct").notNull(),
  price: real("price").notNull(),
  adrLevel: real("adr_level").notNull(),
  progressPct: real("progress_pct").notNull(),
  volume24h: real("volume_24h").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  telegramMsgId: integer("telegram_msg_id"),
  silenceDays: integer("silence_days"), // days of silence before signal fired; null = coin was not in silence watchlist
});

export const insertSignalSchema = createInsertSchema(signalsTable).omit({ id: true, sentAt: true });
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signalsTable.$inferSelect;

export const coinStatesTable = pgTable("coin_states", {
  instId: text("inst_id").primaryKey(),
  symbol: text("symbol").notNull(),
  adrPct: real("adr_pct").notNull(),
  adrHighLevel: real("adr_high_level").notNull(),
  adrLowLevel: real("adr_low_level").notNull(),
  currentPrice: real("current_price").notNull(),
  progressToHigh: real("progress_to_high").notNull(),
  progressToLow: real("progress_to_low").notNull(),
  volume24h: real("volume_24h").notNull(),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow().notNull(),
  signalSentHigh: boolean("signal_sent_high").default(false).notNull(),
  signalSentLow: boolean("signal_sent_low").default(false).notNull(),
  signalSentHighAt: timestamp("signal_sent_high_at", { withTimezone: true }),
  signalSentLowAt: timestamp("signal_sent_low_at", { withTimezone: true }),
});

export const insertCoinStateSchema = createInsertSchema(coinStatesTable);
export type InsertCoinState = z.infer<typeof insertCoinStateSchema>;
export type CoinState = typeof coinStatesTable.$inferSelect;
