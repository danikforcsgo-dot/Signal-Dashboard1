import { logger } from "../lib/logger";
import type { CoinADRData } from "./okx";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let telegramConnected = false;

export function isTelegramConnected(): boolean {
  return telegramConnected;
}

async function callTelegramAPI(method: string, body: Record<string, unknown>): Promise<unknown> {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set");

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });

  const data = await res.json() as { ok: boolean; result?: unknown; description?: string };
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

function getOKXSlug(symbol: string): string {
  return symbol.replace("/USDT.P", "").toLowerCase() + "-usdt-swap";
}

function getTVSymbol(instId: string): string {
  const base = instId.replace("-USDT-SWAP", "");
  return `OKX:${base}USDT.P`;
}

export async function sendSignalMessage(coin: CoinADRData, signalType: "ADR_HIGH" | "ADR_LOW"): Promise<number | null> {
  if (!BOT_TOKEN || !CHAT_ID) {
    logger.warn("Telegram credentials not configured");
    return null;
  }

  const isHigh = signalType === "ADR_HIGH";
  const emoji = isHigh ? "🟢" : "🔴";
  const levelLabel = isHigh ? "ADR HIGH" : "ADR LOW";
  const level = isHigh ? coin.adrHighLevel : coin.adrLowLevel;

  const now = new Date();
  const timeStr = now.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }) + " UTC";

  const okxSlug = getOKXSlug(coin.symbol);
  const tvSymbol = getTVSymbol(coin.instId);

  const text = `${emoji} ${coin.symbol}
Достигнут уровень ${levelLabel} 100%

📊 ADR(14): ${coin.adrPct.toFixed(2)}%
💰 Цена: ${formatPrice(coin.currentPrice)} USDT
🎯 Уровень ADR: ${formatPrice(level)} USDT
📦 Объём 24ч: ${formatVolume(coin.volume24h)} USDT
⏰ ${timeStr}

📈 TradingView · ${coin.symbol} (https://www.tradingview.com/chart/?symbol=${tvSymbol})
🏦 OKX · ${coin.symbol} (https://www.okx.com/ru/trade-swap/${okxSlug})`;

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

export async function sendTestMessage(): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) return false;

  try {
    await callTelegramAPI("sendMessage", {
      chat_id: CHAT_ID,
      text: "✅ Telegram Signal Bot — тест подключения успешен!\n\nБот запущен и готов отправлять сигналы.",
    });
    telegramConnected = true;
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send test message");
    return false;
  }
}
