import { logger } from "../lib/logger";
import { db } from "@workspace/db";
import { signalsTable, coinStatesTable } from "@workspace/db";
import { fetchAllSwapTickers, fetchCoinADRData } from "./okx";
import { sendSignalMessage } from "./telegram";
import { eq, sql } from "drizzle-orm";

const SCAN_INTERVAL_MS = 60_000;
const SIGNAL_THRESHOLD = 95;
const MIN_VOLUME_USDT = 500_000;
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;

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

        const adrData = await fetchCoinADRData(ticker.instId, currentPrice, volume24h);
        if (!adrData) return;

        const existing = stateMap.get(ticker.instId);
        let signalSentHigh = existing?.signalSentHigh ?? false;
        let signalSentLow = existing?.signalSentLow ?? false;

        if (shouldResetSignals(existing?.signalSentHighAt ?? null)) signalSentHigh = false;
        if (shouldResetSignals(existing?.signalSentLowAt ?? null)) signalSentLow = false;

        // Combined range progress = progressToHigh + progressToLow
        // = (todayHigh - todayLow) / ADR * 100  — same metric as TradingView "Current%"
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
