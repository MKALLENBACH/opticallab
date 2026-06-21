import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function ResponsiveDataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick,
  emptyMessage = "Nenhum registro encontrado."
}: ResponsiveDataTableProps<T>) {

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg">
        <p className="text-[var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--color-bg-surface-hover)] border-b border-[var(--color-border)]">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className={`px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.map((row) => (
            <tr 
              key={keyExtractor(row)} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                transition-colors 
                ${onRowClick ? 'cursor-pointer hover:bg-[var(--color-bg-surface-hover)]' : ''}
              `}
            >
              {columns.map((col, index) => (
                <td 
                  key={index} 
                  className={`px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-base)] ${col.className || ''}`}
                >
                  {typeof col.accessor === 'function' 
                    ? col.accessor(row) 
                    : String(row[col.accessor] ?? '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
