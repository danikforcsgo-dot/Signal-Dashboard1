import { Router } from "express";
import { db } from "@workspace/db";
import { signalsTable } from "@workspace/db";
import { desc, count, sql, eq, gte } from "drizzle-orm";
import { GetSignalsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = GetSignalsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [signals, totalResult] = await Promise.all([
    db.select().from(signalsTable)
      .where(gte(signalsTable.sentAt, todayStart))
      .orderBy(desc(signalsTable.sentAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(signalsTable)
      .where(gte(signalsTable.sentAt, todayStart)),
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
