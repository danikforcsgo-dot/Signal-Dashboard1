import { Router } from "express";
import { getBubbleWatchlist } from "../services/scanner";
import type { BubbleWatchlistEntry } from "../services/scanner";

const router = Router();

function formatVol(val: number): string {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return val.toFixed(0);
}

router.get("/", (_req, res) => {
  const all = getBubbleWatchlist();

  // "Silence" = coins that have been quiet for longest (daysSinceLastBig >= 3, not already building)
  const silence = [...all]
    .filter(e => e.daysSinceLastBig >= 3 && e.todayRatioPct < 80)
    .sort((a, b) => b.daysSinceLastBig - a.daysSinceLastBig || b.score - a.score)
    .slice(0, 15);

  // "Building" = today's volume already at 40–99% of P75 (approaching bubble threshold)
  const building = [...all]
    .filter(e => e.todayRatioPct >= 40 && e.todayRatioPct < 100)
    .sort((a, b) => b.todayRatioPct - a.todayRatioPct)
    .slice(0, 10);

  // Top 3 by composite score: ADR × volume × silence bonus
  const top3 = [...all]
    .filter(e => e.daysSinceLastBig >= 2)
    .slice(0, 3);

  res.json({ silence, building, top3, total: all.length });
});

export default router;
