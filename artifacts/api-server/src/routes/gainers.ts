import { Router } from "express";
import { getGainers } from "../services/scanner";

const router = Router();

router.get("/", (_req, res) => {
  const gainers = getGainers();
  res.json({ gainers, total: gainers.length, updatedAt: gainers[0]?.updatedAt ?? null });
});

export default router;
