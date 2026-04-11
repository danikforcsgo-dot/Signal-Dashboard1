import { useState } from "react";
import { useGetCoins } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function CoinsGrid() {
  const { data } = useGetCoins({ query: { refetchInterval: 10000 } });
  const [showSignaled, setShowSignaled] = useState(false);

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

  const allCoins = [...data.coins].sort((a, b) =>
    Math.max(b.progressToHigh, b.progressToLow) - Math.max(a.progressToHigh, a.progressToLow)
  );

  const signaledCoins = allCoins.filter(c => c.signalSentHigh || c.signalSentLow);
  const activeCoins = allCoins.filter(c => !c.signalSentHigh && !c.signalSentLow);
  const visibleCoins = showSignaled ? allCoins : activeCoins;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span><span className="text-foreground font-bold">{activeCoins.length}</span> активных</span>
          {signaledCoins.length > 0 && (
            <span><span className="text-primary font-bold">{signaledCoins.length}</span> отработали</span>
          )}
          <span>из {allCoins.length}</span>
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
          return (
            <Card
              key={coin.instId}
              data-testid={`card-coin-${coin.instId}`}
              className={`p-2 border-border bg-card hover:border-primary/40 transition-colors flex flex-col gap-1.5 ${isSignaled ? 'opacity-50' : ''}`}
            >
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
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-[10px] leading-tight">{coin.currentPrice < 1 ? coin.currentPrice.toFixed(5) : coin.currentPrice.toFixed(2)}</div>
                  <div className="font-mono text-[9px] text-neon-green leading-tight">{coin.adrPct.toFixed(1)}%</div>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <div className="flex justify-between text-[9px] font-mono mb-0.5">
                    <span className="text-muted-foreground flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5 text-neon-green" /> H
                    </span>
                    <span className={coin.signalSentHigh ? "text-primary" : "text-neon-green"}>{coin.progressToHigh.toFixed(0)}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${coin.signalSentHigh ? 'bg-primary' : 'bg-neon-green'}`}
                      style={{ width: `${Math.min(100, Math.max(0, coin.progressToHigh))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-mono mb-0.5">
                    <span className="text-muted-foreground flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5 text-neon-red" /> L
                    </span>
                    <span className={coin.signalSentLow ? "text-primary" : "text-neon-red"}>{coin.progressToLow.toFixed(0)}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${coin.signalSentLow ? 'bg-primary' : 'bg-neon-red'}`}
                      style={{ width: `${Math.min(100, Math.max(0, coin.progressToLow))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-muted-foreground border-t border-border pt-1 flex justify-between">
                <span>{(coin.volume24h / 1_000_000).toFixed(0)}M</span>
                <span className="truncate">{coin.adrHighLevel < 1 ? coin.adrHighLevel.toFixed(4) : coin.adrHighLevel.toFixed(2)}</span>
              </div>
            </Card>
          );
        })}

        {visibleCoins.length === 0 && (
          <div className="col-span-6 py-10 text-center text-muted-foreground font-mono text-[10px]">
            Все монеты отработали на сегодня. Сброс в 00:00 UTC (03:00 МСК)
          </div>
        )}
      </div>
    </div>
  );
}
