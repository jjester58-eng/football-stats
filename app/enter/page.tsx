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
  yardLine: number | '';
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

  // Prevent auto overwrite
  manualOverride?: boolean;
};

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
    manualOverride: false,
  });
}

// ONLY first row starts 1st & 10
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
  // TABLE COLUMNS
  // ================================
  const columnHelper = createColumnHelper<PlayEntry>();

  const columns = [
    columnHelper.accessor('playNumber', {
      header: 'PLAY #',
    }),

    columnHelper.accessor('odk', {
      header: 'ODK',
    }),

    columnHelper.accessor('down', {
      header: 'DN',
    }),

    columnHelper.accessor('dist', {
      header: 'DIST',
    }),

    columnHelper.accessor('hash', {
      header: 'HASH',
    }),

    columnHelper.accessor('gnls', {
      header: 'GN/LS',
    }),

    columnHelper.accessor('yardLine', {
      header: 'YARD LN',
    }),

    columnHelper.accessor('playType', {
      header: 'PLAY TYPE',
    }),

    columnHelper.accessor('result', {
      header: 'RESULT',
    }),

    columnHelper.accessor('offFormation', {
      header: 'OFF FORM',
    }),

    columnHelper.accessor('defense', {
      header: 'DEFENSE',
    }),

    columnHelper.accessor('motion', {
      header: 'MOTION',
    }),

    columnHelper.accessor('offPlay', {
      header: 'OFF PLAY',
    }),

    columnHelper.accessor('rpo', {
      header: 'RPO',
    }),

    columnHelper.accessor('playDir', {
      header: 'DIR',
    }),

    columnHelper.accessor('stunt', {
      header: 'STUNT',
    }),

    columnHelper.accessor('blitz', {
      header: 'BLITZ',
    }),

    columnHelper.accessor('coverage', {
      header: 'COVERAGE',
    }),
  ];

  // ================================
  // GAIN / LOSS CALC
  // ================================
 const normalizeFieldPosition = (
  yard: number
): number => {

  // Own side:
  // -20 becomes 20
  // -45 becomes 45

  if (yard < 0) {
    return Math.abs(yard);
  }

  // Opponent side:
  // 45 becomes 55
  // 30 becomes 70
  // 15 becomes 85

  return 50 + (50 - yard);
};

const calculateGainLoss = (
  prevYard: number | '',
  currentYard: number | ''
): number | '' => {

  if (
    prevYard === '' ||
    currentYard === ''
  ) {
    return '';
  }

  const prev =
    normalizeFieldPosition(prevYard);

  const current =
    normalizeFieldPosition(currentYard);

  return current - prev;
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

  // Must have complete values first
  if (
    current.down === '' ||
    current.dist === '' ||
    current.gnls === ''
  ) {
    return;
  }

  const down = Number(current.down);
  const distance = Number(current.dist);
  const gain = Number(current.gnls);

  let nextDown: number | '' = '';
  let nextDistance: number | '' = '';

  // =========================
  // FIRST DOWN
  // =========================
  if (gain >= distance) {

    nextDown = 1;

    // Goal-to-go logic
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

  // =========================
  // NORMAL PROGRESSION
  // =========================
  else if (down < 4) {

    nextDown = down + 1;

    nextDistance = Math.max(
      1,
      distance - gain
    );
  }

  // =========================
  // 4TH DOWN FAILED
  // =========================
  else {

    // DO NOT AUTO TURNOVER
    // Leave blank for operator decision

    nextDown = '';
    nextDistance = '';
  }

  // =========================
  // ONLY FILL BLANKS
  // =========================
  if (
    next.down === '' &&
    !next.manualOverride
  ) {
    next.down = nextDown;
  }

  if (
    next.dist === '' &&
    !next.manualOverride
  ) {
    next.dist = nextDistance;
  }
};

  // ================================
  // UPDATE CELL
  // ================================
  const updateRow = (
    rowIndex: number,
    columnId: string,
    newValue: any
  ) => {
    const newData = [...data];

    (newData[rowIndex] as any)[columnId] =
      newValue;

    // Manual override protection
    if (
      ['down', 'dist', 'gnls'].includes(
        columnId
      )
    ) {
      newData[rowIndex].manualOverride = true;
    }

    // Auto gain/loss from yard line
    if (
      columnId === 'yardLine' &&
      rowIndex > 0
    ) {
      newData[rowIndex - 1].gnls =
        calculateGainLoss(
          newData[rowIndex - 1].yardLine,
          newValue
        );
    }

    // Auto next down/dist
    if (
      ['gnls', 'down', 'dist'].includes(
        columnId
      ) &&
      rowIndex < newData.length - 1 &&
      !newData[rowIndex + 1]
        .manualOverride
    ) {
      updateNextDownDistance(
        newData,
        rowIndex
      );
    }

    setData(newData);
  };

  // ================================
  // NAVIGATION
  // ================================
  const moveToCell = (
    row: number,
    col: number
  ) => {
    const newRow = Math.max(
      0,
      Math.min(row, data.length - 1)
    );

    const newCol = Math.max(
      0,
      Math.min(col, columns.length - 1)
    );

    setSelectedCell({
      row: newRow,
      col: newCol,
    });
  };

  // ================================
  // EDITABLE CELL
  // ================================
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
    const isSelected =
      selectedCell.row === rowIndex &&
      selectedCell.col === colIndex;

    const inputRef =
      useRef<HTMLInputElement>(null);

   useEffect(() => {
  if (
    isSelected &&
    inputRef.current &&
    document.activeElement !== inputRef.current
  ) {
    inputRef.current.focus();
  }
}, [isSelected]);
    return (
      <input
        ref={inputRef}
        value={value ?? ''}
        onChange={(e) =>
          updateRow(
            rowIndex,
            columnId,
            e.target.value
          )
        }
        onClick={() =>
          setSelectedCell({
            row: rowIndex,
            col: colIndex,
          })
        }
        onKeyDown={(e) => {
          switch (e.key) {
            case 'Enter':
              e.preventDefault();
              moveToCell(
                rowIndex + 1,
                colIndex
              );
              break;

            case 'Tab':
              e.preventDefault();

              if (e.shiftKey) {
                moveToCell(
                  rowIndex,
                  colIndex - 1
                );
              } else {
                moveToCell(
                  rowIndex,
                  colIndex + 1
                );
              }

              break;

            case 'ArrowDown':
              e.preventDefault();
              moveToCell(
                rowIndex + 1,
                colIndex
              );
              break;

            case 'ArrowUp':
              e.preventDefault();
              moveToCell(
                rowIndex - 1,
                colIndex
              );
              break;

            case 'ArrowRight':
              if (
                inputRef.current &&
                inputRef.current
                  .selectionStart ===
                  inputRef.current.value
                    .length
              ) {
                e.preventDefault();

                moveToCell(
                  rowIndex,
                  colIndex + 1
                );
              }

              break;

            case 'ArrowLeft':
              if (
                inputRef.current &&
                inputRef.current
                  .selectionStart === 0
              ) {
                e.preventDefault();

                moveToCell(
                  rowIndex,
                  colIndex - 1
                );
              }

              break;
          }
        }}
        className={`w-full min-h-[38px] px-3 py-1 bg-transparent outline-none border text-center transition-colors ${
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
    getCoreRowModel:
      getCoreRowModel(),
  });

  // ================================
  // ADD ROW
  // ================================
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
      manualOverride: false,
    };

    setData([...data, newPlay]);
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[95%] mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                window.history.back()
              }
              className="flex items-center gap-2 text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={22} />
              Back
            </button>

            <div>
              <h1 className="text-4xl font-bold">
                Kangaroos Live Entry
              </h1>

              <p className="text-emerald-500 flex items-center gap-2">
                <Users size={18} />
                Spreadsheet Navigation
              </p>
            </div>
          </div>

          <div className="flex gap-3">

            <button
              onClick={addNewRow}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl"
            >
              <Plus size={20} />
              Add Row
            </button>

            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-2xl font-semibold">
              <Save size={20} />
              Save Game
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border border-zinc-700 rounded-3xl bg-zinc-900 shadow-xl">

          <table className="w-full border-collapse">

            <thead>
              {table
                .getHeaderGroups()
                .map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-zinc-950 border-b-2 border-zinc-600 sticky top-0 z-10"
                  >
                    {headerGroup.headers.map(
                      (header) => (
                        <th
                          key={header.id}
                          className="px-4 py-4 text-left text-xs font-semibold text-zinc-300 whitespace-nowrap"
                        >
                          {flexRender(
                            header.column
                              .columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      )
                    )}
                  </tr>
                ))}
            </thead>

            <tbody>
              {table
                .getRowModel()
                .rows.map(
                  (row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={`border-b border-zinc-800 ${
                        selectedCell.row ===
                        rowIndex
                          ? 'bg-zinc-800/70'
                          : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      {row
                        .getVisibleCells()
                        .map(
                          (
                            cell,
                            colIndex
                          ) => (
                            <td
                              key={cell.id}
                              className="px-2 py-1 border-r border-zinc-800 last:border-r-0"
                            >
                              <EditableCell
                                value={cell.getValue()}
                                rowIndex={
                                  rowIndex
                                }
                                columnId={
                                  cell.column.id
                                }
                                colIndex={
                                  colIndex
                                }
                              />
                            </td>
                          )
                        )}
                    </tr>
                  )
                )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}