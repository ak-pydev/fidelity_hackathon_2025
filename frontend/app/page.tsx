import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.4),transparent_60%)]"></div>
      </div>

      <div className="relative container mx-auto px-6 py-20 text-center">
        {/* Hero */}
        <div className="mb-6">
          <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm border border-emerald-500/30">
            🚀 Fantasy Trading
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
          Fantasy Options
          <br />
          League
        </h1>

        <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
          Compete with friends by trading simulated options strategies. Learn hedging, spreads, 
          and risk management while climbing the leaderboard—just like fantasy sports.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/dashboard" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all">
            Start Trading →
          </Link>
          
          <Link href="/leagues" className="border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all">
            Join League
          </Link>
        </div>

        {/* Quick Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold mb-2">Strategy Marketplace</h3>
            <p className="text-slate-400 text-sm">Choose from Bull Calls, Iron Condors, Covered Calls and more</p>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="text-3xl mb-3">⚔️</div>
            <h3 className="text-lg font-bold mb-2">Weekly Matchups</h3>
            <p className="text-slate-400 text-sm">$100K fantasy cash each week, compete head-to-head</p>
          </div>
          
          <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-bold mb-2">Live Leaderboard</h3>
            <p className="text-slate-400 text-sm">Real-time P/L tracking and league standings</p>
          </div>
        </div>
      </div>
    </main>
  );
}