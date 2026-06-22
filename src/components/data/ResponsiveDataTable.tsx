'use client';

import React, { useMemo, useState } from 'react';
import { Search, Table2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
}

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyIcon?: React.ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  summaryLabel?: string;
}

function rowSearchText<T>(row: T): string {
  try {
    return JSON.stringify(row).toLowerCase();
  } catch {
    return '';
  }
}

export function ResponsiveDataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado.',
  emptyTitle = 'Nenhum resultado',
  emptyIcon,
  searchPlaceholder = 'Buscar nesta lista...',
  showSearch = true,
  summaryLabel,
}: ResponsiveDataTableProps<T>) {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data || [];
    return (data || []).filter((row) => rowSearchText(row).includes(normalized));
  }, [data, query]);

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const renderCell = (row: T, col: Column<T>) => (
    typeof col.accessor === 'function'
      ? col.accessor(row)
      : String(row[col.accessor] ?? '-')
  );

  const hasData = Boolean(data?.length);
  const hasFilteredData = Boolean(filteredData.length);

  return (
    <div className="w-full">
      {showSearch && hasData && (
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.018] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/62 py-2.5 pl-10 pr-3 text-[0.9rem] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/15"
            />
          </div>

          <div className="flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-slate-500">
            <Table2 size={15} />
            {summaryLabel || `${filteredData.length} de ${data.length} registros`}
          </div>
        </div>
      )}

      {!hasData || !hasFilteredData ? (
        <div className="flex w-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          {emptyIcon ?? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-violet-500/10 text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <Table2 size={24} />
            </div>
          )}
          <p className="text-[1rem] font-extrabold text-white">
            {!hasData ? emptyTitle : 'Nada encontrado'}
          </p>
          <p className="max-w-sm text-[0.88rem] font-medium text-slate-400">
            {!hasData ? emptyMessage : 'Tente ajustar a busca para encontrar o registro desejado.'}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden w-full overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.025]">
                  {columns.map((col, index) => (
                    <th
                      key={`${col.header}-${index}`}
                      className={`
                        px-5 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.16em]
                        text-slate-500
                        ${alignClass[col.align ?? 'left']}
                        ${col.className || ''}
                      `}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr
                    key={keyExtractor(row)}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      border-b border-white/[0.065] transition-colors duration-150 last:border-0
                      ${onRowClick ? 'cursor-pointer hover:bg-violet-500/[0.055]' : 'hover:bg-white/[0.025]'}
                    `}
                  >
                    {columns.map((col, index) => (
                      <td
                        key={`${col.header}-${index}`}
                        className={`
                          px-5 py-4 text-[0.9rem] font-medium text-slate-200
                          ${alignClass[col.align ?? 'left']}
                          ${col.className || ''}
                        `}
                      >
                        {renderCell(row, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
            {filteredData.map((row) => (
              onRowClick ? (
                <button
                  key={keyExtractor(row)}
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:border-violet-300/25 hover:bg-white/[0.055]"
                >
                  <div className="flex flex-col gap-3">
                    {columns.filter((col) => !col.hideOnMobile).map((col, index) => (
                      <div key={`${col.header}-${index}`} className="flex items-start justify-between gap-4">
                        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                          {col.header}
                        </span>
                        <div className="min-w-0 text-right text-[0.88rem] font-semibold text-slate-100">
                          {renderCell(row, col)}
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              ) : (
                <div
                  key={keyExtractor(row)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="flex flex-col gap-3">
                    {columns.filter((col) => !col.hideOnMobile).map((col, index) => (
                      <div key={`${col.header}-${index}`} className="flex items-start justify-between gap-4">
                        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                          {col.header}
                        </span>
                        <div className="min-w-0 text-right text-[0.88rem] font-semibold text-slate-100">
                          {renderCell(row, col)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
}
