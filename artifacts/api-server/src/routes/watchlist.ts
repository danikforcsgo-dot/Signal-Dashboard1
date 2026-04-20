import { Router } from "express";
import { getBubbleWatchlist } from "../services/scanner";

const router = Router();

router.get("/", (_req, res) => {
  const all = getBubbleWatchlist();

  // "Silence" = coins quiet for longest (daysSinceLastBig >= 3, today vol < P75)
  const silence = [...all]
    .filter(e => e.daysSinceLastBig >= 3 && e.todayRatioPct < 100)
    .sort((a, b) => b.daysSinceLastBig - a.daysSinceLastBig || b.score - a.score)
    .slice(0, 30);

  res.json({ silence, total: all.length });
});

export default router;
