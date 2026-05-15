// app/enter/page.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { useSupabase } from '@/types/useSupabase';
import type { Play } from '@/types/supabase';

interface Column {
  key: string;
  label: string;
  width: number;
  editable: boolean;
  type: 'text' | 'number';
  group?: string;
  help?: string;
}

type RowData = Partial<Play> & {
  playNum: number;
  newYardLn?: string | number;
  nextDn?: string | number;
  newDist?: string | number;
};

// ─── Auto-calculation: down/distance/gain-loss logic ───────────────────────
const calculateStats = (row: RowData): RowData => {
  const updated = { ...row };
  const gnLsRaw = String(updated.gn_ls ?? '').trim().toLowerCase();
  const gainLoss = parseFloat(gnLsRaw);
  const currentYard = Number(updated.yard_ln);
  const currentDown = Number(updated.dn);
  const distance = Number(updated.dist);

  const hasGain = !isNaN(gainLoss);
  const hasYard = !isNaN(currentYard) && currentYard > 0;
  const hasDown = !isNaN(currentDown) && currentDown > 0;
  const hasDist = !isNaN(distance) && distance > 0;

  // Special results take priority
  const isSack = gnLsRaw.includes('sack');
  const isTurnover = gnLsRaw.includes('turnover') || gnLsRaw.includes('to');

  if (isSack) {
    updated.result = 'SACK';
  } else if (isTurnover) {
    updated.result = 'TURNOVER';
    updated.nextDn = 'TOV';
    updated.newDist = '-';
    updated.newYardLn = '-';
    return updated;
  }

  // New yard line
  if (hasYard && hasGain) {
    updated.newYardLn = Math.max(0, Math.min(100, currentYard + gainLoss));
  }

  // Next down + new distance
  if (hasDown && hasDist && hasGain) {
    const gained = gainLoss;
    if (gained >= distance) {
      // First down earned
      updated.nextDn = 1;
      updated.newDist = 10;
      if (!isSack) updated.result = gained >= distance ? 'FIRST DOWN' : updated.result;
    } else if (currentDown < 4) {
      updated.nextDn = currentDown + 1;
      updated.newDist = Math.max(1, distance - gainLoss);
    } else {
      // 4th down stop = turnover on downs
      updated.nextDn = 'TOD';
      updated.newDist = '-';
      updated.result = 'TURNOVER ON DOWNS';
    }
  }

  return updated;
};

export default function LiveEntry() {
  const { supabase, isReady, error: supabaseError } = useSupabase();
  const [rows, setRows] = useState<RowData[]>([]);
  const [activeCell, setActiveCell] = useState<{ row: number; col: string }>({ row: 0, col: 'odk' });
  const [syncStatus, setSyncStatus] = useState<'ready' | 'syncing' | 'error'>('ready');
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showCalculations, setShowCalculations] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const columns: Column[] = [
    { key: 'play_number', label: 'PLAY #',   width: 70,  editable: false, type: 'number', group: 'core' },
    { key: 'odk',         label: 'ODK',      width: 60,  editable: true,  type: 'text',   group: 'core' },
    { key: 'dn',          label: 'DN',       width: 50,  editable: true,  type: 'number', group: 'core' },
    { key: 'dist',        label: 'DIST',     width: 60,  editable: true,  type: 'number', group: 'core' },
    { key: 'hash',        label: 'HASH',     width: 70,  editable: true,  type: 'text',   group: 'core' },
    { key: 'gn_ls',       label: 'GN/LS',   width: 70,  editable: true,  type: 'text',   group: 'core', help: 'e.g. 5, -3, sack, turnover' },
    { key: 'yard_ln',     label: 'YARD LN', width: 80,  editable: true,  type: 'number', group: 'core' },
    { key: 'play_type',   label: 'PLAY TYPE',width: 100, editable: true,  type: 'text',   group: 'play' },
    { key: 'result',      label: 'RESULT',  width: 100, editable: true,  type: 'text',   group: 'play' },
    { key: 'off_form',    label: 'OFF FORM', width: 100, editable: true,  type: 'text',   group: 'formation' },
    { key: 'defense',     label: 'DEFENSE', width: 100, editable: true,  type: 'text',   group: 'formation' },
    { key: 'motion',      label: 'MOTION',  width: 90,  editable: true,  type: 'text',   group: 'formation' },
    { key: 'off_play',    label: 'OFF PLAY', width: 120, editable: true,  type: 'text',   group: 'play' },
    { key: 'rpo',         label: 'RPO',      width: 70,  editable: true,  type: 'text',   group: 'play' },
    { key: 'play_dir',    label: 'PLAY DIR', width: 100, editable: true,  type: 'text',   group: 'play' },
    { key: 'stunt',       label: 'STUNT',   width: 80,  editable: true,  type: 'text',   group: 'defense' },
    { key: 'blitz',       label: 'BLITZ',   width: 80,  editable: true,  type: 'text',   group: 'defense' },
    { key: 'coverage',    label: 'COVERAGE',width: 100, editable: true,  type: 'text',   group: 'defense' },
  ];

  const calculatedColumns: Column[] = [
    { key: 'newYardLn', label: 'NEW YD LN', width: 90, editable: false, type: 'number', help: 'Auto-calculated' },
    { key: 'nextDn',    label: 'NEXT DN',   width: 70, editable: false, type: 'text',   help: 'Auto-calculated' },
    { key: 'newDist',   label: 'NEW DIST',  width: 80, editable: false, type: 'number', help: 'Auto-calculated' },
  ];

  const allColumns = showCalculations ? [...columns, ...calculatedColumns] : columns;

  // Initialize 200 rows
  useEffect(() => {
    setRows(
      Array.from({ length: 200 }, (_, i) => ({
        play_number: i + 1,
        playNum: i + 1,
        odk: '', dn: undefined, dist: undefined, hash: '',
        gn_ls: '', yard_ln: undefined, play_type: '', result: '',
        off_form: '', defense: '', motion: '', off_play: '',
        rpo: '', play_dir: '', stunt: '', blitz: '', coverage: '',
        newYardLn: '', nextDn: '', newDist: '',
      }))
    );
  }, []);

  // Initialize game
  useEffect(() => {
    if (isReady && supabase && !gameId) initializeGame();
  }, [isReady, supabase]);

  const initializeGame = async () => {
    if (!supabase) return;
    try {
      const { data, error: err } = await supabase
        .from('games')
        .insert([{ opponent: 'Central Tigers', date: new Date().toISOString(), status: 'live' }])
        .select();
      if (err) throw err;
      if (data?.[0]) setGameId(data[0].id);
    } catch (err) {
      setError(`Game init: ${err instanceof Error ? err.message : err}`);
    }
  };

  const syncToSupabase = async (rowData: RowData) => {
    if (!supabase || !gameId) return;
    setSyncStatus('syncing');
    try {
      const { error: err } = await supabase.from('plays').upsert(
        {
          id: `${gameId}-${rowData.playNum}`,
          game_id: gameId,
          play_number: rowData.playNum,
          odk: rowData.odk || null,
          dn: typeof rowData.dn === 'number' ? rowData.dn : null,
          dist: typeof rowData.dist === 'number' ? rowData.dist : null,
          hash: rowData.hash || null,
          gn_ls: rowData.gn_ls || null,
          yard_ln: typeof rowData.yard_ln === 'number' ? rowData.yard_ln : null,
          play_type: rowData.play_type || null,
          result: rowData.result || null,
          off_form: rowData.off_form || null,
          defense: rowData.defense || null,
          motion: rowData.motion || null,
          off_play: rowData.off_play || null,
          rpo: rowData.rpo || null,
          play_dir: rowData.play_dir || null,
          stunt: rowData.stunt || null,
          blitz: rowData.blitz || null,
          coverage: rowData.coverage || null,
          synced_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (err) throw err;
      setSyncStatus('ready');
    } catch (err) {
      setSyncStatus('error');
      setError(`Sync failed: ${err instanceof Error ? err.message : err}`);
      setTimeout(() => setSyncStatus('ready'), 3000);
    }
  };

  const handleCellChange = (rowIdx: number, colKey: string, value: string) => {
    const newRows = [...rows];
    (newRows[rowIdx] as any)[colKey] = value === '' ? undefined : value;
    newRows[rowIdx] = calculateStats(newRows[rowIdx]);
    setRows(newRows);
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => syncToSupabase(newRows[rowIdx]), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = activeCell;
    const currentColIdx = allColumns.findIndex(c => c.key === col);
    const editableCols = allColumns.filter(c => c.editable);

    switch (e.key) {
      case 'Tab': {
        e.preventDefault();
        const editableIdx = editableCols.findIndex(c => c.key === col);
        if (e.shiftKey) {
          if (editableIdx > 0) setActiveCell({ row, col: editableCols[editableIdx - 1].key });
        } else {
          if (editableIdx < editableCols.length - 1) setActiveCell({ row, col: editableCols[editableIdx + 1].key });
        }
        break;
      }
      case 'Enter':
        e.preventDefault();
        if (row < rows.length - 1) setActiveCell({ row: row + 1, col });
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < rows.length - 1) setActiveCell({ row: row + 1, col });
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) setActiveCell({ row: row - 1, col });
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentColIdx < allColumns.length - 1) {
          const next = allColumns.slice(currentColIdx + 1).find(c => c.editable);
          if (next) setActiveCell({ row, col: next.key });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentColIdx > 0) {
          const prev = allColumns.slice(0, currentColIdx).reverse().find(c => c.editable);
          if (prev) setActiveCell({ row, col: prev.key });
        }
        break;
    }
  };

  const handleExportCSV = () => {
    const filled = rows.filter(r => columns.some(c => c.editable && (r as any)[c.key]));
    const csv = [
      columns.map(c => c.label).join('\t'),
      ...filled.map(row => columns.map(c => (row as any)[c.key] ?? '').join('\t')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kangaroos-game-${new Date().toISOString().split('T')[0]}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    document.getElementById(`cell-${activeCell.row}-${activeCell.col}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeCell]);

  const filledRows = rows.filter(r => columns.some(c => c.editable && (r as any)[c.key])).length;
return (
  <div className="p-4">
    <h1>Live Entry</h1>
  </div>
);
  // ... your JSX unchanged, just ensure supabase null checks are in place
}