import { Download } from 'lucide-react';

/**
 * Export data as CSV download
 * @param {Object[]} data - Array of objects to export
 * @param {string} filename - Download filename (without extension)
 * @param {string[]} [columns] - Column keys to include (defaults to all keys from first row)
 */
export function exportCSV(data, filename, columns) {
  if (!data || data.length === 0) return;
  const cols = columns || Object.keys(data[0]);
  const header = cols.join(',');
  const rows = data.map((row) =>
    cols.map((col) => {
      const val = row[col];
      if (val == null) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data as JSON download
 */
export function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export button component
 */
export function ExportButton({ data, filename, columns, label = 'Export CSV', className = '' }) {
  return (
    <button
      onClick={() => exportCSV(data, filename, columns)}
      disabled={!data || data.length === 0}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
        bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/30
        disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    >
      <Download size={12} />
      {label}
    </button>
  );
}

/**
 * Multi-format export dropdown
 */
export function ExportDropdown({ data, filename, columns }) {
  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => exportCSV(data, filename, columns)}
        disabled={!data?.length}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/30 disabled:opacity-30"
      >
        <Download size={10} /> CSV
      </button>
      <button
        onClick={() => exportJSON(data, filename)}
        disabled={!data?.length}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/30 disabled:opacity-30"
      >
        <Download size={10} /> JSON
      </button>
    </div>
  );
}
