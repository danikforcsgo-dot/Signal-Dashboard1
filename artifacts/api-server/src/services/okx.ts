import { logger } from "../lib/logger";

const OKX_BASE = "https://www.okx.com";

export interface OKXTicker {
  instId: string;
  last: string;
  open24h: string;
  vol24h: string;
  volCcy24h: string;
}

export interface OKXCandle {
  ts: string;
  open: string;
  high: string;
  low: string;
  close: string;
  vol: string;
  volCcy: string;
  volCcyQuote: string;
  confirm: string;
}

export interface CoinADRData {
  instId: string;
  symbol: string;
  adrPct: number;
  adrAbsolute: number;
  prevClose: number;
  adrHighLevel: number;
  adrLowLevel: number;
  currentPrice: number;
  progressToHigh: number;
  progressToLow: number;
  volume24h: number;
}

let okxConnected = false;

export function isOkxConnected(): boolean {
  return okxConnected;
}

async function fetchOKX(path: string): Promise<unknown> {
  const res = await fetch(`${OKX_BASE}${path}`, {
    headers: { "Accept": "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`OKX API error: ${res.status} ${path}`);
  const data = await res.json() as { code: string; data: unknown };
  if (data.code !== "0") throw new Error(`OKX error code ${data.code}: ${path}`);
  return data.data;
}

export async function fetchAllSwapTickers(): Promise<OKXTicker[]> {
  const data = await fetchOKX("/api/v5/market/tickers?instType=SWAP") as OKXTicker[];
  okxConnected = true;
  return data.filter(t => t.instId.endsWith("-USDT-SWAP"));
}

export async function fetchDailyCandles(instId: string, limit = 17): Promise<OKXCandle[]> {
  const data = await fetchOKX(`/api/v5/market/candles?instId=${instId}&bar=1Dutc&limit=${limit}`) as string[][];
  return data.map(c => ({
    ts: c[0],
    open: c[1],
    high: c[2],
    low: c[3],
    close: c[4],
    vol: c[5],
    volCcy: c[6],
    volCcyQuote: c[7],
    confirm: c[8],
  }));
}

export function computeADR(candles: OKXCandle[], currentPrice: number): CoinADRData | null {
  // Need at least 14 confirmed candles + possibly 1 open candle
  const confirmedCandles = candles.filter(c => c.confirm === "1");
  if (confirmedCandles.length < 14) return null;

  // Use the most recent 14 CONFIRMED (closed) daily candles for ADR calculation
  const last14 = confirmedCandles.slice(0, 14);

  let adrAbsSum = 0;
  for (const c of last14) {
    const h = parseFloat(c.high);
    const l = parseFloat(c.low);
    if (l === 0) continue;
    adrAbsSum += h - l;
  }

  const adrAbsolute = adrAbsSum / 14;

  // prevClose = close of most recent completed daily bar
  const prevCandle = confirmedCandles[0];
  const prevClose = parseFloat(prevCandle.close);

  if (prevClose === 0 || adrAbsolute === 0) return null;

  // ADR as % of prevClose (standard formula)
  const adrPct = (adrAbsolute / prevClose) * 100;

  const adrHighLevel = prevClose + adrAbsolute;
  const adrLowLevel = prevClose - adrAbsolute;

  // Use today's intraday HIGH/LOW (from the current open candle) for progress.
  // This ensures we catch signals even if the price only briefly touched the level
  // between 1-minute scans.
  const openCandle = candles.find(c => c.confirm === "0");
  const todayHigh = openCandle ? Math.max(parseFloat(openCandle.high), currentPrice) : currentPrice;
  const todayLow  = openCandle ? Math.min(parseFloat(openCandle.low),  currentPrice) : currentPrice;

  const progressToHigh = Math.min(100, Math.max(0,
    ((todayHigh - prevClose) / adrAbsolute) * 100
  ));
  const progressToLow = Math.min(100, Math.max(0,
    ((prevClose - todayLow) / adrAbsolute) * 100
  ));

  return {
    instId: "",
    symbol: "",
    adrPct,
    adrAbsolute,
    prevClose,
    adrHighLevel,
    adrLowLevel,
    currentPrice,
    progressToHigh,
    progressToLow,
    volume24h: 0,
  };
}

export interface VolumeSpikeData {
  instId: string;
  symbol: string;
  currentPrice: number;
  volume5m: number;
  avgVolume5m: number;
  spikeRatio: number;
  priceChange5m: number;
  volume24h: number;
}

export async function fetch5mCandles(instId: string, limit = 22): Promise<OKXCandle[]> {
  const data = await fetchOKX(`/api/v5/market/candles?instId=${instId}&bar=5m&limit=${limit}`) as string[][];
  return data.map(c => ({
    ts: c[0], open: c[1], high: c[2], low: c[3], close: c[4],
    vol: c[5], volCcy: c[6], volCcyQuote: c[7], confirm: c[8],
  }));
}

// ── Volume Bubbles (percentile-based, QuantAlgo style) ──────────────────────

export interface VolumeBubbleData {
  instId: string;
  symbol: string;
  currentPrice: number;
  volume24h: number;
  todayVolumeUsd: number;   // accumulated USD volume of today's open (unconfirmed) daily candle
  prevClose: number;        // yesterday's close price (reference for direction)
  bubbleSize: "SMALL" | "MEDIUM" | "BIG";
  bubbleDirection: "BUY" | "SELL" | "MIXED";
}

export interface BubbleWatchlistInfo {
  daysSinceLastBig: number;  // days since volume exceeded P75; 999 = not in history window
  todayVolumeUsd: number;
  todayRatioPct: number;     // today vol / P75 * 100
  p75: number;
}

export interface VolumeBubbleAnalysis {
  bubble: VolumeBubbleData | null;
  watchlist: BubbleWatchlistInfo | null;
}

function percentileLinearInterp(values: number[], pct: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const rank = (pct / 100) * (n - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (rank - lower) * (sorted[upper] - sorted[lower]);
}

// Fetch daily candles with a higher limit for bubble analysis
async function fetchDailyCandles102(instId: string): Promise<OKXCandle[]> {
  return fetchDailyCandles(instId, 102);
}

export async function fetchVolumeBubbleData(instId: string, currentPrice: number, volume24h: number): Promise<VolumeBubbleAnalysis | null> {
  try {
    // Fetch 102 daily candles: today's open (unconfirmed) + up to 101 confirmed history
    const candles = await fetchDailyCandles102(instId);

    // Today's open candle (confirm="0") — has accumulated volume so far today
    const todayCandle = candles.find(c => c.confirm === "0");
    if (!todayCandle) return null;

    // Historical confirmed daily candles (already sorted newest-first by OKX)
    const confirmed = candles.filter(c => c.confirm === "1");
    if (confirmed.length < 20) return null; // need at least short window

    const todayVol = parseFloat(todayCandle.volCcyQuote); // today's accumulated USD volume
    if (todayVol <= 0) return { bubble: null, watchlist: null };

    // Percentile windows from confirmed daily candles (20 / 50 / 100 bars)
    const shortH = confirmed.slice(0, 20).map(c => parseFloat(c.volCcyQuote));
    const midH   = confirmed.length >= 50  ? confirmed.slice(0, 50).map(c => parseFloat(c.volCcyQuote))  : shortH;
    const longH  = confirmed.length >= 100 ? confirmed.slice(0, 100).map(c => parseFloat(c.volCcyQuote)) : midH;

    const SMALL_PCT = 75, MEDIUM_PCT = 90, BIG_PCT = 97;
    const consensus = (s: boolean, m: boolean, l: boolean) => (s ? 1 : 0) + (m ? 1 : 0) + (l ? 1 : 0) >= 2;

    // Use midH P75 as the primary silence reference (50-bar window)
    const p75ref = percentileLinearInterp(midH, SMALL_PCT);

    // Days since last confirmed daily bar whose volume exceeded P75 (newest bar = index 0)
    let daysSinceLastBig = 999;
    for (let i = 0; i < confirmed.length; i++) {
      if (parseFloat(confirmed[i].volCcyQuote) >= p75ref) {
        daysSinceLastBig = i;
        break;
      }
    }

    const todayRatioPct = p75ref > 0 ? Math.round((todayVol / p75ref) * 100) : 0;

    const watchlist: BubbleWatchlistInfo = { daysSinceLastBig, todayVolumeUsd: todayVol, todayRatioPct, p75: p75ref };

    const isBig    = consensus(todayVol >= percentileLinearInterp(shortH, BIG_PCT),    todayVol >= percentileLinearInterp(midH, BIG_PCT),    todayVol >= percentileLinearInterp(longH, BIG_PCT));
    const isMedium = !isBig && consensus(todayVol >= percentileLinearInterp(shortH, MEDIUM_PCT), todayVol >= percentileLinearInterp(midH, MEDIUM_PCT), todayVol >= percentileLinearInterp(longH, MEDIUM_PCT));
    const isSmall  = !isBig && !isMedium && consensus(todayVol >= percentileLinearInterp(shortH, SMALL_PCT),  todayVol >= percentileLinearInterp(midH, SMALL_PCT),  todayVol >= percentileLinearInterp(longH, SMALL_PCT));

    if (!isBig && !isMedium && !isSmall) return { bubble: null, watchlist };

    const bubbleSize: "SMALL" | "MEDIUM" | "BIG" = isBig ? "BIG" : isMedium ? "MEDIUM" : "SMALL";

    // Direction: current price vs yesterday's confirmed close
    const prevClose = parseFloat(confirmed[0].close);
    const diff = currentPrice - prevClose;
    const bubbleDirection: "BUY" | "SELL" | "MIXED" = diff > 0 ? "BUY" : diff < 0 ? "SELL" : "MIXED";

    const symbol = instId.replace("-USDT-SWAP", "") + "/USDT.P";
    const bubble: VolumeBubbleData = { instId, symbol, currentPrice, volume24h, todayVolumeUsd: todayVol, prevClose, bubbleSize, bubbleDirection };
    return { bubble, watchlist };
  } catch (err) {
    logger.debug({ err, instId }, "Failed to fetch daily volume bubble data");
    return null;
  }
}

export async function fetchVolumeSpikeData(instId: string, currentPrice: number, volume24h: number): Promise<VolumeSpikeData | null> {
  try {
    const candles = await fetch5mCandles(instId, 22);
    // candles[0] = forming (skip), candles[1] = last completed, candles[2..19] = history (90 min)
    if (candles.length < 20) return null;

    const lastCandle = candles[1];
    const historyCandles = candles.slice(2, 20);

    const volume5m = parseFloat(lastCandle.volCcyQuote);
    const avgVolume5m = historyCandles.reduce((sum, c) => sum + parseFloat(c.volCcyQuote), 0) / historyCandles.length;

    if (avgVolume5m === 0) return null;

    const spikeRatio = volume5m / avgVolume5m;
    const open5m = parseFloat(lastCandle.open);
    const close5m = parseFloat(lastCandle.close);
    const priceChange5m = open5m > 0 ? ((close5m - open5m) / open5m) * 100 : 0;

    const symbol = instId.replace("-USDT-SWAP", "") + "/USDT.P";

    return { instId, symbol, currentPrice, volume5m, avgVolume5m, spikeRatio, priceChange5m, volume24h };
  } catch (err) {
    logger.debug({ err, instId }, "Failed to fetch 5m candles");
    return null;
  }
}

export async function fetchCoinADRData(instId: string, currentPrice: number, volume24h: number): Promise<CoinADRData | null> {
  try {
    const candles = await fetchDailyCandles(instId);
    const adr = computeADR(candles, currentPrice);
    if (!adr) return null;

    const symbol = instId.replace("-USDT-SWAP", "") + "/USDT.P";

    return {
      ...adr,
      instId,
      symbol,
      volume24h,
    };
  } catch (err) {
    logger.debug({ err, instId }, "Failed to fetch candles for coin");
    return null;
  }
}
