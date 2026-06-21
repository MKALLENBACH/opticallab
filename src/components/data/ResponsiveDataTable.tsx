import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function ResponsiveDataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado.',
  emptyIcon,
}: ResponsiveDataTableProps<T>) {

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-3">
        {emptyIcon ?? (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-bg-surface-2)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
        )}
        <p className="text-sm font-medium text-[var(--color-text-base)]">Nenhum resultado</p>
        <p className="text-[0.8125rem] text-[var(--color-text-muted)] max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface-2)' }}>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`
                  px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-widest
                  text-[var(--color-text-muted)]
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
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              style={{ borderBottom: '1px solid var(--color-border)' }}
              className={`
                transition-colors duration-100 last:border-0
                ${onRowClick
                  ? 'cursor-pointer hover:bg-[var(--color-bg-surface-2)]'
                  : 'hover:bg-[var(--color-bg-surface-2)/50]'}
              `}
            >
              {columns.map((col, index) => (
                <td
                  key={index}
                  className={`
                    px-5 py-3.5 text-[0.875rem] text-[var(--color-text-base)]
                    ${alignClass[col.align ?? 'left']}
                    ${col.className || ''}
                  `}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : String(row[col.accessor] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
