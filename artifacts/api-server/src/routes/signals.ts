import { Router } from "express";
import { db } from "@workspace/db";
import { signalsTable } from "@workspace/db";
import { desc, count, sql, eq, gte, inArray, and, or } from "drizzle-orm";
import { GetSignalsQueryParams } from "@workspace/api-zod";

const router = Router();

const ADR_TYPES    = ["ADR_HIGH", "ADR_LOW"] as const;
const VOL_TYPES    = ["VOL_BREAKOUT_HIGH", "VOL_BREAKOUT_LOW", "VOL_SPIKE_UP", "VOL_SPIKE_DOWN"] as const;
const BUBBLE_TYPES = [
  "VOL_BUBBLE_SMALL_BUY",  "VOL_BUBBLE_SMALL_SELL",
  "VOL_BUBBLE_MEDIUM_BUY", "VOL_BUBBLE_MEDIUM_SELL",
  "VOL_BUBBLE_BIG_BUY",    "VOL_BUBBLE_BIG_SELL",
] as const;
const BIG_VOL_THRESHOLD = 20; // show old vol signals in feed only when ratio ≥ 20x

router.get("/", async (req, res) => {
  const parsed = GetSignalsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;
  const feedMode = req.query.onlyAdr === "true"; // "onlyAdr" now means "feed mode"

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const baseWhere = feedMode
    ? and(
        gte(signalsTable.sentAt, todayStart),
        or(
          inArray(signalsTable.signalType, [...ADR_TYPES]),
          inArray(signalsTable.signalType, [...BUBBLE_TYPES]),
          and(
            inArray(signalsTable.signalType, [...VOL_TYPES]),
            gte(signalsTable.progressPct, BIG_VOL_THRESHOLD)
          )
        )
      )
    : gte(signalsTable.sentAt, todayStart);

  const [signals, totalResult] = await Promise.all([
    db.select().from(signalsTable)
      .where(baseWhere)
      .orderBy(desc(signalsTable.sentAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(signalsTable)
      .where(baseWhere),
  ]);

  res.json({ signals, total: totalResult[0]?.count ?? 0 });
});

router.get("/stats", async (req, res) => {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [totalResult, todayResult, highResult, lowResult, topCoinsResult] = await Promise.all([
    db.select({ count: count() }).from(signalsTable),
    db.select({ count: count() }).from(signalsTable).where(gte(signalsTable.sentAt, todayStart)),
    db.select({ count: count() }).from(signalsTable).where(eq(signalsTable.signalType, "ADR_HIGH")),
    db.select({ count: count() }).from(signalsTable).where(eq(signalsTable.signalType, "ADR_LOW")),
    db.select({
      symbol: signalsTable.symbol,
      count: count(),
    }).from(signalsTable)
      .groupBy(signalsTable.symbol)
      .orderBy(desc(count()))
      .limit(5),
  ]);

  res.json({
    totalSignals: totalResult[0]?.count ?? 0,
    signalsToday: todayResult[0]?.count ?? 0,
    signalsHigh: highResult[0]?.count ?? 0,
    signalsLow: lowResult[0]?.count ?? 0,
    topCoins: topCoinsResult,
  });
});

export default router;
