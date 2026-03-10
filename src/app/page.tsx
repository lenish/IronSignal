import PriceTicker from "@/components/PriceTicker";
import PriceCharts from "@/components/PriceCharts";
import NewsFeed from "@/components/NewsFeed";
import DailySummary from "@/components/DailySummary";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-mono font-bold tracking-widest text-text-primary">
            <span className="text-accent-amber">IRON</span>
            <span className="text-text-secondary">SIGNAL</span>
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-mono text-text-muted">LIVE</span>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/summary"
            className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            SUMMARIES
          </Link>
          <span className="text-xs font-mono text-text-muted">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </nav>
      </header>

      <PriceTicker />
      <PriceCharts />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 border-r border-border overflow-hidden flex flex-col min-w-0">
          <div className="px-3 py-1.5 border-b border-border">
            <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
              News Feed
            </span>
          </div>
          <NewsFeed />
        </main>

        <aside className="w-[380px] shrink-0 overflow-hidden flex flex-col bg-bg-secondary">
          <DailySummary />
        </aside>
      </div>

      <footer className="flex items-center justify-between px-4 py-1 bg-bg-secondary border-t border-border">
        <span className="text-xs font-mono text-text-muted">
          IronSignal v0.1.0
        </span>
         <span className="text-xs font-mono text-text-muted">
           Sources: FT Commodities · CNBC · Mining.com · MarketWatch · Investing.com · MetalMiner · Mining Technology
         </span>
      </footer>
    </div>
  );
}
