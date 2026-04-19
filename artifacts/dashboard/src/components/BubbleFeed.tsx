import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { X, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";

function BubbleDots({ count, isBuy }: { count: 1 | 2 | 3; isBuy: boolean }) {
  const color = isBuy ? "bg-emerald-400" : "bg-red-400";
  const size = count === 3 ? "w-2.5 h-2.5" : count === 2 ? "w-2 h-2" : "w-1.5 h-1.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`rounded-full flex-shrink-0 ${color} ${size}`} />
      ))}
    </div>
  );
}

const STORAGE_KEY = "hidden_bubble_ids_v2";

function loadHidden(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {}
  return new Set();
}
function saveHidden(set: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

interface Signal {
  id: number;
  symbol: string;
  signalType: string;
  price: number;
  adrPct: number;
  progressPct: number;
  volume24h: number;
  sentAt: string;
}
interface SignalsResponse {
  signals: Signal[];
  total: number;
}

const BUBBLE_TYPES = new Set([
  "VOL_BUBBLE_SMALL_BUY", "VOL_BUBBLE_SMALL_SELL",
  "VOL_BUBBLE_MEDIUM_BUY", "VOL_BUBBLE_MEDIUM_SELL",
  "VOL_BUBBLE_BIG_BUY", "VOL_BUBBLE_BIG_SELL",
]);

function formatVol(val: number): string {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return val.toFixed(0);
}
function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(5);
  return price.toFixed(7);
}
function getOKXSlug(symbol: string) {
  return symbol.replace("/USDT.P", "").toLowerCase() + "-usdt-swap";
}
function getTVSymbol(symbol: string) {
  return `OKX:${symbol.replace("/USDT.P", "")}USDT.P`;
}
function getBase(symbol: string) {
  return symbol.replace("/USDT.P", "");
}

interface BubbleMeta {
  isBuy: boolean;
  size: "SMALL" | "MEDIUM" | "BIG";
  dotCount: 1 | 2 | 3;
  pctLabel: string;
  pctThreshold: string;
}
function parseBubble(signalType: string): BubbleMeta {
  const isBuy = signalType.endsWith("_BUY");
  const isBig = signalType.includes("_BIG_");
  const isMedium = signalType.includes("_MEDIUM_");
  const size: BubbleMeta["size"] = isBig ? "BIG" : isMedium ? "MEDIUM" : "SMALL";
  const dotCount: 1 | 2 | 3 = isBig ? 3 : isMedium ? 2 : 1;
  const pctLabel = isBig ? "топ 3%" : isMedium ? "топ 10%" : "топ 25%";
  const pctThreshold = isBig ? "P97" : isMedium ? "P90" : "P75";
  return { isBuy, size, dotCount, pctLabel, pctThreshold };
}

type DirFilter = "ALL" | "BUY" | "SELL";
type SizeFilter = "ALL" | "SMALL" | "MEDIUM" | "BIG";

export function BubbleFeed() {
  const { data, isLoading } = useQuery<SignalsResponse>({
    queryKey: ["bubble-feed"],
    queryFn: () => fetch("/api/signals?onlyAdr=true&limit=200").then(r => r.json()) as Promise<SignalsResponse>,
    refetchInterval: 10000,
  });

  const [hidden, setHidden] = useState<Set<number>>(loadHidden);
  const [dirFilter, setDirFilter] = useState<DirFilter>("ALL");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("ALL");

  const dismiss = useCallback((id: number) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.add(id);
      saveHidden(next);
      return next;
    });
  }, []);

  const restoreAll = useCallback(() => {
    const empty = new Set<number>();
    setHidden(empty);
    saveHidden(empty);
  }, []);

  const allSignals = (data?.signals ?? []).filter(s => BUBBLE_TYPES.has(s.signalType));
  const buyCount = allSignals.filter(s => s.signalType.endsWith("_BUY")).length;
  const sellCount = allSignals.filter(s => s.signalType.endsWith("_SELL")).length;
  const bigCount = allSignals.filter(s => s.signalType.includes("_BIG_")).length;

  const filtered = allSignals
    .filter(s => !hidden.has(s.id))
    .filter(s => dirFilter === "ALL" || s.signalType.endsWith(`_${dirFilter}`))
    .filter(s => sizeFilter === "ALL" || s.signalType.includes(`_${sizeFilter}_`));

  const hiddenCount = allSignals.length - allSignals.filter(s => !hidden.has(s.id)).length;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Header ── */}
      <div className="px-4 py-2.5 border-b border-border bg-card flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-widest text-foreground/80">ДНЕВНЫЕ ПУЗЫРИ ОБЪЁМА</span>
          {bigCount > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] px-1.5 py-0 h-4 font-mono">
              🔥 {bigCount} BIG
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp size={10} /> {buyCount}
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span className="flex items-center gap-1 text-red-400">
              <TrendingDown size={10} /> {sellCount}
            </span>
          </div>
          {hiddenCount > 0 && (
            <button onClick={restoreAll}
              className="text-[9px] text-muted-foreground hover:text-foreground font-mono transition-colors underline-offset-2 hover:underline">
              +{hiddenCount} скрыто
            </button>
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="LIVE" />
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="px-3 py-1.5 border-b border-border bg-card/50 flex items-center gap-2 flex-shrink-0">
        {/* Direction filter */}
        <div className="flex items-center rounded overflow-hidden border border-border text-[10px] font-mono">
          {(["ALL", "BUY", "SELL"] as DirFilter[]).map(f => (
            <button key={f}
              onClick={() => setDirFilter(f)}
              className={`px-2 py-0.5 transition-colors ${
                dirFilter === f
                  ? f === "BUY" ? "bg-emerald-500/20 text-emerald-400"
                    : f === "SELL" ? "bg-red-500/20 text-red-400"
                    : "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "BUY" ? "📈 BUY" : f === "SELL" ? "📉 SELL" : "ВСЕ"}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Size filter */}
        <div className="flex items-center rounded overflow-hidden border border-border text-[10px] font-mono">
          {(["ALL", "SMALL", "MEDIUM", "BIG"] as SizeFilter[]).map(f => (
            <button key={f}
              onClick={() => setSizeFilter(f)}
              className={`px-2.5 py-1 transition-colors flex items-center justify-center ${
                sizeFilter === f
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL" ? <span className="text-[10px]">ВСЕ</span>
                : <BubbleDots count={f === "SMALL" ? 1 : f === "MEDIUM" ? 2 : 3} isBuy={true} />}
            </button>
          ))}
        </div>

        <div className="ml-auto text-[9px] text-muted-foreground font-mono">
          {filtered.length} сигналов
        </div>
      </div>

      {/* ── Feed ── */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <div className="flex gap-1"><span className="w-3 h-3 rounded-full bg-muted-foreground/30 inline-block" /><span className="w-3 h-3 rounded-full bg-muted-foreground/30 inline-block" /><span className="w-3 h-3 rounded-full bg-muted-foreground/30 inline-block" /></div>
            <span className="font-mono text-[11px]">
              {allSignals.length === 0 ? "НЕТ ПУЗЫРЕЙ СЕГОДНЯ" : "НЕТ СОВПАДЕНИЙ С ФИЛЬТРОМ"}
            </span>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filtered.map(signal => {
              const meta = parseBubble(signal.signalType);
              const isBuy = meta.isBuy;
              const todayVol = signal.progressPct;

              // Intensity by size for border and background
              const borderL = isBuy
                ? meta.size === "BIG" ? "border-l-emerald-400" : meta.size === "MEDIUM" ? "border-l-emerald-500" : "border-l-emerald-600"
                : meta.size === "BIG" ? "border-l-red-400" : meta.size === "MEDIUM" ? "border-l-red-500" : "border-l-red-600";
              const rowBg = isBuy
                ? meta.size === "BIG" ? "bg-emerald-950/40 hover:bg-emerald-950/60" : "bg-emerald-950/20 hover:bg-emerald-950/40"
                : meta.size === "BIG" ? "bg-red-950/40 hover:bg-red-950/60" : "bg-red-950/20 hover:bg-red-950/40";
              const borderColor = isBuy
                ? meta.size === "BIG" ? "border-emerald-500/30" : "border-emerald-600/20"
                : meta.size === "BIG" ? "border-red-500/30" : "border-red-600/20";
              const accentColor = isBuy ? "text-emerald-400" : "text-red-400";
              const accentColorStrong = isBuy ? "text-emerald-300" : "text-red-300";

              const sizeBadgeCls = isBuy
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                : "border-red-500/40 text-red-400 bg-red-500/10";

              return (
                <div key={signal.id}
                  className={`relative rounded-md border border-l-4 transition-colors group ${borderL} ${borderColor} ${rowBg}`}
                >
                  {/* Main content */}
                  <div className="px-3 py-2.5">

                    {/* Row 1: symbol + direction + size + time */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <BubbleDots count={meta.dotCount} isBuy={meta.isBuy} />
                        <span className="font-bold text-sm tracking-tight">{getBase(signal.symbol)}</span>
                        <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">/USDT.P</span>

                        <Badge variant="outline"
                          className={`text-[9px] px-1.5 py-0 h-4 font-bold flex-shrink-0 ${sizeBadgeCls}`}>
                          {meta.size}
                        </Badge>

                        <div className={`flex items-center gap-1 text-[11px] font-bold flex-shrink-0 ${accentColor}`}>
                          {isBuy
                            ? <TrendingUp size={11} className="flex-shrink-0" />
                            : <TrendingDown size={11} className="flex-shrink-0" />
                          }
                          {isBuy ? "BUY" : "SELL"}
                        </div>

                        <span className="text-[9px] text-muted-foreground font-mono flex-shrink-0">{meta.pctLabel}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {format(new Date(signal.sentAt), "HH:mm")}
                        </span>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          onClick={() => dismiss(signal.id)}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: price + volumes + links */}
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <span className="text-foreground/70">
                        {formatPrice(signal.price)} <span className="text-muted-foreground">USDT</span>
                      </span>

                      <div className={`flex items-center gap-1 font-semibold ${accentColorStrong}`}>
                        <span className="text-muted-foreground font-normal">день:</span>
                        {formatVol(todayVol)}
                        <span className="text-muted-foreground font-normal">USDT</span>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>24ч:</span>
                        <span className="text-foreground/50">{formatVol(signal.volume24h)}</span>
                      </div>

                      <div className={`ml-auto flex items-center gap-0.5 font-mono text-[9px] font-semibold ${accentColor} flex-shrink-0`}>
                        {meta.pctThreshold}
                      </div>
                    </div>
                  </div>

                  {/* Hover links */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <a href={`https://www.tradingview.com/chart/?symbol=${getTVSymbol(signal.symbol)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[9px] text-sky-400 hover:text-sky-300 font-mono">
                      <ExternalLink size={8} /> TV
                    </a>
                    <a href={`https://www.okx.com/ru/trade-swap/${getOKXSlug(signal.symbol)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[9px] text-amber-400 hover:text-amber-300 font-mono">
                      <ExternalLink size={8} /> OKX
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
