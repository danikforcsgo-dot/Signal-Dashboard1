import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "hidden_signal_ids";

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

function getSignalMeta(type: string): {
  dot: string;
  badge: string;
  label: string;
  priceColor: string;
  isVol: boolean;
  isBubble: boolean;
} {
  switch (type) {
    case "ADR_HIGH":
      return { dot: "bg-neon-green", badge: "text-neon-green border-neon-green/30", label: "ADR HIGH", priceColor: "text-neon-green", isVol: false, isBubble: false };
    case "ADR_LOW":
      return { dot: "bg-neon-red", badge: "text-neon-red border-neon-red/30", label: "ADR LOW", priceColor: "text-neon-red", isVol: false, isBubble: false };
    case "VOL_SPIKE_UP":
      return { dot: "bg-amber-400", badge: "text-amber-400 border-amber-400/30", label: "VOL ▲", priceColor: "text-amber-400", isVol: true, isBubble: false };
    case "VOL_SPIKE_DOWN":
      return { dot: "bg-amber-600", badge: "text-amber-600 border-amber-600/30", label: "VOL ▼", priceColor: "text-amber-600", isVol: true, isBubble: false };
    case "VOL_BREAKOUT_HIGH":
      return { dot: "bg-amber-300", badge: "text-amber-300 border-amber-300/30", label: "VOL↑ ADR", priceColor: "text-amber-300", isVol: true, isBubble: false };
    case "VOL_BREAKOUT_LOW":
      return { dot: "bg-amber-500", badge: "text-amber-500 border-amber-500/30", label: "VOL↓ ADR", priceColor: "text-amber-500", isVol: true, isBubble: false };
    // ── Volume Bubbles (progressPct stores 5m volume in USD) ──
    case "VOL_BUBBLE_SMALL_BUY":
      return { dot: "bg-sky-400", badge: "text-sky-400 border-sky-400/30", label: "🫧 S·BUY", priceColor: "text-sky-400", isVol: true, isBubble: true };
    case "VOL_BUBBLE_SMALL_SELL":
      return { dot: "bg-sky-600", badge: "text-sky-600 border-sky-600/30", label: "🫧 S·SELL", priceColor: "text-sky-600", isVol: true, isBubble: true };
    case "VOL_BUBBLE_MEDIUM_BUY":
      return { dot: "bg-violet-400", badge: "text-violet-400 border-violet-400/30", label: "🫧🫧 M·BUY", priceColor: "text-violet-400", isVol: true, isBubble: true };
    case "VOL_BUBBLE_MEDIUM_SELL":
      return { dot: "bg-violet-600", badge: "text-violet-600 border-violet-600/30", label: "🫧🫧 M·SELL", priceColor: "text-violet-600", isVol: true, isBubble: true };
    case "VOL_BUBBLE_BIG_BUY":
      return { dot: "bg-emerald-400", badge: "text-emerald-400 border-emerald-400/30", label: "🫧🫧🫧 BIG·BUY", priceColor: "text-emerald-400", isVol: true, isBubble: true };
    case "VOL_BUBBLE_BIG_SELL":
      return { dot: "bg-rose-500", badge: "text-rose-500 border-rose-500/30", label: "🫧🫧🫧 BIG·SELL", priceColor: "text-rose-500", isVol: true, isBubble: true };
    default:
      return { dot: "bg-muted", badge: "text-muted-foreground border-border", label: type, priceColor: "text-muted-foreground", isVol: false, isBubble: false };
  }
}

export function SignalsFeed() {
  const { data } = useQuery<SignalsResponse>({
    queryKey: ["signals-feed"],
    queryFn: () => fetch("/api/signals?onlyAdr=true&limit=100").then(r => r.json()) as Promise<SignalsResponse>,
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

  const allSignals = data?.signals ?? [];
  const visibleSignals = allSignals.filter(s => !hidden.has(s.id));
  const hiddenCount = allSignals.length - visibleSignals.length;

  return (
    <div className="flex flex-col h-full border border-border bg-card rounded-md overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border bg-muted/20 flex items-center justify-between">
        <h3 className="text-[10px] font-bold tracking-wider">RECENT SIGNALS</h3>
        <div className="flex items-center gap-1.5">
          {hiddenCount > 0 && (
            <button
              className="text-[9px] text-muted-foreground hover:text-foreground font-mono transition-colors"
              onClick={() => {
                setHidden(new Set());
                saveHidden(new Set());
              }}
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        ) : visibleSignals.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground font-mono text-[10px]">
            {allSignals.length === 0 ? "NO SIGNALS YET" : "ВСЕ СКРЫТЫ"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleSignals.map((signal) => {
              const meta = getSignalMeta(signal.signalType);
              const timeFormatted = format(new Date(signal.sentAt), "dd/MM, HH:mm:ss");

              return (
                <div key={signal.id} className="px-2.5 py-1.5 hover:bg-muted/10 transition-colors group" data-testid={`signal-item-${signal.id}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                      <span className="font-bold text-[11px]">{signal.symbol}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] py-0 px-1 h-3.5 font-mono leading-none ${meta.badge}`}
                      >
                        {meta.label}
                      </Badge>
                      {meta.isVol && (
                        <span className={`text-[9px] font-mono font-bold ${meta.priceColor}`}>
                          ×{signal.progressPct.toFixed(1)}
                        </span>
                      )}
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

                  <div className="flex gap-3 text-[10px] font-mono text-muted-foreground ml-3">
                    <span>{signal.price < 1 ? signal.price.toFixed(5) : signal.price.toFixed(2)}</span>
                    {meta.isBubble ? (
                      <span className={meta.priceColor}>
                        5m: {signal.progressPct >= 1_000_000
                          ? (signal.progressPct / 1_000_000).toFixed(1) + "M"
                          : signal.progressPct >= 1_000
                          ? (signal.progressPct / 1_000).toFixed(0) + "K"
                          : signal.progressPct.toFixed(0)} USDT
                      </span>
                    ) : meta.isVol ? (
                      <span className={meta.priceColor}>×{signal.progressPct.toFixed(1)}</span>
                    ) : (
                      <span className={meta.priceColor}>
                        {signal.signalType === "ADR_HIGH" ? "+" : "-"}{signal.adrPct.toFixed(2)}%
                      </span>
                    )}
                    <span>{(signal.volume24h / 1_000_000).toFixed(1)}M 24h</span>
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
