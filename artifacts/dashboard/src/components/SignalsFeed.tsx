import { useGetSignals } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function SignalsFeed() {
  const { data } = useGetSignals({ limit: 50 }, { query: { refetchInterval: 10000 } });

  return (
    <div className="flex flex-col h-full border border-border bg-card rounded-md overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border bg-muted/20 flex items-center justify-between">
        <h3 className="text-[10px] font-bold tracking-wider">RECENT SIGNALS</h3>
        <Badge variant="outline" className="font-mono text-[9px] bg-background py-0 h-4 px-1.5">LIVE</Badge>
      </div>

      <ScrollArea className="flex-1">
        {!data ? (
          <div className="p-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        ) : data.signals.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground font-mono text-[10px]">
            NO SIGNALS YET
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.signals.map((signal) => {
              const isHigh = signal.signalType === "ADR_HIGH";
              const timeFormatted = format(new Date(signal.sentAt), "dd/MM, HH:mm:ss");

              return (
                <div key={signal.id} className="px-2.5 py-1.5 hover:bg-muted/10 transition-colors" data-testid={`signal-item-${signal.id}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isHigh ? 'bg-neon-green' : 'bg-neon-red'}`} />
                      <span className="font-bold text-[11px]">{signal.symbol}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] py-0 px-1 h-3.5 font-mono leading-none ${
                          isHigh ? 'text-neon-green border-neon-green/30' : 'text-neon-red border-neon-red/30'
                        }`}
                      >
                        {isHigh ? 'HIGH' : 'LOW'}
                      </Badge>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-mono">{timeFormatted}</span>
                  </div>

                  <div className="flex gap-3 text-[10px] font-mono text-muted-foreground ml-3">
                    <span>{signal.price.toFixed(4)}</span>
                    <span className={isHigh ? 'text-neon-green' : 'text-neon-red'}>
                      {isHigh ? '+' : '-'}{signal.adrPct.toFixed(2)}%
                    </span>
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
