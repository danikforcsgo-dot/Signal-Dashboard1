import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { X, ExternalLink } from "lucide-react";

const STORAGE_KEY = "hidden_bubble_ids";

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

function formatVol(val: number): string {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return val.toFixed(0);
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(6);
  return price.toFixed(8);
}

function parseBubble(signalType: string): {
  size: "SMALL" | "MEDIUM" | "BIG";
  direction: "BUY" | "SELL";
  bubbles: string;
  sizeLabel: string;
  pctLabel: string;
  rowBg: string;
  dirColor: string;
  sizeColor: string;
  dirEmoji: string;
} {
  const isBuy = signalType.endsWith("_BUY");
  const isBig = signalType.includes("_BIG_");
  const isMedium = signalType.includes("_MEDIUM_");

  if (isBig) return {
    size: "BIG", direction: isBuy ? "BUY" : "SELL",
    bubbles: "🫧🫧🫧", sizeLabel: "BIG", pctLabel: "топ 3%",
    rowBg: isBuy ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20",
    dirColor: isBuy ? "text-emerald-400" : "text-rose-400",
    sizeColor: isBuy ? "text-emerald-400 border-emerald-400/30" : "text-rose-400 border-rose-400/30",
    dirEmoji: isBuy ? "📈" : "📉",
  };
  if (isMedium) return {
    size: "MEDIUM", direction: isBuy ? "BUY" : "SELL",
    bubbles: "🫧🫧", sizeLabel: "MEDIUM", pctLabel: "топ 10%",
    rowBg: isBuy ? "bg-violet-500/10 border-violet-500/20" : "bg-violet-700/10 border-violet-700/20",
    dirColor: isBuy ? "text-violet-400" : "text-violet-500",
    sizeColor: isBuy ? "text-violet-400 border-violet-400/30" : "text-violet-500 border-violet-500/30",
    dirEmoji: isBuy ? "📈" : "📉",
  };
  return {
    size: "SMALL", direction: isBuy ? "BUY" : "SELL",
    bubbles: "🫧", sizeLabel: "SMALL", pctLabel: "топ 25%",
    rowBg: isBuy ? "bg-sky-500/10 border-sky-500/20" : "bg-sky-700/10 border-sky-700/20",
    dirColor: isBuy ? "text-sky-400" : "text-sky-600",
    sizeColor: isBuy ? "text-sky-400 border-sky-400/30" : "text-sky-600 border-sky-600/30",
    dirEmoji: isBuy ? "📈" : "📉",
  };
}

function getOKXSlug(symbol: string) {
  return symbol.replace("/USDT.P", "").toLowerCase() + "-usdt-swap";
}
function getTVSymbol(symbol: string) {
  const base = symbol.replace("/USDT.P", "");
  return `OKX:${base}USDT.P`;
}

export function BubbleFeed() {
  const { data } = useQuery<SignalsResponse>({
    queryKey: ["bubble-feed"],
    queryFn: () => fetch("/api/signals?onlyAdr=true&limit=200").then(r => r.json()) as Promise<SignalsResponse>,
    refetchInterval: 10000,
  });

  const [hidden, setHidden] = useState<Set<number>>(loadHidden);

  const dismiss = useCallback((id: number) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.add(id);
      saveHidden(next);
      return next;
    });
  }, []);

  const BUBBLE_TYPES = new Set([
    "VOL_BUBBLE_SMALL_BUY", "VOL_BUBBLE_SMALL_SELL",
    "VOL_BUBBLE_MEDIUM_BUY", "VOL_BUBBLE_MEDIUM_SELL",
    "VOL_BUBBLE_BIG_BUY", "VOL_BUBBLE_BIG_SELL",
  ]);

  const allSignals = (data?.signals ?? []).filter(s => BUBBLE_TYPES.has(s.signalType));
  const visibleSignals = allSignals.filter(s => !hidden.has(s.id));
  const hiddenCount = allSignals.length - visibleSignals.length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 border-b border-border bg-muted/20 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold tracking-wider">ПУЗЫРИ ОБЪЁМА</h3>
          <Badge variant="outline" className="font-mono text-[9px] bg-background py-0 h-4 px-1.5">
            {allSignals.length} сегодня
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {hiddenCount > 0 && (
            <button
              className="text-[9px] text-muted-foreground hover:text-foreground font-mono transition-colors"
              onClick={() => { setHidden(new Set()); saveHidden(new Set()); }}
            >
              +{hiddenCount} скрыто
            </button>
          )}
          <Badge variant="outline" className="font-mono text-[9px] bg-background py-0 h-4 px-1.5">LIVE</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {!data ? (
          <div className="p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/20 animate-pulse rounded-md" />
            ))}
          </div>
        ) : visibleSignals.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground font-mono text-[11px]">
            {allSignals.length === 0 ? "НЕТ ПУЗЫРЕЙ СЕГОДНЯ" : "ВСЕ СКРЫТЫ"}
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {visibleSignals.map(signal => {
              const meta = parseBubble(signal.signalType);
              const timeFormatted = format(new Date(signal.sentAt), "dd/MM, HH:mm:ss");
              const vol5m = signal.progressPct;

              return (
                <div
                  key={signal.id}
                  className={`rounded-md border px-3 py-2 hover:bg-muted/10 transition-colors group ${meta.rowBg}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{meta.bubbles}</span>
                      <span className="font-bold text-[13px]">{signal.symbol}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] py-0 px-1.5 h-4 font-mono leading-none ${meta.sizeColor}`}
                      >
                        {meta.sizeLabel}
                      </Badge>
                      <span className={`text-[11px] font-bold ${meta.dirColor}`}>
                        {meta.dirEmoji} {meta.direction}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono">{meta.pctLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground font-mono">{timeFormatted}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        onClick={() => dismiss(signal.id)}
                        title="Скрыть"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground ml-8">
                    <span className="text-foreground/80">💰 {formatPrice(signal.price)}</span>
                    <span className={meta.dirColor}>
                      день: {formatVol(vol5m)} USDT
                    </span>
                    <span>24ч: {formatVol(signal.volume24h)}</span>
                    <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`https://www.tradingview.com/chart/?symbol=${getTVSymbol(signal.symbol)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-0.5 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink size={9} /> TV
                      </a>
                      <a
                        href={`https://www.okx.com/ru/trade-swap/${getOKXSlug(signal.symbol)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-0.5 text-amber-400 hover:text-amber-300"
                      >
                        <ExternalLink size={9} /> OKX
                      </a>
                    </div>
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
