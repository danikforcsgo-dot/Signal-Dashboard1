import { logger } from "../lib/logger";
import { db } from "@workspace/db";
import { signalsTable, coinStatesTable } from "@workspace/db";
import { fetchAllSwapTickers, fetchCoinADRData, fetchVolumeSpikeData } from "./okx";
import { sendSignalMessage, sendVolumeSpikeMessage, sendVolumeBreakoutMessage } from "./telegram";
import { eq, sql } from "drizzle-orm";

const SCAN_INTERVAL_MS = 60_000;
const SIGNAL_THRESHOLD = 95;
const MIN_VOLUME_USDT = 500_000;
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;

// Volume spike thresholds
const VOL_SPIKE_THRESHOLD = 3.0;       // 3x average → pure spike alert
const VOL_BREAKOUT_THRESHOLD = 2.5;    // 2.5x + near ADR level → combo alert
const VOL_BREAKOUT_ADR_MIN = 65;       // price must be ≥65% of the way to ADR level
const VOL_SPIKE_COOLDOWN_MS = 30 * 60 * 1000; // 30 min cooldown per coin

// In-memory cooldown tracker (resets on server restart — acceptable)
const volSpikeCooldowns = new Map<string, number>();

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
    const vol = parseFloat(t.volCcy24h || t.vol24h || "0");
    return vol >= MIN_VOLUME_USDT;
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
        const volume24h = parseFloat(ticker.volCcy24h || ticker.vol24h || "0");

        // Fetch ADR data and volume spike data in parallel
        const [adrData, spikeData] = await Promise.all([
          fetchCoinADRData(ticker.instId, currentPrice, volume24h),
          fetchVolumeSpikeData(ticker.instId, currentPrice, volume24h),
        ]);

        // ── ADR signal logic ────────────────────────────────────────────────
        if (adrData) {
          const existing = stateMap.get(ticker.instId);
          let signalSentHigh = existing?.signalSentHigh ?? false;
          let signalSentLow = existing?.signalSentLow ?? false;

          if (shouldResetSignals(existing?.signalSentHighAt ?? null)) signalSentHigh = false;
          if (shouldResetSignals(existing?.signalSentLowAt ?? null)) signalSentLow = false;

          const rangeProgress = adrData.progressToHigh + adrData.progressToLow;
          const isHighDominant = adrData.progressToHigh >= adrData.progressToLow;

          if (rangeProgress >= SIGNAL_THRESHOLD) {
            if (isHighDominant && !signalSentHigh) {
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
            } else if (!isHighDominant && !signalSentLow) {
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
            signalSentHighAt: signalSentHigh ? (existing?.signalSentHighAt ?? new Date()) : null,
            signalSentLowAt: signalSentLow ? (existing?.signalSentLowAt ?? new Date()) : null,
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
              signalSentHighAt: signalSentHigh ? (existing?.signalSentHighAt ?? new Date()) : null,
              signalSentLowAt: signalSentLow ? (existing?.signalSentLowAt ?? new Date()) : null,
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
