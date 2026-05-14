'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Users, Download, Play } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';

type NumericField = number | '';

type PlayEntry = {
  id: number;
  playNumber: number;
  odk: string;
  down: NumericField;
  dist: NumericField;
  hash: string;
  gnls: NumericField;
  yardLine: NumericField;
  playType: string;
  result: string;
  offFormation: string;
  defense: string;
  motion: string;
  offPlay: string;
  rpo: string;
  playDir: string;
  stunt: string;
  blitz: string;
  coverage: string;
};

export default function LiveEntry() {
  const [opponent, setOpponent] = useState('');
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);

  const [data, setData] = useState<PlayEntry[]>(() => {
    const rows: PlayEntry[] = [];
    for (let i = 1; i <= 200; i++) {
      rows.push({
        id: i,
        playNumber: i,
        odk: i % 2 === 0 ? 'D' : 'O',
        down: i === 1 ? 1 : '',
        dist: i === 1 ? 10 : '',
        hash: '',
        gnls: '',
        yardLine: i === 1 ? -25 : '',
        playType: '',
        result: '',
        offFormation: '',
        defense: '',
        motion: '',
        offPlay: '',
        rpo: '',
        playDir: '',
        stunt: '',
        blitz: '',
        coverage: '',
      });
    }
    return rows;
  });

  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  const columnHelper = createColumnHelper<PlayEntry>();

  const columns = [
    columnHelper.accessor('playNumber', { header: 'PLAY #' }),
    columnHelper.accessor('odk', { header: 'ODK' }),
    columnHelper.accessor('down', { header: 'DN' }),
    columnHelper.accessor('dist', { header: 'DIST' }),
    columnHelper.accessor('hash', { header: 'HASH' }),
    columnHelper.accessor('gnls', { header: 'GN/LS' }),
    columnHelper.accessor('yardLine', { header: 'YARD LN' }),
    columnHelper.accessor('playType', { header: 'PLAY TYPE' }),
    columnHelper.accessor('result', { header: 'RESULT' }),
    columnHelper.accessor('offFormation', { header: 'OFF FORM' }),
    columnHelper.accessor('defense', { header: 'DEFENSE' }),
    columnHelper.accessor('motion', { header: 'MOTION' }),
    columnHelper.accessor('offPlay', { header: 'OFF PLAY' }),
    columnHelper.accessor('rpo', { header: 'RPO' }),
    columnHelper.accessor('playDir', { header: 'DIR' }),
    columnHelper.accessor('stunt', { header: 'STUNT' }),
    columnHelper.accessor('blitz', { header: 'BLITZ' }),
    columnHelper.accessor('coverage', { header: 'COVERAGE' }),
  ];

  const toPosition = (val: NumericField): number => {
    if (val === '') return 50;
    const n = Number(val);
    if (n < 0) return -n;
    if (n === 50) return 50;
    return 50 + (50 - n);
  };

  const calculateGainLoss = (prev: NumericField, current: NumericField): NumericField => {
    if (prev === '' || current === '') return '';
    return toPosition(current) - toPosition(prev);
  };

  const updateNextDownDistance = (plays: PlayEntry[], index: number) => {
    const current = plays[index];
    const next = plays[index + 1];
    if (!next) return;

    if (current.gnls === '' || current.dist === '' || current.down === '') return;

    const gain = Number(current.gnls);
    const dist = Number(current.dist);
    const down = Number(current.down);

    if (isNaN(gain) || isNaN(dist) || isNaN(down)) return;

    if (gain >= dist) {
      next.down = 1;
      next.dist = 10;
    } else if (down < 4) {
      next.down = down + 1;
      next.dist = Math.max(1, dist - gain);
    } else {
      next.down = '';
      next.dist = '';
    }
  };

  const updateRow = (rowIndex: number, columnId: string, rawValue: any) => {
    const newData = [...data];

    let formatted: any = rawValue;
    if (['down', 'dist', 'gnls', 'yardLine'].includes(columnId)) {
      if (rawValue === '' || rawValue === '-') {
        formatted = rawValue;
      } else {
        const num = Number(rawValue);
        formatted = isNaN(num) ? '' : num;
      }
    }

    (newData[rowIndex] as any)[columnId] = formatted;

    if (columnId === 'yardLine' && rowIndex > 0) {
      newData[rowIndex - 1].gnls = calculateGainLoss(
        newData[rowIndex - 1].yardLine,
        formatted
      );
      // After calculating gain/loss, update the current row's down/distance
      updateNextDownDistance(newData, rowIndex - 1);
    }

    if (['gnls', 'down', 'dist'].includes(columnId) && rowIndex < newData.length - 1) {
      updateNextDownDistance(newData, rowIndex);
    }

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
        onChange={(e) => updateRow(rowIndex, columnId, e.target.value)}
        onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
        onKeyDown={(e) => {
          const input = inputRef.current;
          switch (e.key) {
            case 'Enter':
              e.preventDefault();
              moveToCell(rowIndex + 1, colIndex);
              break;
            case 'Tab':
              e.preventDefault();
              moveToCell(rowIndex, colIndex + (e.shiftKey ? -1 : 1));
              break;
            case 'ArrowDown':
              e.preventDefault();
              moveToCell(rowIndex + 1, colIndex);
              break;
            case 'ArrowUp':
              e.preventDefault();
              moveToCell(rowIndex - 1, colIndex);
              break;
            case 'ArrowRight':
              if (input && input.selectionStart === input.value.length) {
                e.preventDefault();
                moveToCell(rowIndex, colIndex + 1);
              }
              break;
            case 'ArrowLeft':
              if (input && input.selectionStart === 0) {
                e.preventDefault();
                moveToCell(rowIndex, colIndex - 1);
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

  const addNewRow = () => {
    const newPlay: PlayEntry = {
      id: data.length + 1,
      playNumber: data.length + 1,
      odk: 'O',
      down: '',
      dist: '',
      hash: '',
      gnls: '',
      yardLine: '',
      playType: '',
      result: '',
      offFormation: '',
      defense: '',
      motion: '',
      offPlay: '',
      rpo: '',
      playDir: '',
      stunt: '',
      blitz: '',
      coverage: '',
    };
    setData([...data, newPlay]);
  };

  const startNewGame = () => {
    if (!confirm('Start a new game? Current data will be lost.')) return;
    setOpponent('');
    setGameDate(new Date().toISOString().split('T')[0]);
    
    setData(prev => prev.map((row, i) => ({
      ...row,
      down: i === 0 ? 1 : '',
      dist: i === 0 ? 10 : '',
      gnls: '',
      yardLine: i === 0 ? -25 : '',
      playType: '',
      result: '',
      offFormation: '',
      defense: '',
      motion: '',
      offPlay: '',
      rpo: '',
      playDir: '',
      stunt: '',
      blitz: '',
      coverage: '',
    })));
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
    link.download = `${opponent || 'Game'}_${gameDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[95%] mx-auto">
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
                <ArrowLeft size={22} /> Back
              </button>
              <h1 className="text-4xl font-bold">Live Entry</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-xl font-medium"
              >
                <Play size={18} /> New Game
              </button>

              <input
                type="text"
                placeholder="Opponent Name"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                onFocus={() => setSelectedCell({ row: -1, col: -1 })}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 w-64 focus:outline-none focus:border-blue-500"
              />

              <input
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                onFocus={() => setSelectedCell({ row: -1, col: -1 })}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-5 py-2.5 rounded-xl"
              >
                <Download size={18} /> Download CSV
              </button>

              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl font-semibold">
                <Save size={18} /> Save Game
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