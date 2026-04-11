import { useGetSignals } from "@workspace/api-client-react";
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

function getSignalMeta(type: string): {
  dot: string;
  badge: string;
  label: string;
  priceColor: string;
  isVol: boolean;
} {
  switch (type) {
    case "ADR_HIGH":
      return { dot: "bg-neon-green", badge: "text-neon-green border-neon-green/30", label: "ADR HIGH",   priceColor: "text-neon-green", isVol: false };
    case "ADR_LOW":
      return { dot: "bg-neon-red",   badge: "text-neon-red border-neon-red/30",     label: "ADR LOW",    priceColor: "text-neon-red",   isVol: false };
    case "VOL_SPIKE_UP":
      return { dot: "bg-neon-green", badge: "text-neon-green border-neon-green/30", label: "🔊 покупки", priceColor: "text-neon-green", isVol: true };
    case "VOL_SPIKE_DOWN":
      return { dot: "bg-neon-red",   badge: "text-neon-red border-neon-red/30",     label: "🔊 продажи", priceColor: "text-neon-red",   isVol: true };
    case "VOL_BREAKOUT_HIGH":
      return { dot: "bg-neon-green", badge: "text-neon-green border-neon-green/30", label: "🚀 HIGH",    priceColor: "text-neon-green", isVol: true };
    case "VOL_BREAKOUT_LOW":
      return { dot: "bg-neon-red",   badge: "text-neon-red border-neon-red/30",     label: "🚀 LOW",     priceColor: "text-neon-red",   isVol: true };
    default:
      return { dot: "bg-muted",      badge: "text-muted-foreground border-border",  label: type,         priceColor: "text-muted-foreground", isVol: false };
  }
}

export function SignalsFeed() {
  const { data } = useGetSignals({ limit: 50 }, { query: { refetchInterval: 10000 } });
  const [hidden, setHidden] = useState<Set<number>>(loadHidden);

  const dismiss = useCallback((id: number) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.add(id);
      saveHidden(next);
      return next;
    });
  }, []);

  const visibleSignals = data?.signals.filter(s => !hidden.has(s.id)) ?? [];
  const hiddenCount = data ? data.signals.length - visibleSignals.length : 0;

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
            {data.signals.length === 0 ? "NO SIGNALS YET" : "ВСЕ СКРЫТЫ"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleSignals.map((signal) => {
              const meta = getSignalMeta(signal.signalType);
              const timeFormatted = format(new Date(signal.sentAt), "dd/MM, HH:mm:ss");
              const { isVol } = meta;

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
                        {isVol
                          ? `${meta.label}${signal.progressPct.toFixed(1)}x`
                          : meta.label
                        }
                      </Badge>
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
                    {isVol ? (
                      <span className={meta.priceColor}>
                        vol {(signal.volume24h / 1_000_000).toFixed(0)}M
                      </span>
                    ) : (
                      <span className={meta.priceColor}>
                        {signal.signalType === "ADR_HIGH" ? '+' : '-'}{signal.adrPct.toFixed(2)}%
                      </span>
                    )}
                    <span>{(signal.volume24h / 1_000_000).toFixed(1)}M</span>
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
