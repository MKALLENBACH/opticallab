'use client';

import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { StatusBadge } from '@/components/ui/Premium';
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
      searchPlaceholder="Buscar por nome, email ou telefone..."
      emptyTitle="Nenhuma otica cadastrada"
      emptyMessage="Cadastre sua primeira otica parceira para comecar a receber pedidos."
      columns={[
        { header: 'Nome da otica', accessor: 'name', className: 'font-bold text-white' },
        { header: 'Email', accessor: (row) => row.email || '-' },
        { header: 'Telefone', accessor: (row) => row.phone || '-' },
        {
          header: 'Cadastro',
          accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'),
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
