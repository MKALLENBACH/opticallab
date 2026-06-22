'use client';

import { useRouter } from 'next/navigation';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { StatusBadge } from '@/components/ui/Premium';
import { EntityStatus } from '@/lib/types/enums';

interface LabData {
  id: string;
  name: string;
  slug: string;
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
      searchPlaceholder="Buscar por laboratorio, slug ou email..."
      emptyTitle="Nenhum laboratorio cadastrado"
      emptyMessage="Crie o primeiro laboratorio para iniciar a operacao da plataforma."
      columns={[
        { header: 'Nome', accessor: 'name', className: 'font-bold text-white' },
        { header: 'Slug', accessor: (row) => <span className="font-mono text-[0.84rem]">{row.slug}</span> },
        { header: 'Email', accessor: (row) => row.email || '-' },
        { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
        { header: 'Criado em', accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'), align: 'right' },
      ]}
    />
  );
}
