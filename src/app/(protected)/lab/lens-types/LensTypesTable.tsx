'use client';

import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/Premium';
import { getTreatmentLabel } from '@/lib/constants/treatments';
import { EntityStatus, LensCategory, LensMaterial } from '@/lib/types/enums';

interface LensTypeData {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: LensCategory | null;
  material: LensMaterial | null;
  treatments: string[];
  default_delivery_time_in_stock_days: number | null;
  default_production_time_out_of_stock_days: number | null;
  status: EntityStatus;
}

const CATEGORY_LABELS: Record<string, string> = {
  monofocal: 'Monofocal',
  bifocal: 'Bifocal',
  multifocal_progressiva: 'Multifocal',
  ocupacional: 'Ocupacional',
  solar_grau: 'Solar grau',
  tratamento_especial: 'Tratamento especial',
  outro: 'Outro',
};

const MATERIAL_LABELS: Record<string, string> = {
  cr39: 'CR-39',
  policarbonato: 'Policarbonato',
  trivex: 'Trivex',
  resina: 'Resina',
  alto_indice: 'Alto indice',
  mineral: 'Mineral',
  outro: 'Outro',
};

export function LensTypesTable({ data }: { data: LensTypeData[] }) {
  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      searchPlaceholder="Buscar por nome, marca, material ou tratamento..."
      emptyTitle="Nenhuma lente cadastrada"
      emptyMessage="Cadastre a primeira lente base para montar estoque e receber pedidos."
      columns={[
        {
          header: 'Lente',
          accessor: (row) => (
            <div>
              <p className="font-bold text-white">{row.name}</p>
              <p className="mt-1 text-[0.78rem] font-medium text-slate-500">{row.brand || 'Sem marca'} {row.model ? `- ${row.model}` : ''}</p>
            </div>
          ),
        },
        { header: 'Categoria', accessor: (row) => row.category ? (CATEGORY_LABELS[row.category] || row.category) : '-' },
        { header: 'Material', accessor: (row) => row.material ? (MATERIAL_LABELS[row.material] || row.material) : '-' },
        {
          header: 'Tratamentos',
          accessor: (row) => (
            <div className="flex max-w-xs flex-wrap gap-1.5">
              {row.treatments.length ? row.treatments.slice(0, 3).map((treatment) => (
                <Badge key={treatment} variant="info" size="sm">{getTreatmentLabel(treatment)}</Badge>
              )) : <span className="text-slate-500">-</span>}
              {row.treatments.length > 3 && <Badge size="sm">+{row.treatments.length - 3}</Badge>}
            </div>
          ),
        },
        {
          header: 'Prazos',
          accessor: (row) => `${row.default_delivery_time_in_stock_days ?? '-'}d estoque / ${row.default_production_time_out_of_stock_days ?? '-'}d producao`,
        },
        {
          header: 'Status',
          accessor: (row) => <StatusBadge status={row.status} />,
          align: 'right',
        },
      ]}
    />
  );
}
