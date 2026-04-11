import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

function getSecondsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}

export function ResetTimer() {
  const [seconds, setSeconds] = useState(getSecondsUntilMidnightUTC());

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(getSecondsUntilMidnightUTC());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isUrgent = seconds < 3600;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-mono ${isUrgent ? "text-yellow-400" : "text-muted-foreground"}`}
      title="Сброс сигналов в 00:00 UTC (03:00 по Москве)"
      data-testid="text-reset-timer"
    >
      <Timer className="w-3.5 h-3.5" />
      <span>Сброс: {formatCountdown(seconds)}</span>
    </div>
  );
}
