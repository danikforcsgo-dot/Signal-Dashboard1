import { logger } from "../lib/logger";
import { db } from "@workspace/db";
import { signalsTable, coinStatesTable } from "@workspace/db";
import { fetchAllSwapTickers, fetchCoinADRData, fetchVolumeSpikeData, fetchVolumeBubbleData } from "./okx";
import { sendSignalMessage, sendVolumeSpikeMessage, sendVolumeBreakoutMessage, sendVolumeBubbleMessage } from "./telegram";
import { eq, sql } from "drizzle-orm";

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

// Daily bubble tracking: each tier (SMALL/MEDIUM/BIG) fires at most once per UTC day per coin.
// Key: `${instId}_${size}` → UTC date string "YYYY-MM-DD"
const dailyBubbleFired = new Map<string, string>();

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDailyBubbleTierFired(instId: string, size: string): boolean {
  return dailyBubbleFired.get(`${instId}_${size}`) === getTodayUTC();
}

function markDailyBubbleTierFired(instId: string, size: string): void {
  dailyBubbleFired.set(`${instId}_${size}`, getTodayUTC());
}

// Skip bubble fetch only if all 3 tiers already fired today for this coin
function allBubbleTiersFiredToday(instId: string): boolean {
  return isDailyBubbleTierFired(instId, "SMALL")
    && isDailyBubbleTierFired(instId, "MEDIUM")
    && isDailyBubbleTierFired(instId, "BIG");
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
          allBubbleTiersFiredToday(ticker.instId)
            ? Promise.resolve(null)
            : fetchVolumeBubbleData(ticker.instId, currentPrice, volume24h),
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

          if (rangeProgress >= SIGNAL_THRESHOLD) {
            if (isHighDominant && !signalSentHigh) {
              try {
                const msgId = await sendSignalMessage(adrData, "ADR_HIGH");
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
              } catch (tgErr) {
                logger.error({ err: tgErr, instId: ticker.instId }, "Failed to send Telegram signal (ADR_HIGH)");
                // signalSentHigh stays false — will retry next scan
                // But the DB upsert below still runs, persisting the reset state
              }
            } else if (!isHighDominant && !signalSentLow) {
              try {
                const msgId = await sendSignalMessage(adrData, "ADR_LOW");
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
              } catch (tgErr) {
                logger.error({ err: tgErr, instId: ticker.instId }, "Failed to send Telegram signal (ADR_LOW)");
                // signalSentLow stays false — will retry next scan
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
        // bubbleData is null if all tiers fired today or no bubble detected.
        // Each tier (SMALL/MEDIUM/BIG) may escalate independently during the day.
        // Telegram notifications for bubbles are currently DISABLED — dashboard only.
        if (bubbleData && !isDailyBubbleTierFired(ticker.instId, bubbleData.bubbleSize)) {
          const direction = bubbleData.bubbleDirection === "MIXED" ? "BUY" : bubbleData.bubbleDirection;
          const signalType = `VOL_BUBBLE_${bubbleData.bubbleSize}_${direction}`;
          await db.insert(signalsTable).values({
            instId: bubbleData.instId,
            symbol: bubbleData.symbol,
            signalType,
            adrPct: adrData?.adrPct ?? 0,
            price: bubbleData.currentPrice,
            adrLevel: 0,
            progressPct: Math.round(bubbleData.todayVolumeUsd),
            volume24h: bubbleData.volume24h,
            telegramMsgId: null,
          });
          markDailyBubbleTierFired(ticker.instId, bubbleData.bubbleSize);
          logger.info({ symbol: bubbleData.symbol, size: bubbleData.bubbleSize, direction, todayVol: bubbleData.todayVolumeUsd }, "VOL_BUBBLE_DAILY signal (dashboard only, TG disabled)");
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
