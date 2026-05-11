'use client';

import { Play, Upload, BarChart3, ArrowRight } from 'lucide-react';

export default function KangaroosLanding() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top Nav */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
              K
            </div>
            <div>
              <div className="font-bold text-2xl tracking-tight">Kangaroos Stats</div>
              <div className="text-xs text-zinc-500 -mt-1">HS Football</div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <a href="/" className="text-blue-400">Home</a>
            <a href="/enter" className="hover:text-blue-400 transition-colors">Live Entry</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Games</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Analysis</a>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="mb-16 mt-8">
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1.5 text-sm mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Game Day Ready
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
              Kangaroos Football<br />
              <span className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                Stats & Scouting
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Live play-by-play entry • Tendency analysis • Opponent scouting
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Live Entry */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-blue-500 transition-all group">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Live Data Entry</h3>
              <p className="text-zinc-400 mb-8">
                Enter plays in real-time like a Google Sheet. Smart auto-fill enabled.
              </p>
              <button 
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-colors"
                onClick={() => window.location.href = '/enter'}
              >
                START LIVE ENTRY <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Upload */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-white transition-all group">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Upload Data</h3>
              <p className="text-zinc-400 mb-8">
                Import previous games from CSV (Offense & Defense).
              </p>
              <button className="w-full bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 transition-colors">
                Upload Offense CSV
              </button>
              <button className="w-full mt-3 bg-transparent border border-zinc-700 py-4 rounded-2xl font-semibold hover:bg-zinc-800 transition-colors">
                Upload Defense CSV
              </button>
            </div>

            {/* Analyze */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-blue-500 transition-all group">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Analyze & Scout</h3>
              <p className="text-zinc-400 mb-8">
                View tendencies, success rates, and scout opponents.
              </p>
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl font-semibold transition-colors">
                Go to Analysis Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        Kangaroos Football • Built for the Sideline
      </footer>
    </div>
  );
}