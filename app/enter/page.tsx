'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Users } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';

type PlayEntry = {
  id: number;
  playNumber: number;
  odk: string;
  down: number | '' | 'TO';
  dist: number | '';
  hash: string;
  gnls: number | '';
  yardLine: string;
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
  const [data, setData] = useState<PlayEntry[]>([
    {
      id: 1, playNumber: 1, odk: 'O', down: 1, dist: 10, hash: 'M',
      gnls: '', yardLine: 'M-40', playType: '', result: '',
      offFormation: '', defense: '', motion: '', offPlay: '', rpo: '',
      playDir: '', stunt: '', blitz: '', coverage: ''
    }
  ]);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

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

  // ================== IMPROVED GAIN/LOSS LOGIC ==================
  const calculateGainLoss = (prevYard: string, currentYard: string): number | '' => {
    if (!prevYard || !currentYard) return '';

    const getYardValue = (yardStr: string): number => {
      const match = yardStr.match(/(\d+)/);
      let yards = match ? parseInt(match[0]) : 50;

      if (yardStr.toUpperCase().includes('O') || yardStr.toUpperCase().includes('OWN')) {
        yards = 100 - yards; // Convert Own 40 → 60 from opponent perspective
      }
      return yards;
    };

    const prev = getYardValue(prevYard);
    const curr = getYardValue(currentYard);
    return curr - prev;
  };

  const updateNextDownDistance = (plays: PlayEntry[], index: number) => {
    const current = plays[index];
    const next = plays[index + 1];
    if (!next || current.gnls === '' || current.gnls === null) return;

    const gain = Number(current.gnls);
    const dist = Number(current.dist || 10);

    if (gain >= dist) {
      next.down = 1;
      next.dist = 10;
    } else if (typeof current.down === 'number' && current.down < 4) {
      next.down = current.down + 1;
      next.dist = Math.max(1, dist - gain);
    } else {
      next.down = 'TO';
      next.dist = '';
    }
  };

  const updateRow = (rowIndex: number, columnId: string, newValue: any) => {
    const newData = [...data];
    (newData[rowIndex] as any)[columnId] = newValue;

    if (columnId === 'yardLine' && rowIndex > 0) {
      const gain = calculateGainLoss(newData[rowIndex - 1].yardLine, newValue);
      newData[rowIndex - 1].gnls = gain;
    }

    if (['gnls', 'down', 'dist'].includes(columnId) && rowIndex < newData.length - 1) {
      updateNextDownDistance(newData, rowIndex);
    }

    setData(newData);
  };

  // ================== KEYBOARD NAVIGATION ==================
  const moveToCell = (row: number, col: number) => {
    const newRow = Math.max(0, Math.min(row, data.length - 1));
    const newCol = Math.max(0, Math.min(col, columns.length - 1));
    setSelectedCell({ row: newRow, col: newCol });
  };

  function EditableCell({ value, rowIndex, columnId, colIndex }: { 
    value: any; 
    rowIndex: number; 
    columnId: string;
    colIndex: number;
  }) {
    const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value?.toString() || '');

    const handleSave = () => {
      setEditing(false);
      updateRow(rowIndex, columnId, val === '' ? '' : val);
    };

    useEffect(() => {
      if (isSelected && !editing) {
        const timer = setTimeout(() => setEditing(true), 10);
        return () => clearTimeout(timer);
      }
    }, [isSelected]);

    return editing ? (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave();
            moveToCell(rowIndex + 1, colIndex); // Move down
          }
          if (e.key === 'Tab') {
            e.preventDefault();
            moveToCell(rowIndex, colIndex + 1);
          }
          if (e.key === 'ArrowDown') moveToCell(rowIndex + 1, colIndex);
          if (e.key === 'ArrowUp') moveToCell(rowIndex - 1, colIndex);
          if (e.key === 'ArrowRight') moveToCell(rowIndex, colIndex + 1);
          if (e.key === 'ArrowLeft') moveToCell(rowIndex, colIndex - 1);
        }}
        className="w-full bg-zinc-900 border-2 border-blue-500 px-3 py-1 text-center outline-none"
      />
    ) : (
      <div
        onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
        className={`min-h-[38px] px-3 py-1 cursor-text hover:bg-zinc-800 flex items-center ${
          isSelected ? 'border-2 border-blue-500' : ''
        }`}
      >
        {value ?? ''}
      </div>
    );
  }

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  const addNewRow = () => {
    const newPlay: PlayEntry = {
      id: data.length + 1,
      playNumber: data.length + 1,
      odk: 'O',
      down: '', dist: '', hash: '', gnls: '', yardLine: '',
      playType: '', result: '', offFormation: '', defense: '', motion: '',
      offPlay: '', rpo: '', playDir: '', stunt: '', blitz: '', coverage: ''
    };
    setData([...data, newPlay]);
    setSelectedCell({ row: data.length, col: 0 });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[95%] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
              <ArrowLeft size={22} /> Back
            </button>
            <div>
              <h1 className="text-4xl font-bold">Kangaroos Live Entry</h1>
              <p className="text-emerald-500 flex items-center gap-2">
                <Users size={18} /> Arrow Keys + Tab + Enter Navigation
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={addNewRow} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl">
              <Plus size={20} /> New Play
            </button>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-2xl font-semibold">
              <Save size={20} /> Save Game
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-700 rounded-3xl bg-zinc-900">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-zinc-950 border-b-2 border-zinc-600 sticky top-0 z-10">
                  {headerGroup.headers.map((header, colIndex) => (
                    <th key={header.id} className="px-4 py-4 text-left text-xs font-semibold text-zinc-300 whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr key={row.id} className="border-b border-zinc-800 hover:bg-zinc-800/70">
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