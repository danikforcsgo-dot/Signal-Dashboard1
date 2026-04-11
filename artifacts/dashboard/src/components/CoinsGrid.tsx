import { useGetCoins } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function CoinsGrid() {
  const { data } = useGetCoins({ query: { refetchInterval: 10000 } });

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="h-40 animate-pulse bg-card/50 border-border" />
        ))}
      </div>
    );
  }

  // Sort coins by closest to either ADR HIGH or ADR LOW (highest progress)
  const sortedCoins = [...data.coins].sort((a, b) => {
    const maxA = Math.max(a.progressToHigh, a.progressToLow);
    const maxB = Math.max(b.progressToHigh, b.progressToLow);
    return maxB - maxA;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedCoins.map((coin) => (
        <Card key={coin.instId} className="p-4 border-border bg-card hover:border-primary/50 transition-colors flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base flex items-center gap-2">
              {coin.symbol}
              {(coin.signalSentHigh || coin.signalSentLow) && (
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Signal already sent ({coin.signalSentHigh ? 'HIGH' : 'LOW'})
                  </TooltipContent>
                </Tooltip>
              )}
            </h4>
            <div className="text-right">
              <div className="font-mono text-sm">{coin.currentPrice.toFixed(4)}</div>
              <div className={`font-mono text-xs ${coin.adrPct >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                {coin.adrPct >= 0 ? '+' : ''}{coin.adrPct.toFixed(2)}% ADR
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-neon-green" /> TO HIGH
                </span>
                <span className="text-neon-green">{coin.progressToHigh.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-green transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, coin.progressToHigh))}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-neon-red" /> TO LOW
                </span>
                <span className="text-neon-red">{coin.progressToLow.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-red transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, coin.progressToLow))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-2 border-t border-border flex justify-between items-center text-xs font-mono text-muted-foreground">
            <span>VOL: {(coin.volume24h / 1000000).toFixed(1)}M</span>
            <span>LVL: {coin.adrHighLevel.toFixed(4)} / {coin.adrLowLevel.toFixed(4)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}