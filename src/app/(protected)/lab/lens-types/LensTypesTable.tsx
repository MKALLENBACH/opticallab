'use client';

import { useRouter } from 'next/navigation';
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

export function LensTypesTable({ data }: { data: LensTypeData[] }) {
  const router = useRouter();

  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      onRowClick={(row) => router.push(`/lab/lens-types/${row.id}`)}
      columns={[
        { header: 'Nome', accessor: 'name', className: 'font-medium' },
        { header: 'Marca', accessor: (row) => row.brand || '-' },
        { header: 'Categoria', accessor: (row) => row.category?.replace(/_/g, ' ') || '-' },
        { header: 'Material', accessor: (row) => row.material?.replace(/_/g, ' ') || '-' },
        { 
          header: 'Status', 
          accessor: (row) => (
            <Badge variant={row.status === EntityStatus.ACTIVE ? 'success' : 'default'}>
              {row.status === EntityStatus.ACTIVE ? 'Ativo' : 'Inativo'}
            </Badge>
          ) 
        },
      ]}
    />
  );
}
