import { useGetSignalStats } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, Target } from "lucide-react";

export function StatsRow() {
  const { data: stats } = useGetSignalStats({ query: { refetchInterval: 10000 } });

  if (!stats) {
    return <div className="grid grid-cols-4 gap-2 h-14 animate-pulse bg-card/50" />;
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      <Card className="px-3 py-2 flex items-center justify-between border-border bg-card">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground">TOTAL</div>
          <div className="text-xl font-mono font-bold leading-tight">{stats.totalSignals}</div>
        </div>
        <Activity className="w-4 h-4 opacity-20" />
      </Card>

      <Card className="px-3 py-2 flex items-center justify-between border-border bg-card">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground">СЕГОДНЯ</div>
          <div className="text-xl font-mono font-bold leading-tight text-primary">{stats.signalsToday}</div>
        </div>
        <Target className="w-4 h-4 opacity-20" />
      </Card>

      <Card className="px-3 py-2 flex items-center justify-between border-border bg-card">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-neon-green">ADR HIGH</div>
          <div className="text-xl font-mono font-bold leading-tight text-neon-green">{stats.signalsHigh}</div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-neon-green opacity-30" />
      </Card>

      <Card className="px-3 py-2 flex items-center justify-between border-border bg-card">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-neon-red">ADR LOW</div>
          <div className="text-xl font-mono font-bold leading-tight text-neon-red">{stats.signalsLow}</div>
        </div>
        <ArrowDownRight className="w-4 h-4 text-neon-red opacity-30" />
      </Card>
    </div>
  );
}
