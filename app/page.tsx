'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';

type PlayEntry = {
  id: number;
  playNumber: number;
  down: number | '';
  dist: number | '';
  hash: string;
  yardLine: number | '';
  playType: string;
  result: string;
  yards: number | '';
  offFormation: string;
  motion: string;
  offPlay: string;
  rpo: string;
  playDirection: string;
  defFront: string;
  stunt: string;
  blitz: string;
  coverage: string;
};

export default function UnifiedLiveEntry() {
  const [viewMode, setViewMode] = useState<'offense' | 'defense' | 'both'>('both');
  const [data, setData] = useState<PlayEntry[]>([
    {
      id: 1, playNumber: 1, down: 1, dist: 10, hash: 'R', yardLine: 25,
      playType: '', result: '', yards: '',
      offFormation: '', motion: '', offPlay: '', rpo: '', playDirection: '',
      defFront: '', stunt: '', blitz: '', coverage: ''
    }
  ]);

  const columnHelper = createColumnHelper<PlayEntry>();

  const baseColumns = [
    columnHelper.accessor('playNumber', { header: 'PLAY #' }),
    columnHelper.accessor('down', { header: 'DN' }),
    columnHelper.accessor('dist', { header: 'DIST' }),
    columnHelper.accessor('hash', { header: 'HASH' }),
    columnHelper.accessor('yardLine', { header: 'YARD LN' }),
    columnHelper.accessor('playType', { header: 'PLAY TYPE' }),
    columnHelper.accessor('result', { header: 'RESULT' }),
    columnHelper.accessor('yards', { header: 'GN/LS' }),
  ];

  const offenseColumns = [
    columnHelper.accessor('offFormation', { header: 'OFF FORM' }),
    columnHelper.accessor('motion', { header: 'MOTION' }),
    columnHelper.accessor('offPlay', { header: 'OFF PLAY' }),
    columnHelper.accessor('rpo', { header: 'RPO' }),
    columnHelper.accessor('playDirection', { header: 'DIR' }),
  ];

  const defenseColumns = [
    columnHelper.accessor('defFront', { header: 'DEF FRONT' }),
    columnHelper.accessor('stunt', { header: 'STUNT' }),
    columnHelper.accessor('blitz', { header: 'BLITZ' }),
    columnHelper.accessor('coverage', { header: 'COVERAGE' }),
  ];

  let columns = [...baseColumns];
  if (viewMode === 'offense') columns = [...columns, ...offenseColumns];
  if (viewMode === 'defense') columns = [...columns, ...defenseColumns];
  if (viewMode === 'both') columns = [...columns, ...offenseColumns, ...defenseColumns];

  // Editable Cell (same as before)
  function EditableCell({ value, rowIndex, columnId }: { value: any; rowIndex: number; columnId: string }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value?.toString() || '');

    const handleSave = () => {
      setEditing(false);
      const newData = [...data];
      let finalValue: any = val;
      if (['down', 'dist', 'yardLine', 'yards'].includes(columnId)) {
        finalValue = val === '' ? '' : Number(val);
      }
      (newData[rowIndex] as any)[columnId] = finalValue;
      setData(newData);
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
        className="min-h-[34px] px-3 py-1 cursor-text hover:bg-zinc-800 rounded flex items-center"
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
      down: '', dist: '', hash: '', yardLine: '',
      playType: '', result: '', yards: '',
      offFormation: '', motion: '', offPlay: '', rpo: '', playDirection: '',
      defFront: '', stunt: '', blitz: '', coverage: ''
    };
    setData([...data, newPlay]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
              <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-4xl font-bold">Live Play Entry</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('both')}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'both' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
              >
                Both
              </button>
              <button
                onClick={() => setViewMode('offense')}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'offense' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
              >
                Offense
              </button>
              <button
                onClick={() => setViewMode('defense')}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'defense' ? 'bg-blue-600' : 'hover:bg-zinc-800'}`}
              >
                Defense
              </button>
            </div>

            <button
              onClick={addNewRow}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl"
            >
              <Plus size={20} /> New Play
            </button>

            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-semibold">
              <Save size={20} /> Save Game
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-zinc-700 rounded-3xl bg-zinc-900">
          <table className="w-full border-collapse min-w-[1600px]">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-zinc-950 border-b border-zinc-700">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-4 text-left text-xs font-medium text-zinc-400">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr key={row.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-2 py-1 border-r border-zinc-800">
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