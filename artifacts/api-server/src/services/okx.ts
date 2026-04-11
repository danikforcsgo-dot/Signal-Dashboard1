import { logger } from "../lib/logger";

const OKX_BASE = "https://www.okx.com";

export interface OKXTicker {
  instId: string;
  last: string;
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

export async function fetchDailyCandles(instId: string, limit = 15): Promise<OKXCandle[]> {
  const data = await fetchOKX(`/api/v5/market/candles?instId=${instId}&bar=1D&limit=${limit}`) as string[][];
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
  if (candles.length < 15) return null;

  const confirmedCandles = candles.filter(c => c.confirm === "1");
  if (confirmedCandles.length < 14) return null;

  const last14 = confirmedCandles.slice(0, 14);

  let adrPctSum = 0;
  let adrAbsSum = 0;
  for (const c of last14) {
    const h = parseFloat(c.high);
    const l = parseFloat(c.low);
    if (l === 0) continue;
    adrAbsSum += h - l;
    adrPctSum += ((h - l) / l) * 100;
  }

  const adrAbsolute = adrAbsSum / 14;
  const adrPct = adrPctSum / 14;

  const prevCandle = confirmedCandles[0];
  const prevClose = parseFloat(prevCandle.close);

  if (prevClose === 0 || adrAbsolute === 0) return null;

  const adrHighLevel = prevClose + adrAbsolute;
  const adrLowLevel = prevClose - adrAbsolute;

  const progressToHigh = Math.min(100, Math.max(0,
    ((currentPrice - prevClose) / adrAbsolute) * 100
  ));
  const progressToLow = Math.min(100, Math.max(0,
    ((prevClose - currentPrice) / adrAbsolute) * 100
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
