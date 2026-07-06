'use client';

import { useEffect, useState } from 'react';
import { Play, Upload, BarChart3, ArrowRight, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function KangaroosLanding() {
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'checking' | 'connected' | 'missing-config' | 'error'>('idle');
  const [supabaseMessage, setSupabaseMessage] = useState('');

  const checkSupabase = async () => {
    setSupabaseStatus('checking');
    setSupabaseMessage('Checking Supabase connection...');

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('games').select('id').limit(1);

      if (error) {
        setSupabaseStatus('error');
        setSupabaseMessage(error.message || 'Supabase query failed.');
        return;
      }

      setSupabaseStatus('connected');
      setSupabaseMessage('Supabase connection is healthy.');
    } catch (error: any) {
      setSupabaseStatus(error.message?.includes('credentials') ? 'missing-config' : 'error');
      setSupabaseMessage(error.message || 'Unable to connect to Supabase.');
    }
  };

  useEffect(() => {
    checkSupabase();
  }, []);

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
          {/* Hero */}
          <div className="mb-16 mt-8">
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1.5 text-sm mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Ready for Friday Night
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
              Kangaroos Football<br />
              <span className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                Stats & Scouting
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Live play-by-play entry • Smart auto calculations • Opponent scouting
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-sm text-zinc-300">
                <Database className="h-4 w-4 text-blue-400" />
                {supabaseStatus === 'checking' && 'Checking Supabase...'}
                {supabaseStatus === 'connected' && 'Supabase connected'}
                {supabaseStatus === 'missing-config' && 'Supabase config missing'}
                {supabaseStatus === 'error' && 'Supabase connection error'}
                {supabaseStatus === 'idle' && 'Supabase status pending...'}
              </div>

              <button
                onClick={checkSupabase}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
              >
                {supabaseStatus === 'connected' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Refresh connection
              </button>
            </div>

            {supabaseMessage ? (
              <div className="mt-3 text-sm text-zinc-400 max-w-2xl mx-auto">
                {supabaseMessage}
              </div>
            ) : null}
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Live Entry - Main Button */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-blue-500 transition-all group">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Live Data Entry</h3>
              <p className="text-zinc-400 mb-8">
                Real-time play tracking with automatic down & distance calculations.
              </p>
              
              <button 
                onClick={() => window.location.href = '/enter'}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-colors"
              >
                START LIVE ENTRY <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Card */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-white transition-all group">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Upload Data</h3>
              <p className="text-zinc-400 mb-8">
                Import CSV files from Hudl or previous games.
              </p>
              
              <button className="w-full bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 transition-colors">
                Upload Offense CSV
              </button>
              <button className="w-full mt-3 bg-transparent border border-zinc-700 py-4 rounded-2xl font-semibold hover:bg-zinc-800 transition-colors">
                Upload Defense CSV
              </button>
            </div>

            {/* Analyze Card */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-blue-500 transition-all group">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Analyze & Scout</h3>
              <p className="text-zinc-400 mb-8">
                View tendencies, success rates, and scout upcoming opponents.
              </p>
              
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl font-semibold transition-colors">
                View All Logged Games →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Games */}
      <div className="bg-zinc-900 border-t border-zinc-800 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Recent Games</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold">vs. Central Tigers</div>
                    <div className="text-sm text-zinc-500">May 8, 2026</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">W 28-14</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-400 space-y-1">
                  <div>Offense: 312 yards • 4 TDs</div>
                  <div>Defense: 3 sacks • 1 INT</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        Kangaroos Football • Built for the sideline
      </footer>
    </div>
  );
}
