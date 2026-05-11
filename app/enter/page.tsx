'use client';

import { useState } from 'react';
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
  o: string;
  dk: string;
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
      id: 1,
      playNumber: 1,
      o: 'O',
      dk: 'K',
      down: 1,
      dist: 10,
      hash: 'R',
      gnls: '',
      yardLine: 'M-40',
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
    },
  ]);

  const columnHelper = createColumnHelper<PlayEntry>();

  const columns = [
    columnHelper.accessor('playNumber', { header: 'PLAY #' }),
    columnHelper.accessor('o', { header: 'O' }),
    columnHelper.accessor('dk', { header: 'DK' }),
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

  const updateRow = (rowIndex: number, columnId: string, newValue: any) => {
    const newData = [...data];
    (newData[rowIndex] as any)[columnId] = newValue;

    const row = newData[rowIndex];

    // Auto GN/LS when Yard Line changes
    if (columnId === 'yardLine' && rowIndex > 0) {
      const prevYard = newData[rowIndex - 1].yardLine;
      if (prevYard && row.yardLine) {
        newData[rowIndex - 1].gnls = calculateGainLoss(prevYard, row.yardLine);
      }
    }

    // Auto update next Down & Distance
    if (['gnls', 'down', 'dist'].includes(columnId) && rowIndex < newData.length - 1) {
      updateNextDownDistance(newData, rowIndex);
    }

    setData(newData);
  };

  const calculateGainLoss = (prev: string, current: string): number | '' => {
    const prevMatch = prev.match(/\d+/);
    const currMatch = current.match(/\d+/);
    if (!prevMatch || !currMatch) return '';
    return parseInt(currMatch[0]) - parseInt(prevMatch[0]);
  };

  const updateNextDownDistance = (plays: PlayEntry[], index: number) => {
    const current = plays[index];
    const next = plays[index + 1];
    if (!next || current.gnls === '') return;

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

  function EditableCell({
    value,
    rowIndex,
    columnId,
  }: {
    value: any;
    rowIndex: number;
    columnId: string;
  }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value?.toString() || '');

    const handleSave = () => {
      setEditing(false);
      updateRow(rowIndex, columnId, val === '' ? '' : val);
    };

    return editing ? (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="w-full bg-zinc-900 border border-blue-500 px-3 py-1 text-center outline-none"
      />
    ) : (
      <div
        onClick={() => setEditing(true)}
        className="min-h-[38px] px-3 py-1 cursor-text hover:bg-zinc-800 flex items-center"
      >
        {value ?? ''}
      </div>
    );
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const addNewRow = () => {
    const newPlay: PlayEntry = {
      id: data.length + 1,
      playNumber: data.length + 1,
      o: 'O',
      dk: '',
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[95%] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={22} /> Back
            </button>
            <div>
              <h1 className="text-4xl font-bold">Kangaroos Live Entry</h1>
              <p className="text-emerald-500 flex items-center gap-2">
                <Users size={18} /> Smart Logic Active
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addNewRow}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl"
            >
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
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-zinc-950 border-b-2 border-zinc-600 sticky top-0 z-10"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-4 text-left text-xs font-semibold text-zinc-300 whitespace-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/70"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 py-1 border-r border-zinc-800 last:border-r-0"
                    >
                      <EditableCell
                        value={cell.getValue()}
                        rowIndex={rowIndex}
                        columnId={cell.column.id}
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