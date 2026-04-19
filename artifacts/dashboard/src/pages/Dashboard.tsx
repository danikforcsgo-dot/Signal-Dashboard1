import { useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { StatsRow } from "@/components/StatsRow";
import { SignalsFeed } from "@/components/SignalsFeed";
import { CoinsGrid } from "@/components/CoinsGrid";
import { BubbleFeed } from "@/components/BubbleFeed";
import { GainersList } from "@/components/GainersList";

type Tab = "adr" | "bubble";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("adr");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <StatusBar />

      {/* Tab bar */}
      <div className="border-b border-border bg-card flex items-center gap-0 px-3 flex-shrink-0">
        <button
          onClick={() => setTab("adr")}
          className={`px-4 py-2 text-[11px] font-bold tracking-wider border-b-2 transition-colors ${
            tab === "adr"
              ? "border-neon-green text-neon-green"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📊 ADR BOT
        </button>
        <button
          onClick={() => setTab("bubble")}
          className={`px-4 py-2 text-[11px] font-bold tracking-wider border-b-2 transition-colors ${
            tab === "bubble"
              ? "border-violet-400 text-violet-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          ◉ BUBBLE BOT
        </button>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col p-2 gap-2">
        {tab === "adr" ? (
          <>
            <StatsRow />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-2 min-h-0">
              <div className="lg:col-span-1 h-full min-h-0">
                <SignalsFeed />
              </div>
              <div className="lg:col-span-1 h-full min-h-0 border border-border bg-card rounded-md overflow-hidden">
                <GainersList />
              </div>
              <div className="lg:col-span-4 h-full overflow-auto pr-1">
                <CoinsGrid />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0 border border-border bg-card rounded-md overflow-hidden">
            <BubbleFeed />
          </div>
        )}
      </main>
    </div>
  );
}
