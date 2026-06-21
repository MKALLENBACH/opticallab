'use client';

import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';
import { EntityStatus, UserRole } from '@/lib/types/enums';

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: EntityStatus;
  lab?: { name: string } | null;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  platform_admin: 'Admin Global',
  lab_admin: 'Admin Laboratório',
  lab_user: 'Usuário Laboratório',
  optical_admin: 'Admin Ótica',
  optical_user: 'Usuário Ótica',
};

export function UsersTable({ data }: { data: UserData[] }) {
  return (
    <ResponsiveDataTable
      data={data}
      keyExtractor={(row) => row.id}
      columns={[
        { header: 'Nome', accessor: 'full_name', className: 'font-medium' },
        { header: 'Email', accessor: 'email' },
        { 
          header: 'Nível de Acesso', 
          accessor: (row) => ROLE_LABELS[row.role] || row.role
        },
        { 
          header: 'Vínculo', 
          accessor: (row) => row.lab?.name || '-'
        },
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
