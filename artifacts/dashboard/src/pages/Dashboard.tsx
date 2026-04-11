import { StatusBar } from "@/components/StatusBar";
import { StatsRow } from "@/components/StatsRow";
import { SignalsFeed } from "@/components/SignalsFeed";
import { CoinsGrid } from "@/components/CoinsGrid";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <StatusBar />
      
      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
        <StatsRow />
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          <div className="lg:col-span-1 h-full min-h-0">
            <SignalsFeed />
          </div>
          
          <div className="lg:col-span-3 h-full overflow-auto pr-2 custom-scrollbar">
            <CoinsGrid />
          </div>
        </div>
      </main>
    </div>
  );
}