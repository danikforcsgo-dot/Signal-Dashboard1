import { Router } from "express";
import { getScannerState, startScanner, stopScanner, performDailyReset, SCAN_INTERVAL_SECONDS } from "../services/scanner";
import { isOkxConnected } from "../services/okx";
import { isTelegramConnected, sendTestMessage } from "../services/telegram";

const router = Router();

router.get("/status", (req, res) => {
  const state = getScannerState();
  res.json({
    botRunning: state.botRunning,
    scanIntervalSeconds: SCAN_INTERVAL_SECONDS,
    lastScanAt: state.lastScanAt?.toISOString() ?? null,
    nextScanAt: state.nextScanAt?.toISOString() ?? null,
    totalCoinsMonitored: state.totalCoinsMonitored,
    okxConnected: isOkxConnected(),
    telegramConnected: isTelegramConnected(),
    scanCount: state.scanCount,
    errorCount: state.errorCount,
    lastError: state.lastError ?? null,
  });
});

router.post("/bot/start", async (req, res) => {
  const state = getScannerState();
  if (state.botRunning) {
    res.json({ success: false, message: "Bot is already running" });
    return;
  }
  startScanner().catch(err => req.log.error({ err }, "Scanner error"));
  res.json({ success: true, message: "Bot started" });
});

router.post("/bot/stop", (req, res) => {
  const state = getScannerState();
  if (!state.botRunning) {
    res.json({ success: false, message: "Bot is not running" });
    return;
  }
  stopScanner();
  res.json({ success: true, message: "Bot stopped" });
});

router.post("/bot/test", async (req, res) => {
  const ok = await sendTestMessage();
  res.json({
    success: ok,
    message: ok ? "Test message sent successfully" : "Failed to send test message",
  });
});

router.post("/bot/reset", (req, res) => {
  performDailyReset();
  res.json({ success: true, message: "Daily state reset completed" });
});

export default router;
