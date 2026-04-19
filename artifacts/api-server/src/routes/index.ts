import { Router, type IRouter } from "express";
import healthRouter from "./health";
import signalsRouter from "./signals";
import coinsRouter from "./coins";
import statusRouter from "./status";
import watchlistRouter from "./watchlist";
import gainersRouter from "./gainers";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/signals", signalsRouter);
router.use("/coins", coinsRouter);
router.use("/bubble-watchlist", watchlistRouter);
router.use("/gainers", gainersRouter);
router.use(statusRouter);

export default router;
