import { useGetStatus, useStartBot, useStopBot, useTestBot, useResetBot } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Power, PowerOff, Send, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ResetTimer } from "@/components/ResetTimer";

export function StatusBar() {
  const { data: status } = useGetStatus({ query: { refetchInterval: 10000 } });
  const startBot = useStartBot();
  const stopBot = useStopBot();
  const testBot = useTestBot();
  const resetBot = useResetBot();
  const { toast } = useToast();

  const handleStart = () => {
    startBot.mutate(undefined, {
      onSuccess: () => toast({ title: "Bot started" }),
      onError: () => toast({ title: "Failed to start bot", variant: "destructive" }),
    });
  };

  const handleStop = () => {
    stopBot.mutate(undefined, {
      onSuccess: () => toast({ title: "Bot stopped" }),
      onError: () => toast({ title: "Failed to stop bot", variant: "destructive" }),
    });
  };

  const handleTest = () => {
    testBot.mutate(undefined, {
      onSuccess: () => toast({ title: "Test sent" }),
      onError: () => toast({ title: "Failed to send", variant: "destructive" }),
    });
  };

  const handleReset = () => {
    if (!confirm("Принудительный сброс: очистит кулдауны, вотчлист тишины, гейнеры и сигнальные флаги. Продолжить?")) return;
    resetBot.mutate(undefined, {
      onSuccess: () => toast({ title: "Сброс выполнен", description: "Кулдауны и вотчлисты очищены" }),
      onError: () => toast({ title: "Ошибка сброса", variant: "destructive" }),
    });
  };

  if (!status) {
    return <div className="h-9 border-b border-border bg-card animate-pulse" />;
  }

  return (
    <div className="h-9 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-xs tracking-tight">SIGNAL TERMINAL</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">BOT:</span>
            {status.botRunning ? (
              <Badge variant="outline" className="text-neon-green border-neon-green/20 bg-neon-green/10 text-[10px] py-0 h-4 px-1.5">RUNNING</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-[10px] py-0 h-4 px-1.5">STOPPED</Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">OKX:</span>
            {status.okxConnected ? (
              <Badge variant="outline" className="text-neon-green border-neon-green/20 bg-neon-green/10 text-[10px] py-0 h-4 px-1.5">OK</Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 text-[10px] py-0 h-4 px-1.5">ERR</Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">TG:</span>
            {status.telegramConnected ? (
              <Badge variant="outline" className="text-neon-green border-neon-green/20 bg-neon-green/10 text-[10px] py-0 h-4 px-1.5">OK</Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 text-[10px] py-0 h-4 px-1.5">ERR</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ResetTimer />

        {status.lastScanAt && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Clock className="w-3 h-3" />
            {format(new Date(status.lastScanAt), "HH:mm:ss")}
          </div>
        )}

        {status.errorCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-destructive font-mono" title={status.lastError || ""}>
            <AlertTriangle className="w-3 h-3" />
            {status.errorCount} ERR
          </div>
        )}

        <div className="flex items-center gap-1.5 pl-3 border-l border-border">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={resetBot.isPending}
            className="font-mono text-[10px] h-6 px-2 py-0 text-amber-400 border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300">
            <RotateCcw className="w-3 h-3 mr-1" /> RESET
          </Button>
          <Button variant="outline" size="sm" onClick={handleTest} disabled={testBot.isPending}
            className="font-mono text-[10px] h-6 px-2 py-0">
            <Send className="w-3 h-3 mr-1" /> TG
          </Button>

          {status.botRunning ? (
            <Button variant="destructive" size="sm" onClick={handleStop} disabled={stopBot.isPending}
              className="font-mono text-[10px] h-6 px-2 py-0">
              <PowerOff className="w-3 h-3 mr-1" /> STOP
            </Button>
          ) : (
            <Button size="sm" onClick={handleStart} disabled={startBot.isPending}
              className="font-mono text-[10px] h-6 px-2 py-0 bg-neon-green text-black hover:bg-neon-green/90">
              <Power className="w-3 h-3 mr-1" /> START
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
