import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

interface GainerEntry {
  instId: string;
  symbol: string;
  change24hPct: number;
  currentPrice: number;
  volume24h: number;
  updatedAt: string;
}

interface GainersResponse {
  gainers: GainerEntry[];
  total: number;
  updatedAt: string | null;
}

function getTradingViewUrl(instId: string): string {
  const base = instId.replace("-USDT-SWAP", "");
  return `https://www.tradingview.com/chart/?symbol=OKX:${base}USDT.P`;
}

function formatVol(val: number): string {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "B";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(0) + "K";
  return val.toFixed(0);
}

function formatPrice(p: number): string {
  if (p < 0.0001) return p.toExponential(2);
  if (p < 1) return p.toFixed(5);
  if (p < 10) return p.toFixed(3);
  return p.toFixed(2);
}

export function GainersList() {
  const { data, isLoading } = useQuery<GainersResponse>({
    queryKey: ["gainers"],
    queryFn: () => fetch("/api/gainers").then(r => r.json()) as Promise<GainersResponse>,
    refetchInterval: 60_000,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-neon-green">
          <TrendingUp className="w-3.5 h-3.5" />
          ГЕЙНЕРЫ 24Ч
        </div>
        {data && (
          <span className="text-[10px] font-mono text-muted-foreground">
            +50% · {data.total} монет
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-1 p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        )}

        {data && data.gainers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <TrendingUp className="w-5 h-5 opacity-30" />
            <span className="text-[11px] font-mono">Нет монет +50% за 24ч</span>
          </div>
        )}

        {data && data.gainers.length > 0 && (
          <div className="divide-y divide-border/40">
            {data.gainers.map((g, idx) => {
              const ticker = g.symbol.replace("/USDT.P", "");
              const intensity = Math.min(g.change24hPct, 500) / 500;
              return (
                <a
                  key={g.instId}
                  href={getTradingViewUrl(g.instId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-neon-green/5 transition-colors group"
                >
                  <span
                    className="text-[10px] font-mono w-4 text-right flex-shrink-0"
                    style={{ color: `rgba(34,197,94,${0.3 + intensity * 0.7})` }}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-bold text-[11px] w-16 truncate flex-shrink-0">
                    {ticker}
                  </span>
                  <span
                    className="font-mono text-[11px] font-bold flex-shrink-0 ml-auto"
                    style={{ color: `rgba(34,197,94,${0.6 + intensity * 0.4})` }}
                  >
                    +{g.change24hPct.toFixed(1)}%
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground w-14 text-right flex-shrink-0">
                    {formatPrice(g.currentPrice)}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground w-10 text-right flex-shrink-0 hidden sm:block">
                    {formatVol(g.volume24h)}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
