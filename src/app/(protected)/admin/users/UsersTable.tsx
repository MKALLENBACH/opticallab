'use client';

import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { RoleBadge, StatusBadge } from '@/components/ui/Premium';
import { EntityStatus, UserRole } from '@/lib/types/enums';

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: EntityStatus;
  lab?: { name: string } | null;
  optical_store?: { name: string } | null;
  created_at: string;
}

export function UsersTable({ data }: { data: UserData[] }) {
  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      searchPlaceholder="Buscar por usuario, email, role ou vinculo..."
      emptyTitle="Nenhum usuario encontrado"
      emptyMessage="Crie usuarios para administrar laboratorios, oticas e a plataforma."
      columns={[
        {
          header: 'Usuario',
          accessor: (row) => (
            <div>
              <p className="font-bold text-white">{row.full_name}</p>
              <p className="mt-1 text-[0.78rem] font-medium text-slate-500">{row.email}</p>
            </div>
          ),
        },
        { header: 'Role', accessor: (row) => <RoleBadge role={row.role} /> },
        { header: 'Vinculo', accessor: (row) => row.lab?.name || row.optical_store?.name || '-' },
        { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
        { header: 'Criado em', accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'), align: 'right' },
      ]}
    />
  );
}
