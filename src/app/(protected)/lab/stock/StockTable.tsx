'use client';

import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';
import { AvailabilityBadge, StatusBadge } from '@/components/ui/Premium';
import { getTreatmentLabel } from '@/lib/constants/treatments';

interface StockData {
  id: string;
  sku: string;
  lens_type: {
    name: string;
    brand: string | null;
    material: string | null;
    treatments: string[] | null;
  } | null;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  quantity_available: number;
  minimum_stock: number | null;
  delivery_time_in_stock_days: number | null;
  production_time_out_of_stock_days: number | null;
  status: string;
}

function formatPower(value: number | null, prefix: string, sign = true): string {
  if (value === null) return '';
  return `${prefix} ${sign && value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

function formatGrade(row: StockData): string {
  const esf = formatPower(row.sphere_esf, 'ESF');
  const cil = row.cylinder_cil !== null && row.cylinder_cil !== 0 ? formatPower(row.cylinder_cil, 'CIL') : '';
  const axis = row.axis !== null ? `Eixo ${row.axis}` : '';
  const add = row.addition_add !== null ? formatPower(row.addition_add, 'ADD') : '';
  return [esf, cil, axis, add].filter(Boolean).join(' / ') || 'Plano';
}

function formatLeadTime(value: number | null): string {
  if (value === 0) return 'Pronta entrega';
  return value ? `${value} dias` : 'sob confirmacao';
}

function formatStockLeadTime(row: StockData): string {
  return row.quantity_available > 0
    ? formatLeadTime(row.delivery_time_in_stock_days)
    : formatLeadTime(row.production_time_out_of_stock_days);
}

export function StockTable({ data }: { data: StockData[] }) {
  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      searchPlaceholder="Buscar por SKU, lente, material ou grau..."
      emptyTitle="Nenhum SKU cadastrado"
      emptyMessage="Cadastre variantes de estoque para liberar pedidos mais rapidos para as oticas."
      columns={[
        { header: 'SKU', accessor: 'sku', className: 'font-mono font-extrabold text-white' },
        {
          header: 'Lente',
          accessor: (row) => (
            <div>
              <p className="font-bold text-white">{row.lens_type?.name || '-'}</p>
              <p className="mt-1 text-[0.78rem] font-medium text-slate-500">{row.lens_type?.brand || 'Sem marca'} - {row.lens_type?.material || 'Material nao informado'}</p>
            </div>
          ),
        },
        {
          header: 'Grau',
          accessor: (row) => <span className="font-mono text-[0.84rem] font-bold text-slate-100">{formatGrade(row)}</span>,
        },
        {
          header: 'Tratamento',
          accessor: (row) => (
            <div className="flex max-w-xs flex-wrap gap-1.5">
              {row.lens_type?.treatments?.length ? row.lens_type.treatments.slice(0, 2).map((treatment) => (
                <Badge key={treatment} variant="info" size="sm">{getTreatmentLabel(treatment)}</Badge>
              )) : <span className="text-slate-500">-</span>}
            </div>
          ),
        },
        {
          header: 'Estoque',
          accessor: (row) => (
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-mono text-[1rem] font-extrabold text-white">{row.quantity_available} un</span>
              <AvailabilityBadge quantity={row.quantity_available} minimumStock={row.minimum_stock} />
            </div>
          ),
          align: 'right',
        },
        {
          header: 'Prazo',
          accessor: (row) => formatStockLeadTime(row),
          align: 'right',
        },
        {
          header: 'Status',
          accessor: (row) => <StatusBadge status={row.status} />,
          align: 'right',
        },
        {
          header: 'Acoes',
          accessor: (row) => (
            <Link
              href={`/lab/stock/${row.id}`}
              aria-label={`Editar ${row.sku}`}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/35 px-3.5 py-2 text-[0.8125rem] font-bold text-slate-200 transition-all hover:border-violet-300/25 hover:bg-white/[0.055] hover:text-white"
            >
              <Edit3 size={14} />
              Editar
            </Link>
          ),
          align: 'right',
        },
      ]}
    />
  );
}
