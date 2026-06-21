'use client';

import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';

interface StockData {
  id: string;
  sku: string;
  lens_type: { name: string } | null;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  addition_add: number | null;
  quantity_available: number;
}

function formatGrau(sphere: number | null, cyl: number | null, add: number | null): string {
  const esf = sphere !== null ? `ESF ${sphere > 0 ? '+' : ''}${sphere.toFixed(2)}` : '';
  const cil = cyl !== null && cyl !== 0 ? `CIL ${cyl > 0 ? '+' : ''}${cyl.toFixed(2)}` : '';
  const addition = add !== null ? `ADD +${add.toFixed(2)}` : '';
  return [esf, cil, addition].filter(Boolean).join(' / ') || 'Plano';
}

export function StockTable({ data }: { data: StockData[] }) {
  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      columns={[
        { header: 'SKU', accessor: 'sku', className: 'font-mono text-sm font-semibold' },
        { header: 'Lente Base', accessor: (row) => row.lens_type?.name || '—' },
        {
          header: 'Grau',
          accessor: (row) => (
            <span className="font-mono text-sm">
              {formatGrau(row.sphere_esf, row.cylinder_cil, row.addition_add)}
            </span>
          )
        },
        {
          header: 'Estoque',
          accessor: (row) => (
            <Badge variant={row.quantity_available > 0 ? 'success' : 'error'} dot>
              {row.quantity_available > 0 ? `${row.quantity_available} un` : 'Zerado'}
            </Badge>
          ),
          align: 'right',
        },
      ]}
      emptyMessage="Nenhum SKU cadastrado. Clique em 'Nova Variante' para adicionar itens ao estoque."
    />
  );
}

