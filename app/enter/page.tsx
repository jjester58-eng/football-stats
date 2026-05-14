'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Download, Save, Loader2 } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { supabase } from '@/lib/supabase';

type NumericField = number | '';

type PlayEntry = {
  id?: string;
  playNumber: number;
  down: NumericField;
  dist: NumericField;
  hash: string;
  yardLine: NumericField;
  gnls: NumericField;
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
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  const [isStartingNewGame, setIsStartingNewGame] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  const [data, setData] = useState<PlayEntry[]>(() => {
    const rows: PlayEntry[] = [];
    for (let i = 1; i <= 200; i++) {
      rows.push({
        playNumber: i,
        down: i === 1 ? 1 : '',
        dist: i === 1 ? 10 : '',
        hash: '',
        yardLine: i === 1 ? -25 : '',
        gnls: '',
        offFormation: '',
        motion: '',
        offPlay: '',
        ballCarrier: '',
        front: '',
        blitz: '',
        coverage: '',
      });
    }
    return rows;
  });

  const columnHelper = createColumnHelper<PlayEntry>();

  const columns = [
    columnHelper.accessor('playNumber', { header: 'PLAY #' }),
    columnHelper.accessor('down', { header: 'DN' }),
    columnHelper.accessor('dist', { header: 'DIST' }),
    columnHelper.accessor('yardLine', { header: 'YARD LN' }),
    columnHelper.accessor('gnls', { header: 'GN/LS' }),
    columnHelper.accessor('offFormation', { header: 'OFF FORM' }),
    columnHelper.accessor('motion', { header: 'MOTION' }),
    columnHelper.accessor('offPlay', { header: 'OFF PLAY' }),
    columnHelper.accessor('ballCarrier', { header: 'BALL CARRIER' }),
    columnHelper.accessor('front', { header: 'FRONT' }),
    columnHelper.accessor('blitz', { header: 'BLITZ' }),
    columnHelper.accessor('coverage', { header: 'COVERAGE' }),
  ];

  const updateField = (rowIndex: number, columnId: string, newValue: any) => {
    const newData = [...data];
    (newData[rowIndex] as any)[columnId] = newValue;
    setData(newData);
  };

  const moveToCell = (row: number, col: number) => {
    setSelectedCell({
      row: Math.max(0, Math.min(row, data.length - 1)),
      col: Math.max(0, Math.min(col, columns.length - 1)),
    });
  };

  function EditableCell({
    value,
    rowIndex,
    columnId,
    colIndex,
  }: {
    value: any;
    rowIndex: number;
    columnId: string;
    colIndex: number;
  }) {
    const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isSelected && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isSelected]);

    return (
      <input
        ref={inputRef}
        value={value ?? ''}
        onChange={(e) => updateField(rowIndex, columnId, e.target.value)}
        onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
        onKeyDown={(e) => {
          const input = inputRef.current;
          switch (e.key) {
            case 'Enter': e.preventDefault(); moveToCell(rowIndex + 1, colIndex); break;
            case 'Tab': e.preventDefault(); moveToCell(rowIndex, colIndex + (e.shiftKey ? -1 : 1)); break;
            case 'ArrowDown': e.preventDefault(); moveToCell(rowIndex + 1, colIndex); break;
            case 'ArrowUp': e.preventDefault(); moveToCell(rowIndex - 1, colIndex); break;
            case 'ArrowRight':
              if (input && input.selectionStart === input.value.length) {
                e.preventDefault(); moveToCell(rowIndex, colIndex + 1);
              }
              break;
            case 'ArrowLeft':
              if (input && input.selectionStart === 0) {
                e.preventDefault(); moveToCell(rowIndex, colIndex - 1);
              }
              break;
          }
        }}
        className={`w-full min-h-[38px] px-3 py-1 bg-transparent outline-none border text-center transition-colors ${
          isSelected ? 'border-blue-500 bg-zinc-800' : 'border-transparent hover:border-zinc-700'
        }`}
      />
    );
  }

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  // Start New Game
  const startNewGame = async () => {
    if (!opponent.trim()) return alert("Please enter an opponent name first.");
    if (!confirm('Start a new game? Current data will be lost.')) return;

    setIsStartingNewGame(true);
    try {
      const { data: game, error } = await supabase
        .from('games')
        .insert({ opponent: opponent.trim(), game_date: gameDate, status: 'live' })
        .select()
        .single();

      if (error) throw error;

      setCurrentGameId(game.id);
      alert("New game started successfully!");

      setData(prev => prev.map((row, i) => ({
        ...row,
        down: i === 0 ? 1 : '',
        dist: i === 0 ? 10 : '',
        hash: '',
        yardLine: i === 0 ? -25 : '',
        gnls: '',
        offFormation: '',
        motion: '',
        offPlay: '',
        ballCarrier: '',
        front: '',
        blitz: '',
        coverage: '',
      })));
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to create new game");
    } finally {
      setIsStartingNewGame(false);
    }
  };

  // Save Game
  const saveGame = async () => {
    if (!currentGameId) return alert("Please start a new game first");

    setIsSaving(true);
    try {
      const playsToSave = data.map((play) => ({
        game_id: currentGameId,
        play_number: play.playNumber,
        down: play.down,
        dist: play.dist,
        hash: play.hash,
        yard_line: play.yardLine,
        gnls: play.gnls,
        off_formation: play.offFormation,
        motion: play.motion,
        off_play: play.offPlay,
        ball_carrier: play.ballCarrier,
        front: play.front,
        blitz: play.blitz,
        coverage: play.coverage,
      }));

      const { error } = await supabase
        .from('plays')
        .upsert(playsToSave, { onConflict: 'game_id,play_number' });

      if (error) throw error;
      alert("Offense data saved successfully!");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to save data");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCSV = () => {
    const headers = columns.map(col => col.header as string);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        columns.map(col => {
          const val = (row as any)[col.id as keyof PlayEntry];
          return val !== null && val !== undefined ? `"${val}"` : '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `Offense_${opponent || 'Game'}_${gameDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[95%] mx-auto">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
                <ArrowLeft size={22} /> Back
              </button>
              <div>
                <h1 className="text-4xl font-bold">Offense Detailed Entry</h1>
                <p className="text-emerald-500">Formations • Motion • Ball Carrier</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={startNewGame}
                disabled={isStartingNewGame}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-70 px-5 py-2.5 rounded-xl font-medium"
              >
                {isStartingNewGame ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                {isStartingNewGame ? 'Creating...' : 'New Game'}
              </button>

              <input
                type="text"
                placeholder="Opponent Name"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 w-72 focus:outline-none focus:border-blue-500"
              />

              <input
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />

              <button onClick={downloadCSV} className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-5 py-2.5 rounded-xl">
                <Download size={18} /> CSV
              </button>

              <button
                onClick={saveGame}
                disabled={isSaving || !currentGameId}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 px-6 py-2.5 rounded-xl font-semibold"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Offense'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-zinc-700 rounded-3xl bg-zinc-900 shadow-xl">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-zinc-950 border-b-2 border-zinc-600 sticky top-0 z-10">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-4 text-left text-xs font-semibold text-zinc-300 whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr key={row.id} className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${selectedCell.row === rowIndex ? 'bg-zinc-800/70' : ''}`}>
                  {row.getVisibleCells().map((cell, colIndex) => (
                    <td key={cell.id} className="px-2 py-1 border-r border-zinc-800 last:border-r-0">
                      <EditableCell
                        value={cell.getValue()}
                        rowIndex={rowIndex}
                        columnId={cell.column.id}
                        colIndex={colIndex}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}