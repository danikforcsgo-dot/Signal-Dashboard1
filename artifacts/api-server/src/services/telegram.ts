import { logger } from "../lib/logger";
import type { CoinADRData, VolumeSpikeData, VolumeBubbleData } from "./okx";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let telegramConnected = false;

export function isTelegramConnected(): boolean {
  return telegramConnected;
}

// Global rate limiter: max 1 message per 1.1 seconds to avoid Telegram 429 errors
let lastSendTime = 0;
const MIN_SEND_INTERVAL_MS = 1100;

async function rateLimitedDelay(): Promise<void> {
  const now = Date.now();
  const wait = MIN_SEND_INTERVAL_MS - (now - lastSendTime);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastSendTime = Date.now();
}

async function callTelegramAPI(method: string, body: Record<string, unknown>): Promise<unknown> {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set");

  const doRequest = async () => fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  await rateLimitedDelay();

  let res = await doRequest();
  let data = await res.json() as { ok: boolean; result?: unknown; description?: string; parameters?: { retry_after?: number } };

  if (!data.ok && data.description?.includes("Too Many Requests")) {
    const retryAfter = (data.parameters?.retry_after ?? 10) * 1000 + 500;
    logger.warn({ retryAfter }, "Telegram rate limited, retrying after delay");
    await new Promise(r => setTimeout(r, retryAfter));
    lastSendTime = Date.now();
    res = await doRequest();
    data = await res.json() as { ok: boolean; result?: unknown; description?: string };
  }

  if (!data.ok) throw new Error(`Telegram error: ${data.description}`);
  return data.result;
}

export async function verifyTelegramConnection(): Promise<boolean> {
  try {
    await callTelegramAPI("getMe", {});
    telegramConnected = true;
    return true;
  } catch (err) {
    logger.error({ err }, "Telegram connection check failed");
    telegramConnected = false;
    return false;
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(1) + "B";
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1) + "M";
  if (vol >= 1_000) return (vol / 1_000).toFixed(1) + "K";
  return vol.toFixed(0);
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(6);
  return price.toFixed(8);
}

function formatTime(date: Date): string {
  const months = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
  const d = date.getUTCDate();
  const m = months[date.getUTCMonth()];
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${d} ${m}  ${hh}:${mm} UTC`;
}

function sep(): string {
  return "┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄";
}

function getOKXSlug(symbol: string): string {
  return symbol.replace("/USDT.P", "").toLowerCase() + "-usdt-swap";
}

function getTVSymbol(instId: string): string {
  const base = instId.replace("-USDT-SWAP", "");
  return `OKX:${base}USDT.P`;
}

function links(symbol: string, instId: string): string {
  const okxSlug = getOKXSlug(symbol);
  const tvSymbol = getTVSymbol(instId);
  return `<a href="https://www.tradingview.com/chart/?symbol=${tvSymbol}">📈 TradingView</a>  ·  <a href="https://www.okx.com/ru/trade-swap/${okxSlug}">🏦 OKX</a>`;
}

// ── ADR signal ────────────────────────────────────────────────────────────────

export async function sendSignalMessage(coin: CoinADRData, signalType: "ADR_HIGH" | "ADR_LOW"): Promise<number | null> {
  if (!BOT_TOKEN || !CHAT_ID) {
    logger.warn("Telegram credentials not configured");
    return null;
  }

  const isHigh = signalType === "ADR_HIGH";
  const headerEmoji = isHigh ? "🟢" : "🔴";
  const levelLabel = isHigh ? "ADR HIGH" : "ADR LOW";
  const dirLabel = isHigh ? "ЛОНГ" : "ШОРТ";
  const level = isHigh ? coin.adrHighLevel : coin.adrLowLevel;

  const distPct = Math.abs(((coin.currentPrice - level) / level) * 100).toFixed(2);
  const distSign = coin.currentPrice >= level ? "+" : "-";

  const text = [
    `${headerEmoji} <b>${levelLabel} · ${coin.symbol}</b>`,
    `Цена достигла ${isHigh ? "верхней" : "нижней"} границы дневного диапазона`,
    ``,
    sep(),
    `💰 Цена:      <b>${formatPrice(coin.currentPrice)} USDT</b>`,
    `🎯 ${levelLabel}:  <b>${formatPrice(level)} USDT</b>  (${distSign}${distPct}%)`,
    `📊 ADR(14):   ${coin.adrPct.toFixed(2)}%`,
    `📦 Объём 24ч: ${formatVolume(coin.volume24h)} USDT`,
    sep(),
    `⚡ Сигнал: <b>${dirLabel}</b>`,
    `🕐 ${formatTime(new Date())}`,
    sep(),
    ``,
    links(coin.symbol, coin.instId),
  ].join("\n");

  try {
    const result = await callTelegramAPI("sendMessage", {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }) as { message_id: number };
    telegramConnected = true;
    logger.info({ symbol: coin.symbol, signalType }, "Signal sent to Telegram");
    return result.message_id;
  } catch (err) {
    logger.error({ err, symbol: coin.symbol }, "Failed to send Telegram signal");
    telegramConnected = false;
    return null;
  }
}

// ── Volume spike ──────────────────────────────────────────────────────────────

export async function sendVolumeSpikeMessage(data: VolumeSpikeData): Promise<number | null> {
  if (!BOT_TOKEN || !CHAT_ID) return null;

  const isUp = data.priceChange5m >= 0;
  const dirEmoji = isUp ? "📈" : "📉";
  const changeStr = (data.priceChange5m >= 0 ? "+" : "") + data.priceChange5m.toFixed(2) + "%";

  const text = [
    `🔊 <b>ВСПЛЕСК ОБЪЁМА · ${data.symbol}</b>`,
    `Объём за 5м вырос в <b>×${data.spikeRatio.toFixed(1)}</b> раза`,
    ``,
    sep(),
    `💰 Цена:       <b>${formatPrice(data.currentPrice)} USDT</b>`,
    `${dirEmoji} Изм. 5м:   <b>${changeStr}</b>`,
    sep(),
    `📊 Объём 5м:   <b>${formatVolume(data.volume5m)} USDT</b>  ×${data.spikeRatio.toFixed(1)}x`,
    `📉 Средний 5м: ${formatVolume(data.avgVolume5m)} USDT`,
    `📦 Объём 24ч:  ${formatVolume(data.volume24h)} USDT`,
    sep(),
    `🕐 ${formatTime(new Date())}`,
    ``,
    links(data.symbol, data.instId),
  ].join("\n");

  try {
    const result = await callTelegramAPI("sendMessage", {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }) as { message_id: number };
    telegramConnected = true;
    logger.info({ symbol: data.symbol, spikeRatio: data.spikeRatio }, "Volume spike sent to Telegram");
    return result.message_id;
  } catch (err) {
    logger.error({ err, symbol: data.symbol }, "Failed to send volume spike");
    telegramConnected = false;
    return null;
  }
}

// ── Volume breakout ───────────────────────────────────────────────────────────

export async function sendVolumeBreakoutMessage(data: VolumeSpikeData, adr: CoinADRData, direction: "HIGH" | "LOW"): Promise<number | null> {
  if (!BOT_TOKEN || !CHAT_ID) return null;

  const isHigh = direction === "HIGH";
  const headerEmoji = isHigh ? "🚀" : "💥";
  const levelLabel = isHigh ? "ADR HIGH" : "ADR LOW";
  const dirLabel = isHigh ? "ЛОНГ" : "ШОРТ";
  const level = isHigh ? adr.adrHighLevel : adr.adrLowLevel;

  const distPct = Math.abs(((data.currentPrice - level) / level) * 100).toFixed(2);
  const distSign = data.currentPrice >= level ? "+" : "-";

  const text = [
    `${headerEmoji} <b>ПРОБОЙ + ОБЪЁМ · ${data.symbol}</b>`,
    `Всплеск ×${data.spikeRatio.toFixed(1)}x в момент подхода к уровню ${levelLabel}`,
    ``,
    sep(),
    `💰 Цена:      <b>${formatPrice(data.currentPrice)} USDT</b>`,
    `🎯 ${levelLabel}: <b>${formatPrice(level)} USDT</b>  (${distSign}${distPct}%)`,
    `📊 ADR(14):   ${adr.adrPct.toFixed(2)}%`,
    sep(),
    `📊 Объём 5м:  <b>${formatVolume(data.volume5m)} USDT</b>  ×${data.spikeRatio.toFixed(1)}x`,
    `📦 Объём 24ч: ${formatVolume(data.volume24h)} USDT`,
    sep(),
    `⚡ Сигнал: <b>${dirLabel}</b>`,
    `🕐 ${formatTime(new Date())}`,
    sep(),
    ``,
    links(data.symbol, data.instId),
  ].join("\n");

  try {
    const result = await callTelegramAPI("sendMessage", {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }) as { message_id: number };
    telegramConnected = true;
    logger.info({ symbol: data.symbol, direction, spikeRatio: data.spikeRatio }, "Volume breakout sent to Telegram");
    return result.message_id;
  } catch (err) {
    logger.error({ err, symbol: data.symbol }, "Failed to send volume breakout");
    telegramConnected = false;
    return null;
  }
}

// ── Volume bubble ─────────────────────────────────────────────────────────────

export async function sendVolumeBubbleMessage(data: VolumeBubbleData): Promise<number | null> {
  if (!BOT_TOKEN || !CHAT_ID) return null;

  const isBuy = data.bubbleDirection !== "SELL";
  const dirEmoji = isBuy ? "📈" : "📉";
  const dirLabel = isBuy ? "ПОКУПКА" : "ПРОДАЖА";

  const sizeRu: Record<string, string> = { SMALL: "МАЛЫЙ", MEDIUM: "СРЕДНИЙ", BIG: "БОЛЬШОЙ" };
  const sizeRank: Record<string, string> = { SMALL: "топ 25%", MEDIUM: "топ 10%", BIG: "топ 3%" };
  const sizeDots: Record<string, string> = { SMALL: "●○○", MEDIUM: "●●○", BIG: "●●●" };

  const headerEmoji = data.bubbleSize === "BIG" ? (isBuy ? "🚀" : "💀") : (isBuy ? "🟢" : "🔴");

  const priceDiff = data.currentPrice - data.prevClose;
  const priceDiffPct = ((priceDiff / data.prevClose) * 100);
  const priceDiffStr = (priceDiffPct >= 0 ? "+" : "") + priceDiffPct.toFixed(2) + "%";

  const text = [
    `${headerEmoji} <b>ПУЗЫРЬ ОБЪЁМА · ${sizeRu[data.bubbleSize]} ${dirLabel}</b>`,
    `${data.symbol}  ${sizeDots[data.bubbleSize]}`,
    `Объём дня в ${sizeRank[data.bubbleSize]} исторических значений`,
    ``,
    sep(),
    `💰 Цена:          <b>${formatPrice(data.currentPrice)} USDT</b>`,
    `${dirEmoji} Vs вчера:     <b>${priceDiffStr}</b>`,
    sep(),
    `📊 Объём сегодня: <b>${formatVolume(data.todayVolumeUsd)} USDT</b>`,
    `📦 Объём 24ч:     ${formatVolume(data.volume24h)} USDT`,
    sep(),
    `🕐 ${formatTime(new Date())}`,
    ``,
    links(data.symbol, data.instId),
  ].join("\n");

  try {
    const result = await callTelegramAPI("sendMessage", {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }) as { message_id: number };
    telegramConnected = true;
    logger.info({ symbol: data.symbol, size: data.bubbleSize, direction: data.bubbleDirection }, "Volume bubble sent to Telegram");
    return result.message_id;
  } catch (err) {
    logger.error({ err, symbol: data.symbol }, "Failed to send volume bubble");
    telegramConnected = false;
    return null;
  }
}

export async function sendTestMessage(): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) return false;

  try {
    await callTelegramAPI("sendMessage", {
      chat_id: CHAT_ID,
      text: "✅ <b>Signal Bot</b> — подключение активно\nБот запущен и отправляет сигналы OKX Perps",
      parse_mode: "HTML",
    });
    telegramConnected = true;
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send test message");
    return false;
  }
}
