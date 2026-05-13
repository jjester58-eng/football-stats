'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Save } from 'lucide-react';
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

// ─── Field helpers ────────────────────────────────────────────────────────────
// Convention: own side = negative (−1 to −49), opponent side = positive (+1 to +49)
// Advancing means value increases (−30 → −20 = +10 gain).

const FIELD_MIN = -49;
const FIELD_MAX = 49;

function calcGainLoss(prevYardLine: NumericField, newYardLine: NumericField): NumericField {
  if (prevYardLine === '' || newYardLine === '') return '';
  return Number(newYardLine) - Number(prevYardLine);
}

function projectYardLine(prevYardLine: NumericField, gnls: NumericField): NumericField {
  if (prevYardLine === '' || gnls === '') return '';
  const projected = Number(prevYardLine) + Number(gnls);
  return Math.max(FIELD_MIN, Math.min(FIELD_MAX, projected));
}

function isTouchdownZone(yardLine: NumericField): boolean {
  if (yardLine === '') return false;
  return Math.abs(Number(yardLine)) === 49;
}

// Compute next down & distance after a play resolves.
function computeNextDownDist(
  currentDown: NumericField,
  currentDist: NumericField,
  gnls: NumericField
): { down: NumericField; dist: NumericField } {
  if (currentDown === '' || currentDist === '' || gnls === '') {
    return { down: '', dist: '' };
  }
  const down = Number(currentDown);
  const dist = Number(currentDist);
  const gain = Number(gnls);

  if (gain >= dist) {
    // First down achieved
    return { down: 1, dist: 10 };
  } else if (down < 4) {
    // Advance the down
    return { down: down + 1, dist: Math.max(1, dist - gain) };
  } else {
    // 4th down with insufficient gain → turnover on downs, clear
    return { down: '', dist: '' };
  }
}

// ─── EditableCell — defined OUTSIDE parent so React never remounts it ─────────
interface EditableCellProps {
  value: any;
  rowIndex: number;
  columnId: string;
  colIndex: number;
  isSelected: boolean;
  isTDWarning: boolean;
  totalCols: number;
  totalRows: number;
  onSelect: (row: number, col: number) => void;
  onMove: (row: number, col: number) => void;
  onUpdate: (rowIndex: number, columnId: string, value: any) => void;
}

function EditableCell({
  value,
  rowIndex,
  columnId,
  colIndex,
  isSelected,
  isTDWarning,
  totalCols,
  totalRows,
  onSelect,
  onMove,
  onUpdate,
}: EditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  const tdStyle = isTDWarning
    ? 'border-amber-400 bg-amber-950/40'
    : isSelected
    ? 'border-blue-500 bg-zinc-800'
    : 'border-transparent hover:border-zinc-700';

  return (
    <input
      ref={inputRef}
      value={value ?? ''}
      onChange={(e) => onUpdate(rowIndex, columnId, e.target.value)}
      onClick={() => onSelect(rowIndex, colIndex)}
      className={`w-full min-h-[36px] px-2 py-1 bg-transparent outline-none border text-center text-sm transition-colors ${tdStyle}`}
      onKeyDown={(e) => {
        const input = inputRef.current;
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            onMove(rowIndex + 1, colIndex);
            break;
          case 'Tab':
            e.preventDefault();
            onMove(rowIndex, colIndex + (e.shiftKey ? -1 : 1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            onMove(rowIndex + 1, colIndex);
            break;
          case 'ArrowUp':
            e.preventDefault();
            onMove(rowIndex - 1, colIndex);
            break;
          case 'ArrowRight':
            if (input && input.selectionStart === input.value.length) {
              e.preventDefault();
              onMove(rowIndex, colIndex + 1);
            }
            break;
          case 'ArrowLeft':
            if (input && input.selectionStart === 0) {
              e.preventDefault();
              onMove(rowIndex, colIndex - 1);
            }
            break;
        }
      }}
    />
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────
const columnHelper = createColumnHelper<PlayEntry>();

const columns = [
  columnHelper.accessor('playNumber', { header: 'PLAY #' }),
  columnHelper.accessor('odk', { header: 'ODK' }),
  columnHelper.accessor('down', { header: 'DN' }),
  columnHelper.accessor('dist', { header: 'DIST' }),
  columnHelper.accessor('hash', { header: 'HASH' }),
  columnHelper.accessor('yardLine', { header: 'YARD LN' }),
  columnHelper.accessor('gnls', { header: 'GN/LS' }),
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

const TOTAL_COLS = columns.length;

function makeEmptyPlay(id: number): PlayEntry {
  return {
    id,
    playNumber: id,
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
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LiveEntry() {
  const [data, setData] = useState<PlayEntry[]>(() => {
    const rows: PlayEntry[] = [];
    for (let i = 1; i <= 200; i++) {
      const play = makeEmptyPlay(i);
      if (i === 1) {
        play.down = 1;
        play.dist = 10;
        play.yardLine = -25;
        play.odk = 'O';
      }
      rows.push(play);
    }
    return rows;
  });

  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  // Stable callbacks so EditableCell props don't change identity every render
  const handleSelect = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleMove = useCallback(
    (row: number, col: number) => {
      setSelectedCell({
        row: Math.max(0, Math.min(row, data.length - 1)),
        col: Math.max(0, Math.min(col, TOTAL_COLS - 1)),
      });
    },
    [data.length]
  );

  const updateRow = useCallback((rowIndex: number, columnId: string, rawValue: any) => {
    setData((prev) => {
      const next = prev.map((r) => ({ ...r }));
      const numericCols = ['down', 'dist', 'gnls', 'yardLine'];

      let formatted: any = rawValue;
      if (numericCols.includes(columnId)) {
        if (rawValue === '' || rawValue === '-') {
          formatted = rawValue; // still typing, store as-is
        } else {
          const parsed = Number(rawValue);
          formatted = isNaN(parsed) ? (next[rowIndex] as any)[columnId] : parsed;
        }
      }

      const isComplete = formatted !== '' && formatted !== '-' && !isNaN(Number(formatted));

      (next[rowIndex] as any)[columnId] = formatted;

      // ── Autofill only when we have a complete number ─────────────────────
      if (isComplete && columnId === 'yardLine' && rowIndex > 0) {
        // User typed a new yard line → compute gain/loss from previous play's yard line
        const prevYL = next[rowIndex - 1].yardLine;
        next[rowIndex].gnls = calcGainLoss(prevYL, formatted);
        // Also update the NEXT row's gnls if it has a yard line
        if (rowIndex + 1 < next.length && next[rowIndex + 1].yardLine !== '') {
          next[rowIndex + 1].gnls = calcGainLoss(formatted, next[rowIndex + 1].yardLine);
        }
      }

      if (isComplete && columnId === 'gnls' && rowIndex > 0) {
        // User typed a gain/loss → project forward yard line
        const prevYL = next[rowIndex - 1].yardLine;
        if (prevYL !== '') {
          next[rowIndex].yardLine = projectYardLine(prevYL, formatted);
        }
      }

      if (isComplete && ['gnls', 'down', 'dist'].includes(columnId) && rowIndex < next.length - 1) {
        const { down: nextDown, dist: nextDist } = computeNextDownDist(
          next[rowIndex].down,
          next[rowIndex].dist,
          next[rowIndex].gnls
        );
        next[rowIndex + 1].down = nextDown;
        next[rowIndex + 1].dist = nextDist;
      }

      return next;
    });
  }, []);

  const addNewRow = () => {
    setData((prev) => [...prev, makeEmptyPlay(prev.length + 1)]);
  };

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-[98%] mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">Kangaroos — Live Entry</h1>
              <div className="flex items-center gap-3 mt-0.5 text-xs">
                <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded">
                  Own side: −49 → 0
                </span>
                <span className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">
                  Opp side: 0 → +49
                </span>
                <span className="text-zinc-500">Advance = increasing value</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addNewRow}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm"
            >
              <Plus size={16} /> Add Row
            </button>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl text-sm font-semibold">
              <Save size={16} /> Save Game
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-zinc-700 rounded-2xl bg-zinc-900 shadow-xl">
          <table className="w-full border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-zinc-950 border-b-2 border-zinc-700 sticky top-0 z-10">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-3 text-left text-[11px] font-semibold text-zinc-400 whitespace-nowrap tracking-wide"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => {
                const isRowSelected = selectedCell.row === rowIndex;
                const yardLineVal = (row.original as PlayEntry).yardLine;
                const rowHasTDWarning = isTouchdownZone(yardLineVal);

                return (
                  <tr
                    key={row.id}
                    className={`border-b border-zinc-800 ${
                      isRowSelected ? 'bg-zinc-800/70' : 'hover:bg-zinc-800/30'
                    } ${rowHasTDWarning ? 'border-l-2 border-l-amber-500' : ''}`}
                  >
                    {row.getVisibleCells().map((cell, colIndex) => {
                      const isCellTDWarning =
                        rowHasTDWarning && cell.column.id === 'yardLine';
                      return (
                        <td
                          key={cell.id}
                          className="px-1 py-0.5 border-r border-zinc-800 last:border-r-0"
                        >
                          <EditableCell
                            value={cell.getValue()}
                            rowIndex={rowIndex}
                            columnId={cell.column.id}
                            colIndex={colIndex}
                            isSelected={
                              selectedCell.row === rowIndex &&
                              selectedCell.col === colIndex
                            }
                            isTDWarning={isCellTDWarning}
                            totalCols={TOTAL_COLS}
                            totalRows={data.length}
                            onSelect={handleSelect}
                            onMove={handleMove}
                            onUpdate={updateRow}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-zinc-600 mt-3 text-center">
          Enter yard line OR gain/loss — the other field autofills. Down &amp; distance autofills on the next row after each play resolves.
          <span className="text-amber-600 ml-2">⚠ Amber highlight = TD zone (±49)</span>
        </p>
      </div>
    </div>
  );
}