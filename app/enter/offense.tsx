'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PlayEntry = {
  id: string;
  playNumber: number;
  down: number | '';
  dist: number | '';
  hash: string;
  yardLine: number | '';
  gnls: number | '';
  offFormation: string;
  motion: string;
  offPlay: string;
  ballCarrier: string;
  front: string;
  blitz: string;
  coverage: string;
};

export default function OffenseEntry() {
  const [opponent, setOpponent] = useState('');
  const [data, setData] = useState<PlayEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load plays from main entry (we'll filter by game later)
  useEffect(() => {
    const loadPlays = async () => {
      const { data: plays, error } = await supabase
        .from('plays')
        .select('*')
        .order('play_number', { ascending: true });

      if (error) console.error(error);
      else setData(plays || []);
      setLoading(false);
    };

    loadPlays();
  }, []);

  const updateOffenseField = async (playId: string, field: string, value: string) => {
    const { error } = await supabase
      .from('plays')
      .update({ [field]: value })
      .eq('id', playId);

    if (error) console.error(error);
  };

  if (loading) return <div className="p-10 text-center">Loading plays...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[95%] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
              <ArrowLeft size={22} /> Back
            </button>
            <div>
              <h1 className="text-4xl font-bold">Offense Detailed Entry</h1>
              <p className="text-emerald-500">Formation • Motion • Ball Carrier • Blitz</p>
            </div>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-5 py-3 w-72"
            />
            <button className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-semibold">
              Save Offense Data
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-700 rounded-3xl bg-zinc-900">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b-2 border-zinc-600 sticky top-0 z-10">
                <th className="px-4 py-4 text-left">PLAY #</th>
                <th className="px-4 py-4 text-left">DN</th>
                <th className="px-4 py-4 text-left">DIST</th>
                <th className="px-4 py-4 text-left">YARD LN</th>
                <th className="px-4 py-4 text-left">OFF FORM</th>
                <th className="px-4 py-4 text-left">MOTION</th>
                <th className="px-4 py-4 text-left">OFF PLAY</th>
                <th className="px-4 py-4 text-left">BALL CARRIER</th>
                <th className="px-4 py-4 text-left">FRONT</th>
                <th className="px-4 py-4 text-left">BLITZ</th>
                <th className="px-4 py-4 text-left">COVERAGE</th>
              </tr>
            </thead>
            <tbody>
              {data.map((play, rowIndex) => (
                <tr key={play.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">{play.playNumber}</td>
                  <td className="px-4 py-3">{play.down}</td>
                  <td className="px-4 py-3">{play.dist}</td>
                  <td className="px-4 py-3">{play.yardLine}</td>

                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={play.offFormation || ''}
                      onChange={(e) => updateOffenseField(play.id!, 'offFormation', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-center"
                    />
                  </td>

                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={play.motion || ''}
                      onChange={(e) => updateOffenseField(play.id!, 'motion', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-center"
                    />
                  </td>

                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={play.offPlay || ''}
                      onChange={(e) => updateOffenseField(play.id!, 'offPlay', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-center"
                    />
                  </td>

                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={play.ballCarrier || ''}
                      onChange={(e) => updateOffenseField(play.id!, 'ball_carrier', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-center"
                    />
                  </td>

                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={play.front || ''}
                      onChange={(e) => updateOffenseField(play.id!, 'front', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-center"
                    />
                  </td>

                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={play.blitz || ''}
                      onChange={(e) => updateOffenseField(play.id!, 'blitz', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-center"
                    />
                  </td>

                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={play.coverage || ''}
                      onChange={(e) => updateOffenseField(play.id!, 'coverage', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}