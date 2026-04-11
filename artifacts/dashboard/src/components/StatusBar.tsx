import { useGetStatus, useStartBot, useStopBot, useTestBot } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Power, PowerOff, Send, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function StatusBar() {
  const { data: status } = useGetStatus({ query: { refetchInterval: 10000 } });
  const startBot = useStartBot();
  const stopBot = useStopBot();
  const testBot = useTestBot();
  const { toast } = useToast();

  const handleStart = () => {
    startBot.mutate(undefined, {
      onSuccess: () => toast({ title: "Bot started successfully" }),
      onError: (err) => toast({ title: "Failed to start bot", variant: "destructive" }),
    });
  };

  const handleStop = () => {
    stopBot.mutate(undefined, {
      onSuccess: () => toast({ title: "Bot stopped successfully" }),
      onError: (err) => toast({ title: "Failed to stop bot", variant: "destructive" }),
    });
  };

  const handleTest = () => {
    testBot.mutate(undefined, {
      onSuccess: () => toast({ title: "Test message sent" }),
      onError: (err) => toast({ title: "Failed to send test message", variant: "destructive" }),
    });
  };

  if (!status) {
    return <div className="h-14 border-b border-border bg-card animate-pulse" />;
  }

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-tight">SIGNAL TERMINAL</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">BOT:</span>
            {status.botRunning ? (
              <Badge variant="outline" className="text-neon-green border-neon-green/20 bg-neon-green/10">RUNNING</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">STOPPED</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">OKX API:</span>
            {status.okxConnected ? (
              <Badge variant="outline" className="text-neon-green border-neon-green/20 bg-neon-green/10">CONNECTED</Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">DISCONNECTED</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">TELEGRAM:</span>
            {status.telegramConnected ? (
              <Badge variant="outline" className="text-neon-green border-neon-green/20 bg-neon-green/10">CONNECTED</Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">DISCONNECTED</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status.lastScanAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="w-3.5 h-3.5" />
            Last Scan: {format(new Date(status.lastScanAt), "HH:mm:ss")}
          </div>
        )}
        
        {status.errorCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-destructive font-mono" title={status.lastError || "Errors occurred"}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {status.errorCount} ERRORS
          </div>
        )}

        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTest}
            disabled={testBot.isPending}
            className="font-mono text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" /> TEST TG
          </Button>
          
          {status.botRunning ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleStop}
              disabled={stopBot.isPending}
              className="font-mono text-xs"
            >
              <PowerOff className="w-3.5 h-3.5 mr-1.5" /> STOP BOT
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleStart}
              disabled={startBot.isPending}
              className="font-mono text-xs bg-neon-green text-black hover:bg-neon-green/90"
            >
              <Power className="w-3.5 h-3.5 mr-1.5" /> START BOT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}