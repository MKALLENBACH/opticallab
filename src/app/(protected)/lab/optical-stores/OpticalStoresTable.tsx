'use client';

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
  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      columns={[
        { header: 'Nome da Ótica', accessor: 'name', className: 'font-medium' },
        { header: 'Email', accessor: (row) => row.email || '—' },
        { header: 'Telefone', accessor: (row) => row.phone || '—' },
        {
          header: 'Cadastro',
          accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'),
        },
        {
          header: 'Status',
          accessor: (row) => (
            <Badge variant={row.status === EntityStatus.ACTIVE ? 'success' : 'default'} dot>
              {row.status === EntityStatus.ACTIVE ? 'Ativa' : 'Inativa'}
            </Badge>
          )
        },
      ]}
      emptyMessage="Nenhuma ótica cadastrada ainda. Clique em 'Nova Ótica' para começar."
    />
  );
}

