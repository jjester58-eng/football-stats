'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Save, ArrowLeft, Plus } from 'lucide-react';
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
  notes?: string;
};

export default function LiveEntryPage() {
  const { side } = useParams<{ side: 'offense' | 'defense' }>();
  const router = useRouter();
  
  const [data, setData] = useState<PlayEntry[]>([
    {
      id: 1,
      playNumber: 1,
      down: 1,
      dist: 10,
      hash: 'R',
      yardLine: 25,
      playType: '',
      result: '',
      yards: '',
      offFormation: '',
      motion: '',
      offPlay: '',
      rpo: '',
      playDirection: '',
      defFront: '',
      stunt: '',
      blitz: '',
      coverage: '',
    }
  ]);

  const columnHelper = createColumnHelper<PlayEntry>();

  const columns = [
    columnHelper.accessor('playNumber', { header: 'PLAY #' }),
    columnHelper.accessor('down', { header: 'DN' }),
    columnHelper.accessor('dist', { header: 'DIST' }),
    columnHelper.accessor('hash', { header: 'HASH' }),
    columnHelper.accessor('yardLine', { header: 'YARD LN' }),
    columnHelper.accessor('playType', { header: 'PLAY TYPE' }),
    columnHelper.accessor('result', { header: 'RESULT' }),
    columnHelper.accessor('yards', { header: 'GN/LS' }),

    // Offense columns
    ...(side === 'offense' ? [
      columnHelper.accessor('offFormation', { header: 'OFF FORM' }),
      columnHelper.accessor('motion', { header: 'MOTION' }),
      columnHelper.accessor('offPlay', { header: 'OFF PLAY' }),
      columnHelper.accessor('rpo', { header: 'RPO' }),
      columnHelper.accessor('playDirection', { header: 'PLAY DIR' }),
    ] : []),

    // Defense columns
    ...(side === 'defense' ? [
      columnHelper.accessor('defFront', { header: 'DEFENSE' }),
      columnHelper.accessor('stunt', { header: 'STUNT' }),
      columnHelper.accessor('blitz', { header: 'BLITZ' }),
      columnHelper.accessor('coverage', { header: 'COVERAGE' }),
    ] : []),
  ];

  // Editable Cell Component
  function EditableCell({ 
    value, 
    rowIndex, 
    columnId 
  }: { 
    value: any; 
    rowIndex: number; 
    columnId: string;
  }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value?.toString() || '');

    const handleSave = () => {
      setEditing(false);
      const newData = [...data];
      
      let finalValue: any = val;
      
      // Convert numbers where needed
      if (['down', 'dist', 'yardLine', 'yards'].includes(columnId)) {
        finalValue = val === '' ? '' : Number(val);
      }
      
      (newData[rowIndex] as any)[columnId] = finalValue;
      setData(newData);
    };

    return editing ? (
      <input
        autoFocus
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-full bg-zinc-900 border border-blue-500 text-white px-3 py-1 outline-none text-center"
      />
    ) : (
      <div
        onClick={() => setEditing(true)}
        className="min-h-[32px] px-3 py-1 cursor-text hover:bg-zinc-800 rounded flex items-center"
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
      down: '',
      dist: '',
      hash: '',
      yardLine: '',
      playType: '',
      result: '',
      yards: '',
      offFormation: '',
      motion: '',
      offPlay: '',
      rpo: '',
      playDirection: '',
      defFront: '',
      stunt: '',
      blitz: '',
      coverage: '',
    };
    setData([...data, newPlay]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
            <h1 className="text-4xl font-bold tracking-tight">
              {side === 'offense' ? 'Offense' : 'Defense'} Live Entry
            </h1>
            <div className="px-4 py-1.5 bg-blue-600/20 border border-blue-600 rounded-full text-sm text-blue-400">
              vs Opponent • Q1
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addNewRow}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl transition-colors"
            >
              <Plus size={20} /> New Play
            </button>
            
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-semibold transition-colors">
              <Save size={20} /> Save Game
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-zinc-700 rounded-3xl bg-zinc-900 shadow-xl">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-zinc-700 bg-zinc-950 sticky top-0 z-10">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-4 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
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
                    <td key={cell.id} className="px-2 py-1 border-r border-zinc-800 last:border-r-0">
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

        <div className="mt-6 text-sm text-zinc-500 flex justify-between">
          <p>💡 Click any cell to edit • Tab / Enter to navigate • "New Play" to add rows</p>
          <p className="text-emerald-500">0 plays saved • Auto-save coming soon</p>
        </div>
      </div>
    </div>
  );
}