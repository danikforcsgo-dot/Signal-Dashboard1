import { logger } from "../lib/logger";
import { db } from "@workspace/db";
import { signalsTable, coinStatesTable } from "@workspace/db";
import { fetchAllSwapTickers, fetchCoinADRData, fetchVolumeSpikeData, fetchVolumeBubbleData } from "./okx";
import { sendSignalMessage, sendVolumeSpikeMessage, sendVolumeBreakoutMessage, sendVolumeBubbleMessage } from "./telegram";
import { eq, sql } from "drizzle-orm";

export interface GainerEntry {
  instId: string;
  symbol: string;
  change24hPct: number;
  currentPrice: number;
  volume24h: number;
  updatedAt: string;
}

export interface BubbleWatchlistEntry {
  instId: string;
  symbol: string;
  adrPct: number;
  currentPrice: number;
  volume24h: number;
  progressToHigh: number;
  progressToLow: number;
  daysSinceLastBig: number;
  todayVolumeUsd: number;
  todayRatioPct: number;
  p75: number;
  score: number;
  updatedAt: string;
}

const SCAN_INTERVAL_MS = 60_000;
const SIGNAL_THRESHOLD = 95;
const MIN_VOLUME_USD = 200_000; // 200K USDT equivalent (volCcy24h × last price)
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;

// Instruments excluded from scanning
const EXCLUDED_INST_IDS = new Set([
  "NG-USDT-SWAP",    // Natural Gas
  "XAU-USDT-SWAP",   // Gold
  "XAG-USDT-SWAP",   // Silver
  "XCU-USDT-SWAP",   // Copper
  "XPT-USDT-SWAP",   // Platinum
  "XPD-USDT-SWAP",   // Palladium
  "AAPL-USDT-SWAP",  // Apple
  "AMD-USDT-SWAP",   // AMD
  "AMZN-USDT-SWAP",  // Amazon
  "COIN-USDT-SWAP",  // Coinbase stock
  "GOOGL-USDT-SWAP", // Google
  "HOOD-USDT-SWAP",  // Robinhood
  "INTC-USDT-SWAP",  // Intel
  "META-USDT-SWAP",  // Meta
  "MSFT-USDT-SWAP",  // Microsoft
  "MSTR-USDT-SWAP",  // MicroStrategy
  "MU-USDT-SWAP",    // Micron
  "NFLX-USDT-SWAP",  // Netflix
  "NVDA-USDT-SWAP",  // Nvidia
  "ORCL-USDT-SWAP",  // Oracle
  "PLTR-USDT-SWAP",  // Palantir
  "SNDK-USDT-SWAP",  // SanDisk
  "TSLA-USDT-SWAP",  // Tesla
  "TSM-USDT-SWAP",   // TSMC
  "SPY-USDT-SWAP",   // S&P 500 ETF
  "QQQ-USDT-SWAP",   // Nasdaq ETF
  "IWM-USDT-SWAP",   // Russell 2000 ETF
  "EWJ-USDT-SWAP",   // Japan ETF
  "EWY-USDT-SWAP",   // Korea ETF
  "USDC-USDT-SWAP",  // Stablecoin
  "CRCL-USDT-SWAP",  // Circle stock
  "CRWV-USDT-SWAP",  // CoreWeave stock
]);

// Volume spike thresholds
const VOL_SPIKE_THRESHOLD = 3.0;       // 3x average → pure spike alert
const VOL_BREAKOUT_THRESHOLD = 2.5;    // 2.5x + near ADR level → combo alert
const VOL_BREAKOUT_ADR_MIN = 65;       // price must be ≥65% of the way to ADR level
const VOL_SPIKE_COOLDOWN_MS = 30 * 60 * 1000; // 30 min cooldown per coin

// In-memory cooldown tracker (resets on server restart — acceptable)
const volSpikeCooldowns = new Map<string, number>();

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ScannerState {
  botRunning: boolean;
  lastScanAt: Date | null;
  nextScanAt: Date | null;
  totalCoinsMonitored: number;
  scanCount: number;
  errorCount: number;
  lastError: string | null;
}

const state: ScannerState = {
  botRunning: false,
  lastScanAt: null,
  nextScanAt: null,
  totalCoinsMonitored: 0,
  scanCount: 0,
  errorCount: 0,
  lastError: null,
};

// In-memory bubble watchlist — refreshed every scan cycle
const bubbleWatchlistMap = new Map<string, BubbleWatchlistEntry>();

export function getBubbleWatchlist(): BubbleWatchlistEntry[] {
  return [...bubbleWatchlistMap.values()].sort((a, b) => b.score - a.score);
}

// ── Bubble spam protection ────────────────────────────────────────────────────
// Cooldown per (instId + signalType): suppress re-fires for 60 min.
// Tier escalation (SMALL→MEDIUM, MEDIUM→BIG) always fires immediately —
// tracked separately via the last-fired tier map.
const BUBBLE_COOLDOWN_MS = 60 * 60 * 1000; // 60 minutes
const SIZE_ORDER: Record<string, number> = { SMALL: 1, MEDIUM: 2, BIG: 3 };

// key: instId → last signalType fired (e.g. "VOL_BUBBLE_SMALL_BUY")
const bubbleLastTierMap = new Map<string, string>();
// key: `${instId}|${signalType}` → timestamp of last fire
const bubbleCooldownMap = new Map<string, number>();

function isBubbleSuppressed(instId: string, signalType: string, bubbleSize: string): boolean {
  const lastType = bubbleLastTierMap.get(instId);
  // Always fire on first signal or tier escalation
  if (!lastType) return false;
  const lastSize = lastType.match(/SMALL|MEDIUM|BIG/)?.[0] ?? "SMALL";
  if ((SIZE_ORDER[bubbleSize] ?? 1) > (SIZE_ORDER[lastSize] ?? 1)) return false;
  // Same or lower tier: apply cooldown
  const key = `${instId}|${signalType}`;
  const lastFired = bubbleCooldownMap.get(key);
  if (!lastFired) return false;
  return Date.now() - lastFired < BUBBLE_COOLDOWN_MS;
}

function markBubbleFired(instId: string, signalType: string): void {
  bubbleLastTierMap.set(instId, signalType);
  bubbleCooldownMap.set(`${instId}|${signalType}`, Date.now());
}

// In-memory gainers list (≥+50% change over 24h) — refreshed every scan cycle
const gainersMap = new Map<string, GainerEntry>();

export function getGainers(): GainerEntry[] {
  return [...gainersMap.values()].sort((a, b) => b.change24hPct - a.change24hPct);
}

// ── Midnight UTC reset scheduler ─────────────────────────────────────────────
// Fires once at 00:00 UTC (= 03:00 MSK) to clear bubble bot daily state.
function getMsUntilNextMidnightUTC(): number {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
}

function scheduleMidnightReset(): void {
  const ms = getMsUntilNextMidnightUTC();
  logger.info({ msUntilReset: ms, hoursUntilReset: (ms / 3_600_000).toFixed(2) }, "Bubble bot midnight reset scheduled");
  setTimeout(() => {
    logger.info("Midnight UTC reset — clearing daily state");
    bubbleWatchlistMap.clear();
    gainersMap.clear();
    bubbleCooldownMap.clear();
    bubbleLastTierMap.clear();
    scheduleMidnightReset(); // schedule again for the next day
  }, ms);
}

let scanInterval: ReturnType<typeof setInterval> | null = null;

export function getScannerState(): ScannerState {
  return { ...state };
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function shouldResetSignals(lastSentAt: Date | null): boolean {
  if (!lastSentAt) return false;
  const now = new Date();
  const lastSentDay = new Date(lastSentAt);
  lastSentDay.setUTCHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  return today > lastSentDay;
}

function isVolSpikeCooledDown(instId: string): boolean {
  const last = volSpikeCooldowns.get(instId);
  if (!last) return true;
  return Date.now() - last > VOL_SPIKE_COOLDOWN_MS;
}

async function scanOnce(): Promise<void> {
  logger.info("Starting ADR scan");

  const tickers = await fetchAllSwapTickers();
  const filtered = tickers.filter(t => {
    if (EXCLUDED_INST_IDS.has(t.instId)) return false;
    const price = parseFloat(t.last || "0");
    const volBase = parseFloat(t.volCcy24h || t.vol24h || "0");
    const volUsd = volBase * price; // convert base-currency volume to USD equivalent
    return volUsd >= MIN_VOLUME_USD;
  });

  logger.info({ count: filtered.length }, "Coins to scan");
  state.totalCoinsMonitored = filtered.length;

  // ── Compute 24h gainers from tickers (no extra API calls needed) ───────────
  gainersMap.clear();
  const MIN_GAINER_CHANGE_PCT = 50;
  for (const t of tickers) {
    if (EXCLUDED_INST_IDS.has(t.instId)) continue;
    const last = parseFloat(t.last || "0");
    // sodUtc0 = open price at 00:00 UTC (03:00 МСК) — resets daily at midnight UTC
    const open = parseFloat(t.sodUtc0 || t.open24h || "0");
    if (last <= 0 || open <= 0) continue;
    const changePct = ((last - open) / open) * 100;
    if (changePct < MIN_GAINER_CHANGE_PCT) continue;
    const volBase = parseFloat(t.volCcy24h || t.vol24h || "0");
    const volume24h = volBase * last;
    gainersMap.set(t.instId, {
      instId: t.instId,
      symbol: t.instId.replace("-USDT-SWAP", "/USDT.P"),
      change24hPct: changePct,
      currentPrice: last,
      volume24h,
      updatedAt: new Date().toISOString(),
    });
  }
  logger.info({ count: gainersMap.size }, "Gainers ≥50% updated");

  const existingStates = await db.select().from(coinStatesTable);
  const stateMap = new Map(existingStates.map(s => [s.instId, s]));

  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async ticker => {
      try {
        const currentPrice = parseFloat(ticker.last);
        const volBase = parseFloat(ticker.volCcy24h || ticker.vol24h || "0");
        const volume24h = volBase * currentPrice; // USD equivalent

        // Fetch ADR, spike, and bubble data all in parallel
        const [adrData, spikeData, bubbleAnalysis] = await Promise.all([
          fetchCoinADRData(ticker.instId, currentPrice, volume24h),
          fetchVolumeSpikeData(ticker.instId, currentPrice, volume24h),
          fetchVolumeBubbleData(ticker.instId, currentPrice, volume24h),
        ]);
        const bubbleData = bubbleAnalysis?.bubble ?? null;

        // ── Collect watchlist entry ──────────────────────────────────────────
        if (bubbleAnalysis?.watchlist && adrData) {
          const w = bubbleAnalysis.watchlist;
          const vol6log = Math.log10(Math.max(volume24h / 1_000_000, 0.1));
          const silenceBonus = 1 + Math.min(w.daysSinceLastBig, 60) / 20;
          const score = adrData.adrPct * vol6log * silenceBonus;
          const entry: BubbleWatchlistEntry = {
            instId: ticker.instId,
            symbol: ticker.instId.replace("-USDT-SWAP", "/USDT.P"),
            adrPct: adrData.adrPct,
            currentPrice,
            volume24h,
            progressToHigh: adrData.progressToHigh,
            progressToLow: adrData.progressToLow,
            daysSinceLastBig: w.daysSinceLastBig,
            todayVolumeUsd: w.todayVolumeUsd,
            todayRatioPct: w.todayRatioPct,
            p75: w.p75,
            score,
            updatedAt: new Date().toISOString(),
          };
          bubbleWatchlistMap.set(ticker.instId, entry);
        }

        // ── ADR signal logic ────────────────────────────────────────────────
        if (adrData) {
          const existing = stateMap.get(ticker.instId);
          let signalSentHigh = existing?.signalSentHigh ?? false;
          let signalSentLow = existing?.signalSentLow ?? false;
          // Track timestamps explicitly so resets clear them and new fires always use now()
          let signalSentHighAt: Date | null = existing?.signalSentHighAt ?? null;
          let signalSentLowAt: Date | null = existing?.signalSentLowAt ?? null;

          if (shouldResetSignals(signalSentHighAt)) { signalSentHigh = false; signalSentHighAt = null; }
          if (shouldResetSignals(signalSentLowAt))  { signalSentLow  = false; signalSentLowAt  = null; }

          const rangeProgress = adrData.progressToHigh + adrData.progressToLow;
          const isHighDominant = adrData.progressToHigh >= adrData.progressToLow;

          // Only send Telegram from the production deployment.
          // Dev server (NODE_ENV=development) runs in parallel with prod and must not send.
          const tgEnabled = process.env.NODE_ENV === "production";

          if (rangeProgress >= SIGNAL_THRESHOLD) {
            if (isHighDominant && !signalSentHigh) {
              try {
                const msgId = tgEnabled ? await sendSignalMessage(adrData, "ADR_HIGH") : null;
                await db.insert(signalsTable).values({
                  instId: adrData.instId,
                  symbol: adrData.symbol,
                  signalType: "ADR_HIGH",
                  adrPct: adrData.adrPct,
                  price: adrData.currentPrice,
                  adrLevel: adrData.adrHighLevel,
                  progressPct: rangeProgress,
                  volume24h: adrData.volume24h,
                  telegramMsgId: msgId,
                });
                signalSentHigh = true;
                signalSentHighAt = new Date();
                if (tgEnabled) logger.info({ symbol: adrData.symbol }, "ADR_HIGH signal sent to Telegram (production)");
                else logger.info({ symbol: adrData.symbol }, "ADR_HIGH signal logged (dev — Telegram skipped)");
              } catch (tgErr) {
                logger.error({ err: tgErr, instId: ticker.instId }, "Failed to send Telegram signal (ADR_HIGH)");
              }
            } else if (!isHighDominant && !signalSentLow) {
              try {
                const msgId = tgEnabled ? await sendSignalMessage(adrData, "ADR_LOW") : null;
                await db.insert(signalsTable).values({
                  instId: adrData.instId,
                  symbol: adrData.symbol,
                  signalType: "ADR_LOW",
                  adrPct: adrData.adrPct,
                  price: adrData.currentPrice,
                  adrLevel: adrData.adrLowLevel,
                  progressPct: rangeProgress,
                  volume24h: adrData.volume24h,
                  telegramMsgId: msgId,
                });
                signalSentLow = true;
                signalSentLowAt = new Date();
                if (tgEnabled) logger.info({ symbol: adrData.symbol }, "ADR_LOW signal sent to Telegram (production)");
                else logger.info({ symbol: adrData.symbol }, "ADR_LOW signal logged (dev — Telegram skipped)");
              } catch (tgErr) {
                logger.error({ err: tgErr, instId: ticker.instId }, "Failed to send Telegram signal (ADR_LOW)");
              }
            }
          }

          await db.insert(coinStatesTable).values({
            instId: adrData.instId,
            symbol: adrData.symbol,
            adrPct: adrData.adrPct,
            adrHighLevel: adrData.adrHighLevel,
            adrLowLevel: adrData.adrLowLevel,
            currentPrice: adrData.currentPrice,
            progressToHigh: adrData.progressToHigh,
            progressToLow: adrData.progressToLow,
            volume24h: adrData.volume24h,
            signalSentHigh,
            signalSentLow,
            signalSentHighAt,
            signalSentLowAt,
          }).onConflictDoUpdate({
            target: coinStatesTable.instId,
            set: {
              symbol: sql`excluded.symbol`,
              adrPct: sql`excluded.adr_pct`,
              adrHighLevel: sql`excluded.adr_high_level`,
              adrLowLevel: sql`excluded.adr_low_level`,
              currentPrice: sql`excluded.current_price`,
              progressToHigh: sql`excluded.progress_to_high`,
              progressToLow: sql`excluded.progress_to_low`,
              volume24h: sql`excluded.volume_24h`,
              lastUpdated: new Date(),
              signalSentHigh: signalSentHigh,
              signalSentLow: signalSentLow,
              signalSentHighAt,
              signalSentLowAt,
            },
          });
        }

        // ── Volume spike / breakout logic ───────────────────────────────────
        if (spikeData && isVolSpikeCooledDown(ticker.instId)) {
          const isBreakoutCombo =
            spikeData.spikeRatio >= VOL_BREAKOUT_THRESHOLD &&
            adrData !== null &&
            (adrData.progressToHigh >= VOL_BREAKOUT_ADR_MIN || adrData.progressToLow >= VOL_BREAKOUT_ADR_MIN);

          const isPureSpike = spikeData.spikeRatio >= VOL_SPIKE_THRESHOLD;

          if (isBreakoutCombo && adrData) {
            // Combo: volume spike + price near ADR level — dashboard only, no Telegram
            const direction = adrData.progressToHigh >= adrData.progressToLow ? "HIGH" : "LOW";
            // VOL_BREAKOUT_HIGH = buying pressure (green), VOL_BREAKOUT_LOW = selling pressure (red)
            await db.insert(signalsTable).values({
              instId: spikeData.instId,
              symbol: spikeData.symbol,
              signalType: direction === "HIGH" ? "VOL_BREAKOUT_HIGH" : "VOL_BREAKOUT_LOW",
              adrPct: adrData.adrPct,
              price: spikeData.currentPrice,
              adrLevel: direction === "HIGH" ? adrData.adrHighLevel : adrData.adrLowLevel,
              progressPct: Math.round(spikeData.spikeRatio * 10) / 10,
              volume24h: spikeData.volume24h,
              telegramMsgId: null,
            });
            volSpikeCooldowns.set(ticker.instId, Date.now());
            logger.info({ symbol: spikeData.symbol, spikeRatio: spikeData.spikeRatio, direction }, "VOL_BREAKOUT signal (dashboard only)");
          } else if (isPureSpike) {
            // Pure volume spike — direction from 5m candle close vs open
            // VOL_SPIKE_UP = candle closed up (green), VOL_SPIKE_DOWN = closed down (red)
            const spikeType = spikeData.priceChange5m >= 0 ? "VOL_SPIKE_UP" : "VOL_SPIKE_DOWN";
            await db.insert(signalsTable).values({
              instId: spikeData.instId,
              symbol: spikeData.symbol,
              signalType: spikeType,
              adrPct: adrData?.adrPct ?? 0,
              price: spikeData.currentPrice,
              adrLevel: 0,
              progressPct: Math.round(spikeData.spikeRatio * 10) / 10,
              volume24h: spikeData.volume24h,
              telegramMsgId: null,
            });
            volSpikeCooldowns.set(ticker.instId, Date.now());
            logger.info({ symbol: spikeData.symbol, spikeRatio: spikeData.spikeRatio, spikeType }, "VOL_SPIKE signal (dashboard only)");
          }
        }

        // ── Volume Bubbles (daily percentile-based) ─────────────────────────
        // Spam protection: 60-min cooldown per (coin + tier).
        // Tier escalation (SMALL→MEDIUM, MEDIUM→BIG) always fires immediately.
        // Telegram enabled for BIG+BUY and BIG+SELL; others are dashboard-only.
        if (bubbleData) {
          const direction = bubbleData.bubbleDirection === "MIXED" ? "BUY" : bubbleData.bubbleDirection;
          const signalType = `VOL_BUBBLE_${bubbleData.bubbleSize}_${direction}`;

          if (isBubbleSuppressed(bubbleData.instId, signalType, bubbleData.bubbleSize)) {
            // Within cooldown and same/lower tier — skip this scan silently
          } else {
            markBubbleFired(bubbleData.instId, signalType);

            const sendToTelegram = false; // Telegram notifications disabled for bubble bot
            let telegramMsgId: number | null = null;

            if (sendToTelegram) {
              try {
                telegramMsgId = await sendVolumeBubbleMessage(bubbleData);
                logger.info({ symbol: bubbleData.symbol, size: bubbleData.bubbleSize, direction }, "VOL_BUBBLE_DAILY BIG signal sent to Telegram");
              } catch (tgErr) {
                logger.error({ err: tgErr, symbol: bubbleData.symbol }, "Failed to send bubble BIG signal to Telegram");
              }
            }

            await db.insert(signalsTable).values({
              instId: bubbleData.instId,
              symbol: bubbleData.symbol,
              signalType,
              adrPct: adrData?.adrPct ?? 0,
              price: bubbleData.currentPrice,
              adrLevel: 0,
              progressPct: Math.round(bubbleData.todayVolumeUsd),
              volume24h: bubbleData.volume24h,
              telegramMsgId,
            });
            logger.info({ symbol: bubbleData.symbol, size: bubbleData.bubbleSize, direction, todayVol: bubbleData.todayVolumeUsd }, sendToTelegram ? "VOL_BUBBLE_DAILY BIG signal (TG enabled)" : "VOL_BUBBLE_DAILY signal (dashboard only)");
          }
        }

      } catch (err) {
        logger.debug({ err, instId: ticker.instId }, "Error processing coin");
      }
    }));

    if (i + BATCH_SIZE < filtered.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  state.lastScanAt = new Date();
  state.scanCount++;
  logger.info({ scanCount: state.scanCount }, "Scan complete");
}

export async function startScanner(): Promise<void> {
  if (state.botRunning) return;

  state.botRunning = true;
  state.nextScanAt = new Date();

  const run = async () => {
    try {
      await scanOnce();
      state.lastError = null;
    } catch (err) {
      state.errorCount++;
      state.lastError = err instanceof Error ? err.message : String(err);
      logger.error({ err }, "Scan failed");
    }
    if (state.botRunning) {
      state.nextScanAt = new Date(Date.now() + SCAN_INTERVAL_MS);
    }
  };

  await run();

  scanInterval = setInterval(run, SCAN_INTERVAL_MS);
  scheduleMidnightReset();
  logger.info("Scanner started");
}

export function stopScanner(): void {
  if (!state.botRunning) return;
  state.botRunning = false;
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  state.nextScanAt = null;
  logger.info("Scanner stopped");
}

export const SCAN_INTERVAL_SECONDS = SCAN_INTERVAL_MS / 1000;
