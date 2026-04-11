import { useGetSignalStats } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, Target } from "lucide-react";

export function StatsRow() {
  const { data: stats } = useGetSignalStats({ query: { refetchInterval: 10000 } });

  if (!stats) {
    return <div className="grid grid-cols-4 gap-4 h-24 animate-pulse bg-card/50" />;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="p-4 flex flex-col justify-between border-border bg-card">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-bold tracking-wider">TOTAL SIGNALS</span>
          <Activity className="w-4 h-4 opacity-50" />
        </div>
        <div className="text-3xl font-mono font-bold mt-2">
          {stats.totalSignals.toLocaleString()}
        </div>
      </Card>

      <Card className="p-4 flex flex-col justify-between border-border bg-card">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-bold tracking-wider">TODAY'S SIGNALS</span>
          <Target className="w-4 h-4 opacity-50" />
        </div>
        <div className="text-3xl font-mono font-bold mt-2 text-primary">
          {stats.signalsToday.toLocaleString()}
        </div>
      </Card>

      <Card className="p-4 flex flex-col justify-between border-border bg-card">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-bold tracking-wider text-neon-green">ADR HIGH SIGNALS</span>
          <ArrowUpRight className="w-4 h-4 text-neon-green opacity-50" />
        </div>
        <div className="text-3xl font-mono font-bold mt-2 text-neon-green">
          {stats.signalsHigh.toLocaleString()}
        </div>
      </Card>

      <Card className="p-4 flex flex-col justify-between border-border bg-card">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-bold tracking-wider text-neon-red">ADR LOW SIGNALS</span>
          <ArrowDownRight className="w-4 h-4 text-neon-red opacity-50" />
        </div>
        <div className="text-3xl font-mono font-bold mt-2 text-neon-red">
          {stats.signalsLow.toLocaleString()}
        </div>
      </Card>
    </div>
  );
}