import { useState, useCallback } from "react";
import { useGetCoins } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, TrendingDown, Eye, EyeOff, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function getTradingViewUrl(instId: string): string {
  // "GIGGLE-USDT-SWAP" → "OKX:GIGGLEUSDT.P"
  const base = instId.replace("-USDT-SWAP", "");
  return `https://www.tradingview.com/chart/?symbol=OKX:${base}USDT.P`;
}

function getOkxUrl(instId: string): string {
  // "GIGGLE-USDT-SWAP" → "https://www.okx.com/ru/trade-swap/giggle-usdt-swap"
  return `https://www.okx.com/ru/trade-swap/${instId.toLowerCase()}`;
}

const HIDDEN_KEY = "hidden_coin_ids";

function loadHiddenCoins(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function saveHiddenCoins(set: Set<string>) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...set]));
}

export function CoinsGrid() {
  const { data } = useGetCoins({ query: { refetchInterval: 10000 } });
  const [showSignaled, setShowSignaled] = useState(false);
  const [hiddenCoins, setHiddenCoins] = useState<Set<string>>(loadHiddenCoins);

  const hideCoin = useCallback((instId: string) => {
    setHiddenCoins(prev => {
      const next = new Set(prev);
      next.add(instId);
      saveHiddenCoins(next);
      return next;
    });
  }, []);

  const restoreHidden = useCallback(() => {
    setHiddenCoins(new Set());
    saveHiddenCoins(new Set());
  }, []);

  if (!data) {
    return (
      <div>
        <div className="h-6 mb-2 bg-muted/20 animate-pulse rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {[...Array(18)].map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-card/50 border-border" />
          ))}
        </div>
      </div>
    );
  }

  const allCoins = [...data.coins].sort((a, b) => {
    const rangeA = a.progressToHigh + a.progressToLow;
    const rangeB = b.progressToHigh + b.progressToLow;
    return rangeB - rangeA;
  });

  const signaledCoins = allCoins.filter(c => c.signalSentHigh || c.signalSentLow);
  const activeCoins = allCoins.filter(c => !c.signalSentHigh && !c.signalSentLow);
  const baseCoins = showSignaled ? allCoins : activeCoins;
  const visibleCoins = baseCoins.filter(c => !hiddenCoins.has(c.instId));
  const manuallyHiddenCount = baseCoins.filter(c => hiddenCoins.has(c.instId)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span><span className="text-foreground font-bold">{activeCoins.length}</span> активных</span>
          {signaledCoins.length > 0 && (
            <span><span className="text-primary font-bold">{signaledCoins.length}</span> отработали</span>
          )}
          <span>из {allCoins.length}</span>
          {manuallyHiddenCount > 0 && (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              onClick={restoreHidden}
            >
              +{manuallyHiddenCount} скрыто
            </button>
          )}
        </div>

        {signaledCoins.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSignaled(v => !v)}
            className="font-mono text-[10px] h-6 px-2 gap-1.5 border-border"
            data-testid="button-filter-signaled"
          >
            {showSignaled
              ? <><EyeOff className="w-3 h-3" /> Скрыть отработавшие</>
              : <><Eye className="w-3 h-3" /> Показать отработавшие ({signaledCoins.length})</>
            }
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {visibleCoins.map((coin) => {
          const isSignaled = coin.signalSentHigh || coin.signalSentLow;
          // Combined range progress = TradingView "Current%" metric
          const rangeProgress = coin.progressToHigh + coin.progressToLow;
          const isHighDominant = coin.progressToHigh >= coin.progressToLow;
          const rangeBarWidth = Math.min(100, rangeProgress);
          const rangeColor = isSignaled
            ? 'bg-primary'
            : isHighDominant ? 'bg-neon-green' : 'bg-neon-red';

          return (
            <Card
              key={coin.instId}
              data-testid={`card-coin-${coin.instId}`}
              className={`relative p-2 border-border bg-card hover:border-primary/40 transition-colors flex flex-col gap-1.5 group ${isSignaled ? 'opacity-50' : ''}`}
            >
              {/* Hide button — appears on hover */}
              <button
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground z-10"
                onClick={() => hideCoin(coin.instId)}
                title="Скрыть"
              >
                <X size={10} />
              </button>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-bold text-[11px] truncate leading-tight">
                    {coin.symbol.replace("/USDT.P", "")}
                  </span>
                  {isSignaled && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[10px]">
                        Сигнал отправлен ({coin.signalSentHigh ? 'HIGH' : 'LOW'})
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="text-right flex-shrink-0 pr-3">
                  <div className="font-mono text-[10px] leading-tight">
                    {coin.currentPrice < 1 ? coin.currentPrice.toFixed(5) : coin.currentPrice.toFixed(2)}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground leading-tight">{coin.adrPct.toFixed(1)}%</div>
                </div>
              </div>

              {/* Combined range bar — mirrors TradingView "Current%" */}
              <div>
                <div className="flex justify-between text-[9px] font-mono mb-0.5">
                  <span className="text-muted-foreground flex items-center gap-0.5">
                    {isHighDominant
                      ? <TrendingUp className="w-2.5 h-2.5 text-neon-green" />
                      : <TrendingDown className="w-2.5 h-2.5 text-neon-red" />
                    }
                    {isHighDominant ? 'HIGH' : 'LOW'}
                  </span>
                  <span className={
                    isSignaled ? "text-primary font-bold"
                    : rangeProgress >= 95 ? (isHighDominant ? "text-neon-green font-bold" : "text-neon-red font-bold")
                    : "text-foreground"
                  }>
                    {rangeProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${rangeColor}`}
                    style={{ width: `${rangeBarWidth}%` }}
                  />
                </div>
              </div>

              {/* H / L breakdown */}
              <div className="flex gap-2 text-[9px] font-mono text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <TrendingUp className="w-2 h-2 text-neon-green/60" />
                  <span className="text-neon-green/80">{coin.progressToHigh.toFixed(0)}%</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <TrendingDown className="w-2 h-2 text-neon-red/60" />
                  <span className="text-neon-red/80">{coin.progressToLow.toFixed(0)}%</span>
                </span>
              </div>

              {/* Footer — static info + hover links */}
              <div className="border-t border-border pt-1">
                {/* Static: volume + ADR HIGH level */}
                <div className="text-[9px] font-mono text-muted-foreground flex justify-between group-hover:opacity-0 transition-opacity">
                  <span>{(coin.volume24h / 1_000_000).toFixed(0)}M</span>
                  <span className="truncate">
                    {coin.adrHighLevel < 1 ? coin.adrHighLevel.toFixed(4) : coin.adrHighLevel.toFixed(2)}
                  </span>
                </div>
                {/* On hover: TradingView + OKX links */}
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <a
                    href={getTradingViewUrl(coin.instId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-0.5 text-[9px] font-mono bg-muted/80 hover:bg-primary/20 hover:text-primary border border-border rounded px-1 py-0.5 transition-colors truncate"
                    title={`TradingView · ${coin.symbol}`}
                    onClick={e => e.stopPropagation()}
                  >
                    📈 <span className="hidden sm:inline">TV</span>
                  </a>
                  <a
                    href={getOkxUrl(coin.instId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-0.5 text-[9px] font-mono bg-muted/80 hover:bg-amber-500/20 hover:text-amber-400 border border-border rounded px-1 py-0.5 transition-colors truncate"
                    title={`OKX · ${coin.symbol}`}
                    onClick={e => e.stopPropagation()}
                  >
                    🏦 <span className="hidden sm:inline">OKX</span>
                  </a>
                </div>
              </div>
            </Card>
          );
        })}

        {visibleCoins.length === 0 && (
          <div className="col-span-6 py-10 text-center text-muted-foreground font-mono text-[10px]">
            Все монеты скрыты или отработали. Сброс в 00:00 UTC (03:00 МСК)
          </div>
        )}
      </div>
    </div>
  );
}
