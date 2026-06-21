'use client';

import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';
import { EntityStatus, LensCategory, LensMaterial } from '@/lib/types/enums';

interface LensTypeData {
  id: string;
  name: string;
  brand: string | null;
  category: LensCategory | null;
  material: LensMaterial | null;
  status: EntityStatus;
}

const CATEGORY_LABELS: Record<string, string> = {
  monofocal: 'Monofocal',
  bifocal: 'Bifocal',
  multifocal_progressiva: 'Multifocal Progressiva',
  ocupacional: 'Ocupacional',
  solar_grau: 'Solar com Grau',
  tratamento_especial: 'Tratamento Especial',
  outro: 'Outro',
};

const MATERIAL_LABELS: Record<string, string> = {
  cr39: 'CR-39',
  policarbonato: 'Policarbonato',
  trivex: 'Trivex',
  resina: 'Resina',
  alto_indice: 'Alto Índice',
  mineral: 'Mineral',
  outro: 'Outro',
};

export function LensTypesTable({ data }: { data: LensTypeData[] }) {
  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      columns={[
        { header: 'Nome', accessor: 'name', className: 'font-medium' },
        { header: 'Marca', accessor: (row) => row.brand || '—' },
        { header: 'Categoria', accessor: (row) => row.category ? (CATEGORY_LABELS[row.category] || row.category) : '—' },
        { header: 'Material', accessor: (row) => row.material ? (MATERIAL_LABELS[row.material] || row.material) : '—' },
        {
          header: 'Status',
          accessor: (row) => (
            <Badge variant={row.status === EntityStatus.ACTIVE ? 'success' : 'default'} dot>
              {row.status === EntityStatus.ACTIVE ? 'Ativo' : 'Inativo'}
            </Badge>
          )
        },
      ]}
      emptyMessage="Nenhuma lente cadastrada. Clique em 'Nova Lente' para adicionar ao catálogo."
    />
  );
}

