'use client';

import { useRouter } from 'next/navigation';
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

export function StockTable({ data }: { data: StockData[] }) {
  const router = useRouter();

  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      onRowClick={(row) => router.push(`/lab/stock/${row.id}`)}
      columns={[
        { header: 'SKU', accessor: 'sku', className: 'font-mono text-sm font-medium' },
        { header: 'Lente Base', accessor: (row) => row.lens_type?.name || '-' },
        { 
          header: 'Grau', 
          accessor: (row) => {
            const esf = row.sphere_esf !== null ? `ESF: ${row.sphere_esf > 0 ? '+' : ''}${row.sphere_esf.toFixed(2)}` : '';
            const cil = row.cylinder_cil !== null ? `CIL: ${row.cylinder_cil > 0 ? '+' : ''}${row.cylinder_cil.toFixed(2)}` : '';
            const add = row.addition_add !== null ? `ADD: +${row.addition_add.toFixed(2)}` : '';
            return [esf, cil, add].filter(Boolean).join(' | ') || 'Plano/Sem Grau';
          }
        },
        { 
          header: 'Estoque', 
          accessor: (row) => (
            <Badge variant={row.quantity_available > 0 ? 'success' : 'error'}>
              {row.quantity_available} un
            </Badge>
          ) 
        },
      ]}
    />
  );
}
