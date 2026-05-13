'use client';

import { useState, useEffect } from 'react';
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
  down: number | '';
  dist: number | '';
  hash: string;
  gnls: number | '';
  yardLine: number | '';        // Just plain number
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
        yardLine: i === 1 ? 25 : '',     // Start at own 25
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

  // Simple Gain/Loss (just number subtraction)
  const calculateGainLoss = (prev: number | '', current: number | ''): number | '' => {
    if (prev === '' || current === '') return '';
    return Number(current) - Number(prev);
  };

  const updateNextDownDistance = (plays: PlayEntry[], index: number) => {
    const current = plays[index];
    const next = plays[index + 1];
    if (!next) return;

    if (current.gnls === '' || current.dist === '' || current.down === '') return;

    const gain = Number(current.gnls);
    const dist = Number(current.dist);
    const down = Number(current.down);

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

  const updateRow = (rowIndex: number, columnId: string, newValue: any) => {
    const newData = [...data];
    let finalValue = newValue;

    // Convert to number for numeric fields
    if (['down', 'dist', 'gnls', 'yardLine'].includes(columnId)) {
      finalValue = newValue === '' ? '' : Number(newValue);
    }

    (newData[rowIndex] as any)[columnId] = finalValue;

    // Auto Gain/Loss
    if (columnId === 'yardLine' && rowIndex > 0) {
      newData[rowIndex - 1].gnls = calculateGainLoss(
        newData[rowIndex - 1].yardLine,
        finalValue
      );
      updateNextDownDistance(newData, rowIndex - 1);
    }

    // Auto Down & Distance
    if (['gnls', 'down', 'dist'].includes(columnId) && rowIndex < newData.length - 1) {
      updateNextDownDistance(newData, rowIndex);
    }

    setData(newData);
  };

  // Keyboard Navigation
  const moveToCell = (row: number, col: number) => {
    setSelectedCell({
      row: Math.max(0, Math.min(row, data.length - 1)),
      col: Math.max(0, Math.min(col, columns.length - 1)),
    });
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
      updateRow(rowIndex, columnId, val);
    };

    useEffect(() => {
      if (isSelected && !editing) {
        setTimeout(() => setEditing(true), 10);
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
            moveToCell(rowIndex + 1, colIndex);
          }
          if (e.key === 'Tab') {
            e.preventDefault();
            moveToCell(rowIndex, colIndex + (e.shiftKey ? -1 : 1));
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
          isSelected ? 'border-2 border-blue-500 bg-zinc-800' : ''
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
              <p className="text-emerald-500">Plain Numbers • Arrow Navigation</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={addNewRow} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl">
              <Plus size={20} /> New Row
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
                  {headerGroup.headers.map(header => (
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