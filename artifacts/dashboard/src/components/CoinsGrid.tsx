import { useState } from "react";
import { useGetCoins } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function CoinsGrid() {
  const { data } = useGetCoins({ query: { refetchInterval: 10000 } });
  const [showSignaled, setShowSignaled] = useState(false);

  if (!data) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-card/50 border-border" />
          ))}
        </div>
      </div>
    );
  }

  const allCoins = [...data.coins].sort((a, b) => {
    const maxA = Math.max(a.progressToHigh, a.progressToLow);
    const maxB = Math.max(b.progressToHigh, b.progressToLow);
    return maxB - maxA;
  });

  const signaledCoins = allCoins.filter(c => c.signalSentHigh || c.signalSentLow);
  const activeCoins = allCoins.filter(c => !c.signalSentHigh && !c.signalSentLow);
  const visibleCoins = showSignaled ? allCoins : activeCoins;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>
            <span className="text-foreground font-bold">{activeCoins.length}</span> активных
          </span>
          {signaledCoins.length > 0 && (
            <span>
              <span className="text-primary font-bold">{signaledCoins.length}</span> отработали
            </span>
          )}
          <span>из {allCoins.length} монет</span>
        </div>

        {signaledCoins.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSignaled(v => !v)}
            className="font-mono text-xs gap-2 border-border"
            data-testid="button-filter-signaled"
          >
            {showSignaled ? (
              <><EyeOff className="w-3.5 h-3.5" /> Скрыть отработавшие</>
            ) : (
              <><Eye className="w-3.5 h-3.5" /> Показать отработавшие ({signaledCoins.length})</>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleCoins.map((coin) => {
          const isSignaled = coin.signalSentHigh || coin.signalSentLow;
          return (
            <Card
              key={coin.instId}
              data-testid={`card-coin-${coin.instId}`}
              className={`p-4 border-border bg-card hover:border-primary/50 transition-colors flex flex-col gap-3 ${isSignaled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base flex items-center gap-2">
                  {coin.symbol}
                  {isSignaled && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Сигнал отправлен ({coin.signalSentHigh ? 'HIGH' : 'LOW'})
                      </TooltipContent>
                    </Tooltip>
                  )}
                </h4>
                <div className="text-right">
                  <div className="font-mono text-sm">{coin.currentPrice.toFixed(4)}</div>
                  <div className="font-mono text-xs text-neon-green">
                    +{coin.adrPct.toFixed(2)}% ADR
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-neon-green" /> TO HIGH
                    </span>
                    <span className={coin.signalSentHigh ? "text-primary" : "text-neon-green"}>
                      {coin.progressToHigh.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${coin.signalSentHigh ? 'bg-primary' : 'bg-neon-green'}`}
                      style={{ width: `${Math.min(100, Math.max(0, coin.progressToHigh))}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-neon-red" /> TO LOW
                    </span>
                    <span className={coin.signalSentLow ? "text-primary" : "text-neon-red"}>
                      {coin.progressToLow.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${coin.signalSentLow ? 'bg-primary' : 'bg-neon-red'}`}
                      style={{ width: `${Math.min(100, Math.max(0, coin.progressToLow))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-2 border-t border-border flex justify-between items-center text-xs font-mono text-muted-foreground">
                <span>VOL: {(coin.volume24h / 1_000_000).toFixed(1)}M</span>
                <span>LVL: {coin.adrHighLevel.toFixed(4)} / {coin.adrLowLevel.toFixed(4)}</span>
              </div>
            </Card>
          );
        })}

        {visibleCoins.length === 0 && (
          <div className="col-span-4 py-16 text-center text-muted-foreground font-mono text-sm">
            Все монеты отработали на сегодня.<br />
            Сброс в 00:00 UTC (03:00 Москва)
          </div>
        )}
      </div>
    </div>
  );
}
