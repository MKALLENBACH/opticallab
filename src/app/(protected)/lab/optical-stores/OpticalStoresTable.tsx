'use client';

import { useRouter } from 'next/navigation';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';
import { EntityStatus } from '@/lib/types/enums';

interface OpticalStoreData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: EntityStatus;
  created_at: string;
}

export function OpticalStoresTable({ data }: { data: OpticalStoreData[] }) {
  const router = useRouter();

  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      onRowClick={(row) => router.push(`/lab/optical-stores/${row.id}`)}
      columns={[
        { header: 'Nome da Ótica', accessor: 'name', className: 'font-medium' },
        { header: 'Email', accessor: (row) => row.email || '-' },
        { header: 'Telefone', accessor: (row) => row.phone || '-' },
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
