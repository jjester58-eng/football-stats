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
  down: number | null;
  dist: number | null;
  hash: string;
  gnls: number | null;
  yardLine: number | null;
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
  manualOverride?: boolean;
};

// ================================
// SAFE PARSER (fixes NaN + "-" input issue)
// ================================
function parseNumericInput(value: string): number | null {
  if (value === '' || value === '-') return null;

  const num = Number(value);

  if (Number.isNaN(num)) return null;

  return num;
}

export default function LiveEntry() {

  // ================================
  // INITIAL DATA
  // ================================
  const [data, setData] = useState<PlayEntry[]>(() => {
    const rows: PlayEntry[] = [];

    for (let i = 1; i <= 200; i++) {
      rows.push({
        id: i,
        playNumber: i,
        odk: i % 3 === 0 ? 'D' : 'O',
        down: null,
        dist: null,
        hash: '',
        gnls: null,
        yardLine: null,
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
        manualOverride: false,
      });
    }

    // First play 1st & 10
    if (rows.length > 0) {
      rows[0].down = 1;
      rows[0].dist = 10;
    }

    return rows;
  });

  const [selectedCell, setSelectedCell] = useState({
    row: 0,
    col: 0,
  });

  // ================================
  // COLUMN SETUP
  // ================================
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

  // ================================
  // GAIN / LOSS
  // ================================
  const calculateGainLoss = (
    prevYard: number | null,
    currentYard: number | null
  ): number | null => {

    if (prevYard == null || currentYard == null) return null;

    return currentYard - prevYard;
  };

  // ================================
  // AUTO DOWN / DISTANCE
  // ================================
  const updateNextDownDistance = (
    plays: PlayEntry[],
    index: number
  ) => {

    const current = plays[index];
    const next = plays[index + 1];

    if (!next) return;

    if (
      current.down == null ||
      current.dist == null ||
      current.gnls == null
    ) return;

    const down = current.down;
    const distance = current.dist;
    const gain = current.gnls;

    let nextDown: number | null = null;
    let nextDistance: number | null = null;

    // FIRST DOWN
    if (gain >= distance) {

      nextDown = 1;

      if (
        typeof next.yardLine === 'number' &&
        next.yardLine > 0 &&
        next.yardLine <= 10
      ) {
        nextDistance = next.yardLine;
      } else {
        nextDistance = 10;
      }
    }

    // NORMAL PROGRESSION
    else if (down < 4) {
      nextDown = down + 1;
      nextDistance = Math.max(1, distance - gain);
    }

    // 4TH DOWN (no auto change)
    else {
      nextDown = null;
      nextDistance = null;
    }

    if (next.down == null && !next.manualOverride) {
      next.down = nextDown;
    }

    if (next.dist == null && !next.manualOverride) {
      next.dist = nextDistance;
    }
  };

  // ================================
  // UPDATE ROW
  // ================================
  const updateRow = (
    rowIndex: number,
    columnId: string,
    newValue: any
  ) => {

    const newData = [...data];

    const numericFields = ['down', 'dist', 'gnls', 'yardLine'];

    const formattedValue = numericFields.includes(columnId)
      ? parseNumericInput(newValue)
      : newValue;

    (newData[rowIndex] as any)[columnId] = formattedValue;

    // manual override
    if (['down', 'dist'].includes(columnId)) {
      newData[rowIndex].manualOverride = true;
    }

    // gain/loss calc
    if (columnId === 'yardLine' && rowIndex > 0) {

      const prev = newData[rowIndex - 1].yardLine;
      const curr = formattedValue;

      newData[rowIndex - 1].gnls =
        calculateGainLoss(prev, curr);

      updateNextDownDistance(newData, rowIndex - 1);
    }

    // manual edits
    if (
      ['gnls', 'down', 'dist'].includes(columnId) &&
      rowIndex < newData.length - 1
    ) {
      updateNextDownDistance(newData, rowIndex);
    }

    setData(newData);
  };

  // ================================
  // NAVIGATION
  // ================================
  const moveToCell = (row: number, col: number) => {
    setSelectedCell({
      row: Math.max(0, Math.min(row, data.length - 1)),
      col: Math.max(0, Math.min(col, columns.length - 1)),
    });
  };

  // ================================
  // CELL
  // ================================
  function EditableCell({
    value,
    rowIndex,
    columnId,
    colIndex,
  }: any) {

    const isSelected =
      selectedCell.row === rowIndex &&
      selectedCell.col === colIndex;

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
        onChange={(e) =>
          updateRow(rowIndex, columnId, e.target.value)
        }
        onClick={() =>
          setSelectedCell({ row: rowIndex, col: colIndex })
        }
        className={`w-full min-h-[38px] px-3 py-1 text-center bg-transparent outline-none border ${
          isSelected
            ? 'border-blue-500 bg-zinc-800'
            : 'border-transparent hover:border-zinc-700'
        }`}
      />
    );
  }

  // ================================
  // TABLE
  // ================================
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ================================
  // ADD ROW
  // ================================
  const addNewRow = () => {
    setData([
      ...data,
      {
        id: data.length + 1,
        playNumber: data.length + 1,
        odk: 'O',
        down: null,
        dist: null,
        hash: '',
        gnls: null,
        yardLine: null,
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
        manualOverride: false,
      },
    ]);
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[95%] mx-auto">

        <div className="flex justify-between mb-6">

          <button onClick={() => window.history.back()}>
            <ArrowLeft />
            Back
          </button>

          <div className="flex gap-3">
            <button onClick={addNewRow}>
              <Plus /> Add Row
            </button>

            <button>
              <Save /> Save
            </button>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row, rIdx) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell, cIdx) => (
                    <td key={cell.id}>
                      <EditableCell
                        value={cell.getValue()}
                        rowIndex={rIdx}
                        columnId={cell.column.id}
                        colIndex={cIdx}
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