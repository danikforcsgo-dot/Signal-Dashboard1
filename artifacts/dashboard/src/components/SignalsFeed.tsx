import { useGetSignals } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function SignalsFeed() {
  const { data } = useGetSignals({ limit: 50 }, { query: { refetchInterval: 10000 } });

  return (
    <div className="flex flex-col h-full border border-border bg-card rounded-md overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wider">RECENT SIGNALS</h3>
        <Badge variant="outline" className="font-mono text-[10px] bg-background">LIVE FEED</Badge>
      </div>
      
      <ScrollArea className="flex-1">
        {!data ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        ) : data.signals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-mono text-sm">
            NO SIGNALS FOUND
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.signals.map((signal) => {
              const isHigh = signal.signalType === "ADR_HIGH";
              const timeFormatted = format(new Date(signal.sentAt), "dd/MM/yyyy, HH:mm:ss 'UTC'");
              
              return (
                <div key={signal.id} className="p-3 hover:bg-muted/10 transition-colors flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isHigh ? 'bg-neon-green' : 'bg-neon-red'}`} />
                      <span className="font-bold text-sm">{signal.symbol}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] py-0 px-1.5 h-4 font-mono ${
                          isHigh 
                            ? 'text-neon-green border-neon-green/30' 
                            : 'text-neon-red border-neon-red/30'
                        }`}
                      >
                        {isHigh ? 'ADR HIGH' : 'ADR LOW'}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{timeFormatted}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[9px]">PRICE</span>
                      <span>{signal.price.toFixed(4)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[9px]">ADR%</span>
                      <span className={isHigh ? 'text-neon-green' : 'text-neon-red'}>
                        {isHigh ? '+' : '-'}{signal.adrPct.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-muted-foreground text-[9px]">VOL 24H</span>
                      <span>{(signal.volume24h / 1000000).toFixed(1)}M</span>
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