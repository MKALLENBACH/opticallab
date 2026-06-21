'use client';

import { useRouter } from 'next/navigation';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';
import { EntityStatus } from '@/lib/types/enums';

interface LabData {
  id: string;
  name: string;
  email: string | null;
  status: EntityStatus;
  created_at: string;
}

export function LabsTable({ data }: { data: LabData[] }) {
  const router = useRouter();

  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      onRowClick={(row) => router.push(`/admin/labs/${row.id}`)}
      columns={[
        { header: 'Nome', accessor: 'name', className: 'font-medium' },
        { header: 'Email', accessor: (row) => row.email || '-' },
        { 
          header: 'Status', 
          accessor: (row) => (
            <Badge variant={row.status === EntityStatus.ACTIVE ? 'success' : 'default'}>
              {row.status === EntityStatus.ACTIVE ? 'Ativo' : 'Inativo'}
            </Badge>
          ) 
        },
        { 
          header: 'Criado em', 
          accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR') 
        },
      ]}
    />
  );
}
