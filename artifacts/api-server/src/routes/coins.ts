import { Router } from "express";
import { db } from "@workspace/db";
import { coinStatesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { getScannerState } from "../services/scanner";

const router = Router();

router.get("/", async (req, res) => {
  const coins = await db.select().from(coinStatesTable)
    .orderBy(desc(coinStatesTable.volume24h));

  const { lastScanAt } = getScannerState();

  res.json({
    coins,
    total: coins.length,
    lastScanAt: lastScanAt?.toISOString() ?? null,
  });
});

export default router;
